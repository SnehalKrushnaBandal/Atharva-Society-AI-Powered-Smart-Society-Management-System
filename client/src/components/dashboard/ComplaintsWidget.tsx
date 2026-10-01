'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, ArrowRight } from 'lucide-react';

interface ComplaintsWidgetProps {
  openCount: number;
  inProgressCount?: number;
  loading?: boolean;
}

export default function ComplaintsWidget({
  openCount,
  inProgressCount = 0,
  loading = false,
}: ComplaintsWidgetProps) {
  const totalActive = openCount + inProgressCount;

  if (loading) {
    return (
      <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              <MessageSquare className="w-4 h-4" />
            </div>
            Complaints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-slate-100 rounded w-16"></div>
            <div className="h-4 bg-slate-100 rounded w-28"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2.5 text-slate-900">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span>My Complaints</span>
          </CardTitle>
          {totalActive > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-teal-800 bg-teal-100 border border-teal-200 rounded-full">
              {totalActive} Active
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        <div>
          <p className={`text-3xl font-extrabold tracking-tight ${totalActive > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
            {totalActive}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {totalActive === 0 ? 'No open grievances' : 'Pending resolution'}
          </p>
        </div>

        {totalActive > 0 && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-2 text-center">
              <p className="font-extrabold text-amber-800 text-sm">{openCount}</p>
              <p className="text-[11px] font-semibold text-amber-700">Open</p>
            </div>
            <div className="bg-teal-50/80 border border-teal-200/60 rounded-xl p-2 text-center">
              <p className="font-extrabold text-teal-800 text-sm">{inProgressCount}</p>
              <p className="text-[11px] font-semibold text-teal-700">In Progress</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Link href="/complaints" className="flex-1">
            <Button variant="outline" className="w-full text-xs font-semibold h-9 border-slate-200 text-slate-700 hover:text-teal-800">
              View All
            </Button>
          </Link>
          <Link href="/complaints/new" className="flex-1">
            <Button className="w-full text-xs font-semibold h-9 bg-teal-700 hover:bg-teal-800 text-white">
              <Plus className="w-3.5 h-3.5 mr-1" /> Log Issue
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
