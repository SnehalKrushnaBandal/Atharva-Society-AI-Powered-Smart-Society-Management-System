'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEmergency } from '@/hooks/useEmergency';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SOCIETY_NAME } from '@/lib/constants';
import PublicHomePage from '@/components/home/PublicHomePage';
import {
  PaymentCard,
  ComplaintsWidget,
  AssetStatusWidget,
  EmergencyBanner,
  EmergencyButton,
} from '@/components/dashboard';
import {
  AlertTriangle,
  Users,
  BarChart3,
  FileText,
  Settings,
  Activity,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shield,
  Zap,
  Building2,
} from 'lucide-react';

// Mock data - will be replaced with API calls later
const MOCK_DATA = {
  maintenance: {
    amount: 1000,
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 18).toISOString(),
    status: 'pending' as const,
    lateFeesApplied: 0,
  },
  complaints: {
    openCount: 2,
    inProgressCount: 1,
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  const { 
    activeEmergency, 
    loading: emergencyLoading, 
    triggerEmergency, 
    resolveEmergency,
    triggerLoading,
    resolveLoading,
  } = useEmergency();
  
  const [dashboardData, setDashboardData] = useState(MOCK_DATA);
  const [dataLoading, setDataLoading] = useState(true);

  // Check if user is admin/manager
  const isAdmin = user && ['manager', 'admin'].includes(user.role);

  // Redirect watchman to their dedicated portal
  useEffect(() => {
    if (!loading && user?.role === 'watchman') {
      router.replace('/watchman');
    }
  }, [user, loading, router]);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setDataLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle emergency trigger
  const handleTriggerEmergency = async (notes?: string) => {
    try {
      await triggerEmergency(notes);
      toast({
        title: 'Emergency Alert Sent',
        description: 'All residents and staff have been notified.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to send alert',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  // Handle emergency resolve (admin only)
  const handleResolveEmergency = async (id: string) => {
    try {
      await resolveEmergency(id);
      toast({
        title: 'Emergency Resolved',
        description: 'All residents have been notified.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to resolve',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-teal-100 border-t-teal-700 animate-spin"></div>
      </div>
    );
  }

  // Render the public landing page for unauthenticated visitors
  if (!isAuthenticated || !user) {
    return <PublicHomePage />;
  }

  // Get current hour for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-8">
      {/* Emergency Banner - Always at top if active */}
      <EmergencyBanner
        emergency={activeEmergency}
        loading={emergencyLoading}
        onResolve={handleResolveEmergency}
        canResolve={isAdmin || false}
        resolveLoading={resolveLoading}
      />

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {greeting}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-teal-700" />
            Flat {user?.flat_no} • {SOCIETY_NAME}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Badge variant="outline" className="px-3 py-1.5 text-xs font-semibold bg-white border-slate-200 text-slate-700">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Badge>
          {isAdmin && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 px-3 py-1.5 text-xs font-bold">
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              {user?.role === 'manager' ? 'Society Manager' : 'Admin'}
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Payment Card */}
        <PaymentCard
          amount={dashboardData.maintenance.amount}
          dueDate={dashboardData.maintenance.dueDate}
          status={dashboardData.maintenance.status}
          lateFeesApplied={dashboardData.maintenance.lateFeesApplied}
          loading={dataLoading}
        />

        {/* Complaints Widget */}
        <ComplaintsWidget
          openCount={dashboardData.complaints.openCount}
          inProgressCount={dashboardData.complaints.inProgressCount}
          loading={dataLoading}
        />

        {/* Asset Status Widget */}
        <AssetStatusWidget
          isAdmin={isAdmin || false}
        />
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Emergency Section - Takes 3 columns */}
        <Card className="lg:col-span-3 overflow-hidden border border-slate-200 shadow-sm bg-gradient-to-br from-white to-slate-50 rounded-2xl">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2.5 text-base font-bold text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <span>Lift Emergency Trigger</span>
            </CardTitle>
            <p className="text-xs text-slate-500">
              Use only in case of actual emergency when someone is stuck in the lift
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <EmergencyButton
              onTrigger={handleTriggerEmergency}
              hasActiveEmergency={!!activeEmergency}
              userFlat={user?.flat_no || ''}
              triggerLoading={triggerLoading}
            />
          </CardContent>
        </Card>

        {/* Profile Card - Takes 2 columns */}
        <Card className="lg:col-span-2 border border-slate-200 shadow-sm rounded-2xl bg-white">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2.5 text-base font-bold text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Activity className="w-4 h-4" />
              </div>
              <span>Resident Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* Profile Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center shrink-0 shadow-md">
                <span className="text-white font-extrabold text-sm">
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 truncate">{user?.name}</h3>
                <p className="text-xs text-teal-700 font-semibold capitalize">{user?.role}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{user?.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Flat {user?.flat_no} • Atharva Society</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Quick Actions */}
      {isAdmin && (
        <Card className="border border-slate-800 shadow-md bg-slate-900 text-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-800">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
              <Zap className="w-4 h-4 text-teal-400" />
              <span>Admin Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/admin/users">
                <Button variant="secondary" className="w-full h-auto py-3.5 flex flex-col gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-white rounded-xl">
                  <Users className="w-5 h-5 text-teal-400" />
                  <span className="text-xs font-semibold">Manage Users</span>
                </Button>
              </Link>
              <Link href="/admin/payments">
                <Button variant="secondary" className="w-full h-auto py-3.5 flex flex-col gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-white rounded-xl">
                  <BarChart3 className="w-5 h-5 text-teal-400" />
                  <span className="text-xs font-semibold">All Payments</span>
                </Button>
              </Link>
              <Link href="/admin/complaints">
                <Button variant="secondary" className="w-full h-auto py-3.5 flex flex-col gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-white rounded-xl">
                  <FileText className="w-5 h-5 text-teal-400" />
                  <span className="text-xs font-semibold">All Complaints</span>
                </Button>
              </Link>
              <Link href="/admin/assets">
                <Button variant="secondary" className="w-full h-auto py-3.5 flex flex-col gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-white rounded-xl">
                  <Settings className="w-5 h-5 text-teal-400" />
                  <span className="text-xs font-semibold">Manage Assets</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
