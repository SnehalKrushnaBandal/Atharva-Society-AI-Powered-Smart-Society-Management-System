const Maintenance = require('../models/Maintenance');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const SocietyService = require('../models/SocietyService');
const LiftEmergency = require('../models/LiftEmergency');

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Gathers role-authorized society context for the AI assistant.
 * Strict read-only role isolation:
 * - Residents access ONLY their own maintenance dues & complaints, plus public society notices, events, services, emergencies.
 * - Managers access society-wide aggregate summaries, complaint stats, notices, events, services.
 */
async function getAuthorizedContext(user) {
  const role = user.role;
  const userId = user._id;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const contextData = {
    userInfo: {
      name: user.name || 'User',
      role: user.role,
      flat_no: user.flat_no || null,
      wing: user.wing || null,
    },
    todayDate: currentDate.toISOString().split('T')[0],
    currentPeriod: { month: currentMonth, monthName: MONTH_NAMES[currentMonth], year: currentYear },
  };

  // Public/shared context for all authenticated users
  try {
    const [notices, events, services, activeLiftEmergencies] = await Promise.all([
      Notice.find({ is_active: true })
        .select('title category description priority date location is_pinned')
        .sort({ is_pinned: -1, date: -1 })
        .limit(10)
        .lean(),
      Event.find({ is_active: true })
        .select('title category description event_date event_time location organizer')
        .sort({ event_date: 1 })
        .limit(5)
        .lean(),
      SocietyService.find({ is_active: true })
        .select('name category contact_person phone timing description is_emergency')
        .sort({ is_emergency: -1, name: 1 })
        .lean(),
      LiftEmergency.find({ status: 'active' })
        .select('flat_no triggered_at status notes')
        .sort({ triggered_at: -1 })
        .lean(),
    ]);

    // Format notice dates as readable strings
    contextData.activeNotices = notices.map((n) => ({
      title: n.title,
      category: n.category,
      description: n.description,
      priority: n.priority,
      date: n.date ? new Date(n.date).toISOString().split('T')[0] : null,
      location: n.location,
      is_pinned: n.is_pinned,
    }));

    // Format event dates and tag past events
    contextData.events = events.map((e) => {
      const eventDate = e.event_date ? new Date(e.event_date) : null;
      const isPast = eventDate ? eventDate < currentDate : false;
      return {
        title: e.title,
        category: e.category,
        description: e.description,
        event_date: eventDate ? eventDate.toISOString().split('T')[0] : null,
        event_time: e.event_time || null,
        location: e.location,
        organizer: e.organizer || null,
        isPastEvent: isPast,
      };
    });

    contextData.services = services;
    contextData.activeLiftEmergencies = activeLiftEmergencies;
  } catch (err) {
    console.error('Error fetching public society context:', err.message);
  }

  // Resident / Tenant specific context
  if (role === 'resident' || role === 'owner' || role === 'tenant') {
    try {
      const [maintenanceRecords, userComplaints] = await Promise.all([
        Maintenance.find({ user_id: userId })
          .select('month year amount late_fee total_amount due_date paid_date status')
          .sort({ year: -1, month: -1 })
          .limit(12)
          .lean(),
        Complaint.find({ user_id: userId })
          .select('description status admin_notes created_at updated_at')
          .sort({ created_at: -1 })
          .limit(5)
          .lean(),
      ]);

      // Categorize bills clearly for AI temporal reasoning
      const currentBill = maintenanceRecords.find(
        (m) => m.month === currentMonth && m.year === currentYear
      ) || null;

      const outstandingBills = maintenanceRecords.filter(
        (m) => m.status !== 'paid' && !(m.month === currentMonth && m.year === currentYear)
      );

      const pastBills = maintenanceRecords
        .filter((m) => m.status === 'paid' || (m.year < currentYear || (m.year === currentYear && m.month < currentMonth)))
        .filter((m) => !(m.month === currentMonth && m.year === currentYear))
        .slice(0, 6);

      // Check whether a future bill exists in the database
      const futureBill = maintenanceRecords.find(
        (m) => m.year > currentYear || (m.year === currentYear && m.month > currentMonth)
      ) || null;

      // Format bills with month names for readability
      const formatBill = (m) => ({
        month: m.month,
        monthName: MONTH_NAMES[m.month] || `Month ${m.month}`,
        year: m.year,
        amount: m.amount,
        late_fee: m.late_fee,
        total_amount: m.total_amount,
        due_date: m.due_date ? new Date(m.due_date).toISOString().split('T')[0] : null,
        paid_date: m.paid_date ? new Date(m.paid_date).toISOString().split('T')[0] : null,
        status: m.status,
      });

      const totalOutstanding = (currentBill && currentBill.status !== 'paid' ? currentBill.total_amount : 0)
        + outstandingBills.reduce((sum, m) => sum + (m.total_amount || 0), 0);

      contextData.residentContext = {
        currentMonthBill: currentBill ? formatBill(currentBill) : 'No bill generated for the current month yet.',
        outstandingUnpaidBills: outstandingBills.map(formatBill),
        totalOutstandingAmount: totalOutstanding,
        nextFutureBill: futureBill ? formatBill(futureBill) : 'No future bill has been generated yet. The next bill will be generated when the billing cycle begins.',
        recentPaidHistory: pastBills.filter((m) => m.status === 'paid').map(formatBill).slice(0, 4),
        myComplaints: userComplaints,
      };
    } catch (err) {
      console.error('Error fetching resident context:', err.message);
    }
  }

  // Manager / Admin specific context
  if (role === 'manager' || role === 'admin') {
    try {
      const [maintenanceStats, complaintStats, recentComplaints] = await Promise.all([
        Maintenance.aggregate([
          { $match: { month: currentMonth, year: currentYear } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalAmount: { $sum: '$total_amount' },
            },
          },
        ]),
        Complaint.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),
        Complaint.find({ status: { $in: ['open', 'in-progress'] } })
          .select('flat_no description status created_at')
          .sort({ created_at: -1 })
          .limit(10)
          .lean(),
      ]);

      const maintenanceSummary = {
        month: currentMonth,
        monthName: MONTH_NAMES[currentMonth],
        year: currentYear,
        paidCount: 0,
        paidSum: 0,
        pendingCount: 0,
        pendingSum: 0,
        overdueCount: 0,
        overdueSum: 0,
      };

      maintenanceStats.forEach((stat) => {
        if (stat._id === 'paid') {
          maintenanceSummary.paidCount = stat.count;
          maintenanceSummary.paidSum = stat.totalAmount;
        } else if (stat._id === 'pending') {
          maintenanceSummary.pendingCount = stat.count;
          maintenanceSummary.pendingSum = stat.totalAmount;
        } else if (stat._id === 'overdue') {
          maintenanceSummary.overdueCount = stat.count;
          maintenanceSummary.overdueSum = stat.totalAmount;
        }
      });

      const complaintsSummary = {
        open: 0,
        inProgress: 0,
        resolved: 0,
      };

      complaintStats.forEach((stat) => {
        if (stat._id === 'open') complaintsSummary.open = stat.count;
        if (stat._id === 'in-progress') complaintsSummary.inProgress = stat.count;
        if (stat._id === 'resolved') complaintsSummary.resolved = stat.count;
      });

      contextData.managerContext = {
        maintenanceSummary,
        complaintsSummary,
        recentPendingComplaints: recentComplaints,
      };
    } catch (err) {
      console.error('Error fetching manager context:', err.message);
    }
  }

  return contextData;
}

module.exports = { getAuthorizedContext };
