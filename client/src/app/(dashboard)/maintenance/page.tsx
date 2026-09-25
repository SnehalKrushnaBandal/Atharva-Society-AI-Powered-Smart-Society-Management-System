'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, paymentStatusVariant } from '@/components/ui/status-badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Maintenance, PaymentLog } from '@/types';
import { SOCIETY_NAME } from '@/lib/constants';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  CreditCard,
  Loader2,
  Download,
  FileText,
  Eye,
  Info,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { generateMaintenancePDF, generateReceiptPDF } from '@/lib/generateReceipt';

// Razorpay types
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface OrderData {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  maintenance: {
    id: string;
    month: number;
    year: number;
    flat_no: string;
    total_amount: number;
  };
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
}

export default function MaintenancePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentMaintenance, setCurrentMaintenance] = useState<Maintenance | null>(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState<Maintenance[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedMaintenanceForDetails, setSelectedMaintenanceForDetails] = useState<Maintenance | null>(null);
  const [lastPayment, setLastPayment] = useState<{
    transaction_id: string;
    amount: number;
    month: number;
    year: number;
  } | null>(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [currentRes, historyRes, paymentRes] = await Promise.all([
        api.get('/maintenance/current'),
        api.get('/maintenance?status='),
        api.get('/maintenance/history'),
      ]);

      if (currentRes.data.success) {
        setCurrentMaintenance(currentRes.data.data);
      }
      if (historyRes.data.success) {
        setMaintenanceHistory(historyRes.data.data);
      }
      if (paymentRes.data.success) {
        setPaymentHistory(paymentRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load maintenance data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePayNow = async (maintenance: Maintenance) => {
    if (!window.Razorpay) {
      toast({
        title: 'Error',
        description: 'Payment system not loaded. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setPaying(true);

      // Create order
      const orderRes = await api.post('/maintenance/create-order', {
        maintenance_id: maintenance._id,
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to create order');
      }

      const orderData: OrderData = orderRes.data.data;

      // Configure Razorpay
      const options: RazorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: SOCIETY_NAME,
        description: `Maintenance for ${getMonthName(orderData.maintenance.month)} ${orderData.maintenance.year}`,
        order_id: orderData.order_id,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              maintenance_id: maintenance._id,
            });

            if (verifyRes.data.success) {
              setLastPayment({
                transaction_id: response.razorpay_payment_id,
                amount: orderData.maintenance.total_amount,
                month: orderData.maintenance.month,
                year: orderData.maintenance.year,
              });
              setShowSuccess(true);
              if (selectedMaintenanceForDetails?._id === maintenance._id) {
                setSelectedMaintenanceForDetails(null);
              }
              fetchData(); // Refresh data
              toast({
                title: 'Payment Successful! 🎉',
                description: 'Your maintenance payment has been received.',
              });
            } else {
              throw new Error(verifyRes.data.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: 'Verification Failed',
              description: 'Payment received but verification failed. Please contact support.',
              variant: 'destructive',
            });
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: orderData.prefill.name,
          email: orderData.prefill.email,
          contact: orderData.prefill.contact,
        },
        theme: {
          color: '#0F766E',
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Failed to initiate payment',
        variant: 'destructive',
      });
      setPaying(false);
    }
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

  const handleDownloadPDF = (maintenance: Maintenance) => {
    generateMaintenancePDF({
      transactionId: maintenance.razorpay_payment_id || undefined,
      amount: maintenance.total_amount,
      baseAmount: maintenance.amount || 1000,
      lateFee: maintenance.late_fee || 0,
      month: maintenance.month,
      year: maintenance.year,
      flatNo: maintenance.flat_no || user?.flat_no || '',
      dueDate: maintenance.due_date,
      status: maintenance.status,
      paymentDate: maintenance.paid_date,
      userName: user?.name || 'Resident',
    });

    toast({
      title: 'PDF Downloaded',
      description: `Maintenance ${maintenance.status === 'paid' ? 'receipt' : 'statement'} downloaded successfully.`,
    });
  };

  const handleDownloadReceipt = (payment: PaymentLog) => {
    generateReceiptPDF({
      transactionId: payment.transaction_id,
      amount: payment.amount,
      month: payment.month,
      year: payment.year,
      flatNo: user?.flat_no || '',
      paymentDate: payment.payment_date,
      userName: user?.name || '',
    });

    toast({
      title: 'Receipt Downloaded',
      description: 'Your payment receipt has been downloaded successfully.',
    });
  };

  const handleDownloadCurrentReceipt = () => {
    if (lastPayment) {
      generateReceiptPDF({
        transactionId: lastPayment.transaction_id,
        amount: lastPayment.amount,
        month: lastPayment.month,
        year: lastPayment.year,
        flatNo: user?.flat_no || '',
        paymentDate: new Date().toISOString(),
        userName: user?.name || '',
      });

      toast({
        title: 'Receipt Downloaded',
        description: 'Your payment receipt has been downloaded successfully.',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-gray-600 mt-1">View and pay your maintenance dues</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-32"></div>
                <div className="h-12 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Society Maintenance</h1>
          <p className="text-gray-600 mt-1">Manage, inspect, and pay your monthly maintenance bills</p>
        </div>
      </div>

      {/* Rules & Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-50 text-teal-700 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Monthly Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">₹1,000 <span className="text-xs font-normal text-gray-500">/ month</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Monthly Due Date</p>
                <p className="text-2xl font-bold text-gray-900">18th <span className="text-xs font-normal text-gray-500">of every month</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Late Fee Rule</p>
                <p className="text-2xl font-bold text-gray-900">₹100 <span className="text-xs font-normal text-gray-500">after 18th</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Month Bill Card */}
      {currentMaintenance && (
        <Card className={`border shadow-sm ${
          currentMaintenance.status === 'overdue'
            ? 'border-red-200 bg-red-50/40'
            : currentMaintenance.status === 'paid'
            ? 'border-green-200 bg-green-50/40'
            : 'border-teal-200 bg-teal-50/30'
        }`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Current Bill — {getMonthName(currentMaintenance.month)} {currentMaintenance.year}
                </CardTitle>
                <CardDescription>
                  Flat {currentMaintenance.flat_no} • Atharva Society
                </CardDescription>
              </div>
              <StatusBadge variant={paymentStatusVariant[currentMaintenance.status]} dot>
                {currentMaintenance.status === 'paid' ? 'Paid' : currentMaintenance.status === 'overdue' ? 'Overdue' : 'Pending'}
              </StatusBadge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-gray-200/80">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Amount</p>
                <p className={`text-3xl font-bold tracking-tight ${
                  currentMaintenance.status === 'paid' ? 'text-green-600' :
                  currentMaintenance.status === 'overdue' ? 'text-red-600' : 'text-teal-700'
                }`}>
                  {formatAmount(currentMaintenance.total_amount)}
                </p>
                {currentMaintenance.late_fee > 0 && (
                  <p className="text-xs text-red-600 font-medium mt-0.5">
                    Includes {formatAmount(currentMaintenance.late_fee)} late fee
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 font-medium">Due Date</p>
                <p className={`text-lg font-semibold ${currentMaintenance.status === 'overdue' ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatDate(currentMaintenance.due_date)}
                </p>
                <p className="text-xs text-gray-500">Late fee applies after 18th</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-medium">Payment Status</p>
                {currentMaintenance.status === 'paid' ? (
                  <div className="text-sm font-semibold text-green-700 flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Paid on {formatDate(currentMaintenance.paid_date)}
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-amber-700 flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    {currentMaintenance.status === 'overdue' ? 'Overdue - Please pay immediately' : 'Pending Payment'}
                  </div>
                )}
              </div>
            </div>

            {/* Actions for Current Month */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedMaintenanceForDetails(currentMaintenance)}
                className="bg-white hover:bg-gray-50 text-gray-800"
              >
                <Eye className="w-4 h-4 mr-2 text-teal-600" />
                View Maintenance Details
              </Button>

              <Button
                variant="outline"
                onClick={() => handleDownloadPDF(currentMaintenance)}
                className="bg-white hover:bg-gray-50 text-gray-800"
              >
                <Download className="w-4 h-4 mr-2 text-blue-600" />
                Download Maintenance PDF
              </Button>

              {currentMaintenance.status !== 'paid' && (
                <Button
                  onClick={() => handlePayNow(currentMaintenance)}
                  disabled={paying}
                  className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-sm ml-auto"
                >
                  {paying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay Now ({formatAmount(currentMaintenance.total_amount)})
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Maintenance Statement & History</CardTitle>
              <CardDescription>Review all historical maintenance bills and their payment status</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {maintenanceHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No maintenance records found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Billing Month</TableHead>
                    <TableHead>Base Fee</TableHead>
                    <TableHead>Late Fee</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceHistory.map((maintenance) => (
                    <TableRow key={maintenance._id}>
                      <TableCell className="font-semibold text-gray-900">
                        {getMonthName(maintenance.month)} {maintenance.year}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatAmount(maintenance.amount || 1000)}
                      </TableCell>
                      <TableCell>
                        {maintenance.late_fee > 0 ? (
                          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                            +{formatAmount(maintenance.late_fee)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">₹0</span>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-gray-900">
                        {formatAmount(maintenance.total_amount)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(maintenance.due_date)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant={paymentStatusVariant[maintenance.status]} dot>
                          {maintenance.status === 'paid' ? 'Paid' : maintenance.status === 'overdue' ? 'Overdue' : 'Pending'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedMaintenanceForDetails(maintenance)}
                            title="View Maintenance Details"
                            className="text-gray-700 hover:text-teal-700 hover:bg-teal-50"
                          >
                            <Eye className="w-4 h-4 mr-1 text-teal-600" />
                            Details
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadPDF(maintenance)}
                            title="Download PDF"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </Button>

                          {maintenance.status !== 'paid' && (
                            <Button
                              size="sm"
                              onClick={() => handlePayNow(maintenance)}
                              disabled={paying}
                              className="bg-teal-600 hover:bg-teal-700 text-white"
                            >
                              Pay
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      {paymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Online Payment Transactions
            </CardTitle>
            <CardDescription>Verified online transaction records processed through Razorpay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Transaction Reference</TableHead>
                    <TableHead>Billing Month</TableHead>
                    <TableHead className="text-right">Amount Paid</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell className="text-sm text-gray-700">{formatDate(payment.payment_date)}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-gray-800">
                        {payment.transaction_id}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getMonthName(payment.month)} {payment.year}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-bold">
                        {formatAmount(payment.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReceipt(payment)}
                          className="text-teal-700 hover:text-teal-800 hover:bg-teal-50"
                        >
                          <Download className="w-4 h-4 mr-1 text-teal-600" />
                          Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Society Rules Information Footer Card */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-lg shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-900">Atharva Society Maintenance Policy & Guidelines</h4>
              <ul className="text-xs text-gray-600 space-y-1 pt-1 list-disc pl-4">
                <li>Monthly maintenance fee is <strong>₹1,000 fixed</strong> per flat.</li>
                <li>The due date for each billing month is the <strong>18th of the month</strong>.</li>
                <li>Payments made after the 18th incur an automatic <strong>late fee of ₹100</strong>.</li>
                <li>Digital maintenance bills and payment receipts are available for download in PDF format anytime.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Maintenance Details Dialog */}
      <Dialog
        open={Boolean(selectedMaintenanceForDetails)}
        onOpenChange={(open) => !open && setSelectedMaintenanceForDetails(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Maintenance Details
            </DialogTitle>
            <DialogDescription>
              Atharva Society • Flat {selectedMaintenanceForDetails?.flat_no || user?.flat_no}
            </DialogDescription>
          </DialogHeader>

          {selectedMaintenanceForDetails && (
            <div className="space-y-4 py-2">
              {/* Billing Info Card */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200/80 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Billing Period</span>
                  <span className="font-bold text-gray-900">
                    {getMonthName(selectedMaintenanceForDetails.month)} {selectedMaintenanceForDetails.year}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Resident Name</span>
                  <span className="font-medium text-gray-900">{user?.name || 'Resident'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Flat Number</span>
                  <span className="font-semibold text-gray-900">{selectedMaintenanceForDetails.flat_no}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Due Date</span>
                  <span className="font-medium text-red-600">
                    {formatDate(selectedMaintenanceForDetails.due_date)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Payment Status</span>
                  <StatusBadge variant={paymentStatusVariant[selectedMaintenanceForDetails.status]} dot>
                    {selectedMaintenanceForDetails.status === 'paid' ? 'Paid' : selectedMaintenanceForDetails.status === 'overdue' ? 'Overdue' : 'Pending'}
                  </StatusBadge>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="border rounded-lg p-4 space-y-2.5">
                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Charges Breakdown</h5>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Monthly Maintenance</span>
                  <span className="font-medium text-gray-900">
                    {formatAmount(selectedMaintenanceForDetails.amount || 1000)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Late Payment Fee</span>
                  <span className={`font-medium ${selectedMaintenanceForDetails.late_fee > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatAmount(selectedMaintenanceForDetails.late_fee || 0)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between text-base font-bold">
                  <span className="text-gray-900">Total {selectedMaintenanceForDetails.status === 'paid' ? 'Paid' : 'Payable'}</span>
                  <span className={selectedMaintenanceForDetails.status === 'paid' ? 'text-green-600' : 'text-teal-700'}>
                    {formatAmount(selectedMaintenanceForDetails.total_amount)}
                  </span>
                </div>
              </div>

              {/* Payment Details (if paid) */}
              {selectedMaintenanceForDetails.status === 'paid' && (
                <div className="bg-green-50/70 border border-green-200 rounded-lg p-3.5 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-green-800 font-medium">Payment Date:</span>
                    <span className="text-green-900 font-semibold">{formatDate(selectedMaintenanceForDetails.paid_date)}</span>
                  </div>
                  {selectedMaintenanceForDetails.razorpay_payment_id && (
                    <div className="flex justify-between">
                      <span className="text-green-800 font-medium">Transaction Reference:</span>
                      <span className="font-mono text-green-900">{selectedMaintenanceForDetails.razorpay_payment_id}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Notice note */}
              <p className="text-[11px] text-gray-500 text-center">
                Atharva Society Rule: Fixed maintenance of ₹1,000 is due by the 18th. A late fee of ₹100 applies thereafter.
              </p>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => selectedMaintenanceForDetails && handleDownloadPDF(selectedMaintenanceForDetails)}
              className="text-teal-700 border-teal-200 hover:bg-teal-50"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Download Maintenance PDF
            </Button>

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setSelectedMaintenanceForDetails(null)}>
                Close
              </Button>
              {selectedMaintenanceForDetails && selectedMaintenanceForDetails.status !== 'paid' && (
                <Button
                  onClick={() => handlePayNow(selectedMaintenanceForDetails)}
                  disabled={paying}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <CreditCard className="w-4 h-4 mr-1.5" />
                  Pay Now
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              🎉 Payment Successful!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your maintenance payment has been received
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {lastPayment && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-semibold text-green-600">
                    {formatAmount(lastPayment.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Month</span>
                  <span className="font-medium">
                    {getMonthName(lastPayment.month)} {lastPayment.year}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-mono text-sm">{lastPayment.transaction_id}</span>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-gray-500">
              A confirmation email has been sent to {user?.email}
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownloadCurrentReceipt}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Button
                className="flex-1 bg-teal-600 hover:bg-teal-700"
                onClick={() => setShowSuccess(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
