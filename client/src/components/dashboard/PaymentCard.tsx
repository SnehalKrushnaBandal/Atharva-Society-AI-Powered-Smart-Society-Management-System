'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, paymentStatusVariant } from '@/components/ui/status-badge';
import { CreditCard, Check, ArrowRight } from 'lucide-react';

interface PaymentCardProps {
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  lateFeesApplied?: number;
  loading?: boolean;
}

export default function PaymentCard({
  amount,
  dueDate,
  status,
  lateFeesApplied = 0,
  loading = false,
}: PaymentCardProps) {
  const totalAmount = amount + lateFeesApplied;

  // Format date to readable format
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get current month name
  const getCurrentMonth = () => {
    return new Date().toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <CreditCard className="w-4 h-4" />
              </div>
              Maintenance Dues
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-slate-100 rounded w-28"></div>
            <div className="h-4 bg-slate-100 rounded w-36"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={status === 'overdue' ? 'border border-red-200 bg-red-50/40 rounded-2xl shadow-sm' : 'border border-slate-200 shadow-sm rounded-2xl bg-white'}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2.5 text-slate-900">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              <CreditCard className="w-4 h-4" />
            </div>
            <span>Maintenance Dues</span>
          </CardTitle>
          <StatusBadge variant={paymentStatusVariant[status]} dot>
            {status === 'paid' ? 'Paid' : status === 'overdue' ? 'Overdue' : 'Due'}
          </StatusBadge>
        </div>
        <p className="text-xs font-semibold text-slate-500 mt-1">{getCurrentMonth()}</p>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        <div>
          <p className={`text-3xl font-extrabold tracking-tight ${status === 'paid' ? 'text-emerald-700' : status === 'overdue' ? 'text-red-700' : 'text-slate-900'}`}>
            ₹{totalAmount.toLocaleString('en-IN')}
          </p>
          {lateFeesApplied > 0 && (
            <p className="text-xs font-semibold text-red-600 mt-1">
              Includes ₹{lateFeesApplied} late fee
            </p>
          )}
        </div>

        {status !== 'paid' && (
          <div className="flex items-center justify-between text-xs py-1 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Due Date</span>
            <span className={status === 'overdue' ? 'text-red-700 font-bold' : 'text-slate-700 font-semibold'}>
              {formatDate(dueDate)}
            </span>
          </div>
        )}

        {status === 'paid' ? (
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold pt-1">
            <Check className="w-4 h-4" />
            <span>Payment completed for this month</span>
          </div>
        ) : (
          <Link href="/maintenance" className="block pt-1">
            <Button
              className={status === 'overdue' ? 'w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-10' : 'w-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs h-10 shadow-xs'}
            >
              <span>Pay Dues Online</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
