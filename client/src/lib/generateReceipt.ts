import { jsPDF } from 'jspdf';

export interface ReceiptData {
  transactionId: string;
  amount: number;
  month: number;
  year: number;
  flatNo: string;
  paymentDate: string;
  userName: string;
  lateFee?: number;
}

export interface MaintenancePDFData {
  transactionId?: string;
  amount: number;
  baseAmount?: number;
  lateFee?: number;
  month: number;
  year: number;
  flatNo: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paymentDate?: string;
  userName: string;
}

const getMonthName = (month: number) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Unknown';
};

const formatCurrencyPDF = (amount: number) => {
  return 'Rs. ' + amount.toLocaleString('en-IN');
};

const formatDatePDF = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Generate a comprehensive, professionally branded Maintenance Statement / Bill / Receipt PDF
 */
export const generateMaintenancePDF = (data: MaintenancePDFData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  let y = 0;

  // ===== HEADER BANNER =====
  doc.setFillColor(15, 118, 110); // Teal-700
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ATHARVA SOCIETY', pageWidth / 2, 18, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Intelligent Society Management System', pageWidth / 2, 27, { align: 'center' });

  doc.setFontSize(9);
  doc.text('Smart Residential Community Portal', pageWidth / 2, 35, { align: 'center' });

  y = 56;

  // ===== DOCUMENT TITLE =====
  const isPaid = data.status === 'paid';
  const docTitle = isPaid ? 'MAINTENANCE PAYMENT RECEIPT' : 'MAINTENANCE BILL & STATEMENT';

  doc.setTextColor(15, 118, 110);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(docTitle, pageWidth / 2, y, { align: 'center' });

  y += 12;

  // ===== BILL / REFERENCE BOX =====
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'FD');

  doc.setTextColor(107, 114, 128);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  // Left Column - Ref No & Month
  doc.text('Reference No:', margin + 6, y + 8);
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const refNo = isPaid && data.transactionId
    ? `AS-REC-${data.year}${String(data.month).padStart(2, '0')}-${data.transactionId.slice(-6).toUpperCase()}`
    : `AS-BILL-${data.year}${String(data.month).padStart(2, '0')}-FLAT${data.flatNo}`;
  doc.text(refNo, margin + 6, y + 16);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Billing Period:', margin + 6, y + 22);
  doc.setTextColor(15, 118, 110);
  doc.setFont('helvetica', 'bold');
  doc.text(`${getMonthName(data.month)} ${data.year}`, margin + 30, y + 22);

  // Right Column - Issue Date & Due Date
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Due Date:', margin + contentWidth - 55, y + 8);
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDatePDF(data.dueDate), margin + contentWidth - 55, y + 16);

  if (isPaid && data.paymentDate) {
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Paid On:', margin + contentWidth - 55, y + 22);
    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(formatDatePDF(data.paymentDate), margin + contentWidth - 38, y + 22);
  }

  y += 34;

  // ===== RESIDENT DETAILS =====
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Resident Information', margin, y);

  y += 6;

  doc.setFillColor(243, 244, 246);
  doc.setDrawColor(229, 231, 235);
  doc.rect(margin, y, contentWidth, 8, 'FD');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(75, 85, 99);
  doc.text('Field', margin + 5, y + 5.5);
  doc.text('Details', margin + contentWidth / 2, y + 5.5);

  y += 8;

  // Name Row
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, 8, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Resident Name', margin + 5, y + 5.5);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(data.userName || 'Resident', margin + contentWidth / 2, y + 5.5);

  y += 8;

  // Flat Row
  doc.setFillColor(249, 250, 251);
  doc.rect(margin, y, contentWidth, 8, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Flat Number', margin + 5, y + 5.5);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(data.flatNo, margin + contentWidth / 2, y + 5.5);

  y += 16;

  // ===== CHARGES BREAKDOWN TABLE =====
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Maintenance Breakdown', margin, y);

  y += 6;

  // Table Header
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.rect(margin, y, contentWidth, 8, 'FD');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text('Description', margin + 5, y + 5.5);
  doc.text('Amount', margin + contentWidth - 35, y + 5.5);

  y += 8;

  // Base Maintenance Fee
  const lateFeeAmount = data.lateFee || 0;
  const baseAmount = data.baseAmount || (data.amount - lateFeeAmount);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(229, 231, 235);
  doc.rect(margin, y, contentWidth, 9, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  doc.text(`Monthly Maintenance (${getMonthName(data.month)} ${data.year})`, margin + 5, y + 6);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrencyPDF(baseAmount), margin + contentWidth - 35, y + 6);

  y += 9;

  // Late Fee Row (if applicable)
  if (lateFeeAmount > 0) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.rect(margin, y, contentWidth, 9, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(185, 28, 28);
    doc.text('Late Payment Surcharge (Applied after 18th)', margin + 5, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrencyPDF(lateFeeAmount), margin + contentWidth - 35, y + 6);
    y += 9;
  }

  // Total Row
  if (isPaid) {
    doc.setFillColor(220, 252, 231);
    doc.setDrawColor(134, 239, 172);
    doc.rect(margin, y, contentWidth, 11, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(22, 101, 52);
    doc.text('TOTAL AMOUNT PAID', margin + 5, y + 7.5);
    doc.text(formatCurrencyPDF(data.amount), margin + contentWidth - 35, y + 7.5);
  } else {
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(253, 230, 138);
    doc.rect(margin, y, contentWidth, 11, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(146, 64, 14);
    doc.text('TOTAL AMOUNT DUE', margin + 5, y + 7.5);
    doc.text(formatCurrencyPDF(data.amount), margin + contentWidth - 35, y + 7.5);
  }

  y += 19;

  // ===== STATUS & PAYMENT INFO BOX =====
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Status:', margin + 6, y + 8);

  // Status Badge
  const badgeX = margin + 20;
  if (isPaid) {
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(badgeX, y + 3, 24, 7, 2, 2, 'F');
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PAID', badgeX + 12, y + 7.5, { align: 'center' });
  } else if (data.status === 'overdue') {
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(badgeX, y + 3, 26, 7, 2, 2, 'F');
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('OVERDUE', badgeX + 13, y + 7.5, { align: 'center' });
  } else {
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(badgeX, y + 3, 26, 7, 2, 2, 'F');
    doc.setTextColor(146, 64, 14);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PENDING', badgeX + 13, y + 7.5, { align: 'center' });
  }

  if (isPaid && data.transactionId) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('Transaction ID:', margin + 6, y + 17);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(data.transactionId, margin + 30, y + 17);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('Mode:', margin + contentWidth - 45, y + 17);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text('Razorpay Online', margin + contentWidth - 32, y + 17);
  } else {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('Payment Gateway:', margin + 6, y + 17);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Razorpay / Resident Portal Online', margin + 35, y + 17);
  }

  y += 28;

  // ===== SOCIETY RULES & TERMS BOX =====
  doc.setFillColor(240, 253, 250); // Teal-50
  doc.setDrawColor(204, 251, 241);
  doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('Atharva Society Maintenance Rules & Guidelines:', margin + 5, y + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text('1. Fixed monthly maintenance of Rs. 1,000 per flat is due by the 18th of every month.', margin + 5, y + 11);
  doc.text('2. Payments made after the 18th of the month will automatically incur a late fee of Rs. 100.', margin + 5, y + 15);

  y += 26;

  // ===== FOOTER =====
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, y, margin + contentWidth, y);

  y += 8;

  doc.setTextColor(156, 163, 175);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer-generated document from Atharva Society Intelligent Management System.', pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.text('For queries or support, contact the Atharva Society Office or Management Committee.', pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, y, { align: 'center' });

  // Save the PDF
  const filePrefix = isPaid ? 'Maintenance_Receipt' : 'Maintenance_Bill';
  const fileName = `${filePrefix}_${getMonthName(data.month)}_${data.year}_Flat${data.flatNo}.pdf`;
  doc.save(fileName);
};

/**
 * Backward-compatible generateReceiptPDF
 */
export const generateReceiptPDF = (data: ReceiptData) => {
  generateMaintenancePDF({
    transactionId: data.transactionId,
    amount: data.amount,
    month: data.month,
    year: data.year,
    flatNo: data.flatNo,
    dueDate: new Date(data.year, data.month - 1, 18).toISOString(),
    status: 'paid',
    paymentDate: data.paymentDate,
    userName: data.userName,
    lateFee: data.lateFee,
  });
};

export default generateReceiptPDF;
