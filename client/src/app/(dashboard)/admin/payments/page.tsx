'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, paymentStatusVariant } from '@/components/ui/status-badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ClipboardList, Download, Eye, FileText } from 'lucide-react';
import { generateMaintenancePDF } from '@/lib/generateReceipt';

interface MaintenanceWithUser {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  flat_no: string;
  month: number;
  year: number;
  amount: number;
  late_fee: number;
  total_amount: number;
  due_date: string;
  paid_date?: string;
  status: 'pending' | 'paid' | 'overdue';
  razorpay_payment_id?: string;
}

interface Stats {
  month: number;
  year: number;
  byStatus: {
    paid: { count: number; totalAmount: number };
    pending: { count: number; totalAmount: number };
    overdue: { count: number; totalAmount: number };
  };
  totals: {
    totalFlats: number;
    totalExpected: number;
    totalCollected: number;
    totalPending: number;
  };
}

interface Pagination {
  current: number;
  pages: number;
  total: number;
  limit: number;
}

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [maintenance, setMaintenance] = useState<MaintenanceWithUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedRecordForDetails, setSelectedRecordForDetails] = useState<MaintenanceWithUser | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>(String(new Date().getMonth() + 1));
  const [yearFilter, setYearFilter] = useState<string>(String(new Date().getFullYear()));

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams();
      params.append('page', String(pagination.current));
      params.append('limit', String(pagination.limit));
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (monthFilter) params.append('month', monthFilter);
      if (yearFilter) params.append('year', yearFilter);

      const [maintenanceRes, statsRes] = await Promise.all([
        api.get(`/maintenance/all?${params.toString()}`),
        api.get(`/maintenance/stats?month=${monthFilter}&year=${yearFilter}`),
      ]);

      if (maintenanceRes.data.success) {
        setMaintenance(maintenanceRes.data.data);
        setPagination(maintenanceRes.data.pagination);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.limit, statusFilter, monthFilter, yearFilter, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateMaintenance = async () => {
    try {
      setGenerating(true);
      const res = await api.post('/maintenance/generate', {
        month: parseInt(monthFilter),
        year: parseInt(yearFilter),
      });

      if (res.data.success) {
        toast({
          title: 'Success',
          description: res.data.message,
        });
        setShowGenerateDialog(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error generating maintenance:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate maintenance records',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = (record: MaintenanceWithUser) => {
    generateMaintenancePDF({
      transactionId: record.razorpay_payment_id || undefined,
      amount: record.total_amount,
      baseAmount: record.amount || 1000,
      lateFee: record.late_fee || 0,
      month: record.month,
      year: record.year,
      flatNo: record.flat_no,
      dueDate: record.due_date,
      status: record.status,
      paymentDate: record.paid_date,
      userName: record.user_id?.name || 'Resident',
    });

    toast({
      title: 'PDF Downloaded',
      description: `Maintenance ${record.status === 'paid' ? 'receipt' : 'statement'} for Flat ${record.flat_no} downloaded.`,
    });
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || 'Unknown';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = ['2024', '2025', '2026', '2027'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Payments & Maintenance</h1>
          <p className="text-gray-600 mt-1">Society-wide maintenance records and payment tracking</p>
        </div>
        {user?.role === 'manager' && (
          <Button onClick={() => setShowGenerateDialog(true)} className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white">
            <ClipboardList className="w-4 h-4 mr-2" /> Generate Monthly Dues
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 font-medium">Total Flats</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totals.totalFlats}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-green-600 font-medium">Collected</p>
                <p className="text-3xl font-bold text-green-700">{formatAmount(stats.totals.totalCollected)}</p>
                <p className="text-xs text-green-600">{stats.byStatus.paid.count} flats paid</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-amber-600 font-medium">Pending</p>
                <p className="text-3xl font-bold text-amber-700">{formatAmount(stats.byStatus.pending.totalAmount)}</p>
                <p className="text-xs text-amber-600">{stats.byStatus.pending.count} flats pending</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-red-600 font-medium">Overdue</p>
                <p className="text-3xl font-bold text-red-700">{formatAmount(stats.byStatus.overdue.totalAmount)}</p>
                <p className="text-xs text-red-600">{stats.byStatus.overdue.count} flats overdue</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="w-full sm:w-auto">
              <label className="text-sm text-gray-500 mb-1 block">Month</label>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-auto">
              <label className="text-sm text-gray-500 mb-1 block">Year</label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-auto">
              <label className="text-sm text-gray-500 mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {getMonthName(parseInt(monthFilter))} {yearFilter} - Society Maintenance Records
          </CardTitle>
          <CardDescription>
            Society rule: ₹1,000 monthly maintenance due on the 18th. ₹100 late fee applies thereafter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : maintenance.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No maintenance records found</p>
              {user?.role === 'manager' && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowGenerateDialog(true)}
                >
                  Generate Records
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Flat</TableHead>
                    <TableHead>Resident</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Paid Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenance.map((m) => (
                    <TableRow key={m._id}>
                      <TableCell className="font-semibold text-gray-900">{m.flat_no}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{m.user_id?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{m.user_id?.email || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-900">{formatAmount(m.total_amount)}</span>
                        {m.late_fee > 0 && (
                          <span className="text-xs text-red-600 block">
                            +{formatAmount(m.late_fee)} late fee
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{formatDate(m.due_date)}</TableCell>
                      <TableCell>
                        <StatusBadge variant={paymentStatusVariant[m.status]} dot>
                          {m.status === 'paid' ? 'Paid' : m.status === 'overdue' ? 'Overdue' : 'Pending'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {m.paid_date ? formatDate(m.paid_date) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedRecordForDetails(m)}
                            className="text-gray-700 hover:text-teal-700 hover:bg-teal-50"
                          >
                            <Eye className="w-4 h-4 mr-1 text-teal-600" />
                            Details
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadPDF(m)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    Showing {(pagination.current - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.current * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} records
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.current === 1}
                      onClick={() => setPagination((p) => ({ ...p, current: p.current - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.current === pagination.pages}
                      onClick={() => setPagination((p) => ({ ...p, current: p.current + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Maintenance Details Dialog for Manager */}
      <Dialog
        open={Boolean(selectedRecordForDetails)}
        onOpenChange={(open) => !open && setSelectedRecordForDetails(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Maintenance Statement Details
            </DialogTitle>
            <DialogDescription>
              Atharva Society • Flat {selectedRecordForDetails?.flat_no}
            </DialogDescription>
          </DialogHeader>

          {selectedRecordForDetails && (
            <div className="space-y-4 py-2">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Billing Period:</span>
                  <span className="font-bold text-gray-900">
                    {getMonthName(selectedRecordForDetails.month)} {selectedRecordForDetails.year}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Resident:</span>
                  <span className="font-semibold text-gray-900">{selectedRecordForDetails.user_id?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-gray-700">{selectedRecordForDetails.user_id?.email || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Flat Number:</span>
                  <span className="font-bold text-gray-900">{selectedRecordForDetails.flat_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Due Date:</span>
                  <span className="font-semibold text-red-600">{formatDate(selectedRecordForDetails.due_date)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status:</span>
                  <StatusBadge variant={paymentStatusVariant[selectedRecordForDetails.status]} dot>
                    {selectedRecordForDetails.status === 'paid' ? 'Paid' : selectedRecordForDetails.status === 'overdue' ? 'Overdue' : 'Pending'}
                  </StatusBadge>
                </div>
              </div>

              <div className="border rounded-lg p-3.5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Maintenance</span>
                  <span className="font-medium text-gray-900">{formatAmount(selectedRecordForDetails.amount || 1000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Late Fee</span>
                  <span className={`font-medium ${selectedRecordForDetails.late_fee > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatAmount(selectedRecordForDetails.late_fee || 0)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total {selectedRecordForDetails.status === 'paid' ? 'Paid' : 'Payable'}</span>
                  <span className={selectedRecordForDetails.status === 'paid' ? 'text-green-600' : 'text-teal-700'}>
                    {formatAmount(selectedRecordForDetails.total_amount)}
                  </span>
                </div>
              </div>

              {selectedRecordForDetails.status === 'paid' && selectedRecordForDetails.paid_date && (
                <div className="bg-green-50 text-xs p-3 rounded-lg border border-green-200 space-y-1">
                  <div className="flex justify-between text-green-900">
                    <span className="font-medium">Paid On:</span>
                    <span>{formatDate(selectedRecordForDetails.paid_date)}</span>
                  </div>
                  {selectedRecordForDetails.razorpay_payment_id && (
                    <div className="flex justify-between text-green-900">
                      <span className="font-medium">Payment ID:</span>
                      <span className="font-mono">{selectedRecordForDetails.razorpay_payment_id}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => selectedRecordForDetails && handleDownloadPDF(selectedRecordForDetails)}
              className="text-teal-700 border-teal-200 hover:bg-teal-50"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Download PDF
            </Button>
            <Button variant="ghost" onClick={() => setSelectedRecordForDetails(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Monthly Maintenance</DialogTitle>
            <DialogDescription>
              This will create maintenance records for all registered flats for{' '}
              {getMonthName(parseInt(monthFilter))} {yearFilter}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              • Base amount: <strong>₹1,000</strong> per flat<br />
              • Due date: <strong>18th</strong> of the month<br />
              • Late fee: <strong>₹100</strong> after due date<br />
              • Existing records will be skipped
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateMaintenance} disabled={generating} className="bg-teal-600 hover:bg-teal-700 text-white">
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
