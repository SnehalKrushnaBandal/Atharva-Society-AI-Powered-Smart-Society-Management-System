'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useEmergency, Emergency, EmergencyHistory } from '@/hooks/useEmergency';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { SocietyService } from '@/types';
import EmergencyButton from '@/components/dashboard/EmergencyButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Siren,
  Mail,
  Bell,
  CheckCircle,
  ArrowUpDown,
  ClipboardList,
  Loader2,
  Phone,
  Flame,
  ShieldAlert,
  HeartPulse,
  Ambulance,
  ShieldCheck,
  Zap,
  Droplets,
  AlertOctagon,
  Clock,
  Settings,
  Building,
  PhoneOff
} from 'lucide-react';

// Official National Emergency Helplines (Intentionally configured national public helplines)
const OFFICIAL_NATIONAL_HELPLINES = [
  {
    id: 'nat-1',
    name: 'National Emergency & Police',
    number: '112',
    category: 'police',
    timing: '24/7 National Unified',
    description: 'Police control room, disaster response, and immediate public safety',
    icon: ShieldAlert,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'nat-2',
    name: 'Emergency Ambulance Service',
    number: '102',
    category: 'ambulance',
    timing: '24/7 National Dispatch',
    description: 'Emergency ambulance dispatch, paramedic transport, and trauma care',
    icon: Ambulance,
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
  },
  {
    id: 'nat-3',
    name: 'Medical Doctor & Disaster Helpline',
    number: '108',
    category: 'medical',
    timing: '24/7 Medical Emergency',
    description: 'Emergency medical consultation and disaster health response',
    icon: HeartPulse,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    id: 'nat-4',
    name: 'Fire Emergency & Rescue Brigade',
    number: '101',
    category: 'fire',
    timing: '24/7 Fire Emergency',
    description: 'Municipal fire rescue brigade, smoke extraction, and gas leak control',
    icon: Flame,
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
  },
];

export default function EmergencyPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    activeEmergency,
    triggerEmergency,
    resolveEmergency,
    getEmergencyHistory,
  } = useEmergency();

  const [history, setHistory] = useState<EmergencyHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  // Society-specific emergency contacts state
  const [societyContacts, setSocietyContacts] = useState<SocietyService[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  const isManagerOrAdmin = user && ['manager', 'admin'].includes(user.role);
  const hasActiveEmergency = activeEmergency !== null;

  const fetchEmergencyContacts = useCallback(async () => {
    try {
      setContactsLoading(true);
      const res = await api.get('/services/emergency-contacts');
      if (res.data.success && Array.isArray(res.data.data)) {
        setSocietyContacts(res.data.data);
      }
    } catch (error) {
      console.warn('Could not fetch society emergency contacts:', error);
    } finally {
      setContactsLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (page: number) => {
    setHistoryLoading(true);
    try {
      const data = await getEmergencyHistory(page, 10);
      setHistory(data);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, [getEmergencyHistory]);

  useEffect(() => {
    fetchEmergencyContacts();
    fetchHistory(1);
  }, [fetchEmergencyContacts, fetchHistory]);

  const handleTrigger = async (notes?: string) => {
    setTriggerLoading(true);
    try {
      await triggerEmergency(notes);
      toast({
        title: 'Emergency Alert Broadcasted! 🚨',
        description: 'All residents, management, and security staff have been notified instantly.',
      });
      fetchHistory(1);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Please try again';
      toast({
        title: 'Failed to send alert',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setTriggerLoading(false);
    }
  };

  const openResolveDialog = (emergency: Emergency) => {
    setSelectedEmergency(emergency);
    setResolveNotes('');
    setResolveDialogOpen(true);
  };

  const handleResolve = async () => {
    if (!selectedEmergency) return;

    setResolveLoading(true);
    try {
      await resolveEmergency(selectedEmergency._id, resolveNotes);
      toast({
        title: 'Emergency Resolved! ✅',
        description: 'All residents have been notified that the situation has been safely resolved.',
      });
      setResolveDialogOpen(false);
      fetchHistory(1);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Please try again';
      toast({
        title: 'Failed to resolve emergency',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setResolveLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getResponseTime = (emergency: Emergency) => {
    if (!emergency.resolved_at) return null;
    const start = new Date(emergency.triggered_at).getTime();
    const end = new Date(emergency.resolved_at).getTime();
    const minutes = Math.floor((end - start) / 60000);
    if (minutes < 1) return 'Under 1 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical':
        return <HeartPulse className="w-5 h-5 text-red-600" />;
      case 'ambulance':
        return <Ambulance className="w-5 h-5 text-red-600" />;
      case 'fire_safety':
        return <Flame className="w-5 h-5 text-orange-600" />;
      case 'security':
        return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      case 'lift_technician':
        return <ArrowUpDown className="w-5 h-5 text-indigo-600" />;
      case 'electrician':
        return <Zap className="w-5 h-5 text-amber-600" />;
      case 'plumber':
        return <Droplets className="w-5 h-5 text-cyan-600" />;
      case 'society_office':
        return <Building className="w-5 h-5 text-teal-600" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-slate-600" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'medical':
      case 'ambulance':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'fire_safety':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'security':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'lift_technician':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'electrician':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'plumber':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200';
    }
  };

  // Filter society-specific contacts (exclude national 3-digit helplines so they are not duplicated)
  const filteredSocietyContacts = useMemo(() => {
    const nationalNumbers = ['112', '102', '108', '101', '100'];
    return societyContacts.filter(
      (contact) => !contact.phone || !nationalNumbers.includes(contact.phone.trim())
    );
  }, [societyContacts]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Emergency & Helplines</h1>
        <p className="text-gray-600 mt-1">
          Official emergency helplines, Atharva Society emergency response, and Lift SOS broadcast
        </p>
      </div>

      {/* Lift Emergency Trigger & Status Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Emergency SOS Trigger Button */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <Siren className="w-4 h-4 text-red-600" />
                </div>
                Lift Emergency SOS Broadcast
              </CardTitle>
              <CardDescription>
                Trigger an instant broadcast alert if you or someone is trapped inside the elevator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmergencyButton
                onTrigger={handleTrigger}
                hasActiveEmergency={hasActiveEmergency}
                userFlat={user?.flat_no || 'Unknown'}
                triggerLoading={triggerLoading}
              />
            </CardContent>
          </Card>

          {/* How It Works Protocol */}
          <Card className="border-0 shadow-sm bg-slate-50/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-800">What happens when SOS is triggered?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-slate-800">Instant Email Broadcast</p>
                  <p className="text-xs text-slate-500">
                    All residents, security watchman, and society manager receive immediate emergency alerts.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-slate-800">Live Dashboard Banner</p>
                  <p className="text-xs text-slate-500">
                    A prominent flashing red alert banner is displayed across all resident and staff dashboards.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-slate-800">Swift Resolution</p>
                  <p className="text-xs text-slate-500">
                    Once the elevator technician rescues occupants, management marks the emergency resolved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Active Alert Status & Overview */}
        <div className="space-y-6">
          <Card className={`border shadow-sm ${hasActiveEmergency ? 'border-red-400 bg-red-50/70' : 'border-emerald-200 bg-emerald-50/30'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {hasActiveEmergency ? (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center animate-pulse">
                      <Siren className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="text-red-700 font-bold">Active Emergency In Progress</span>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-emerald-700 font-bold">Elevator Status: Normal</span>
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {hasActiveEmergency
                  ? 'An emergency alert is active. Immediate assistance is required.'
                  : 'No active lift emergencies reported in Atharva Society.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasActiveEmergency && activeEmergency ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg border border-red-200 p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-red-800">
                          Triggered by: {activeEmergency.triggered_by?.name || 'Resident'}
                        </p>
                        <p className="text-xs text-gray-600">
                          Flat {activeEmergency.flat_no || activeEmergency.triggered_by?.flat_no} • {getTimeAgo(activeEmergency.triggered_at)}
                        </p>
                      </div>
                      <Badge variant="destructive" className="animate-pulse">
                        ACTIVE ALERT
                      </Badge>
                    </div>

                    {activeEmergency.notes && (
                      <div className="bg-amber-50 border border-amber-200 rounded p-2.5">
                        <p className="text-xs text-amber-900">
                          <strong>Note:</strong> {activeEmergency.notes}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      Triggered on: {formatDate(activeEmergency.triggered_at)}
                    </p>

                    {/* Direct call to resident in lift only if valid phone is registered */}
                    {activeEmergency.triggered_by?.phone && (
                      <a
                        href={`tel:${activeEmergency.triggered_by.phone.replace(/[\s-]/g, '')}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-semibold transition"
                      >
                        <Phone className="w-4 h-4" />
                        Call Trapped Resident ({activeEmergency.triggered_by.phone})
                      </a>
                    )}

                    {isManagerOrAdmin && (
                      <Button
                        variant="default"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        onClick={() => openResolveDialog(activeEmergency)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Mark as Resolved
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <ArrowUpDown className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
                  <p className="text-sm font-medium text-gray-700">All elevators are operational.</p>
                  <p className="text-xs text-gray-400 mt-1">If trapped or in danger, trigger the SOS button on the left.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {history && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-gray-800">Alert History Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-2xl font-bold text-slate-900">
                      {history.pagination.total}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">Total Alerts Logged</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-2xl font-bold text-emerald-700">
                      {history.data.filter((e: Emergency) => e.status === 'resolved').length}
                    </p>
                    <p className="text-xs text-emerald-600 font-medium">Successfully Resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Section 1: Official National Emergency Helplines */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-blue-600" />
            Official Emergency Helplines
          </h2>
          <p className="text-sm text-gray-600">
            Verified national public emergency service numbers for immediate dispatch
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OFFICIAL_NATIONAL_HELPLINES.map((helpline) => {
            const Icon = helpline.icon;
            return (
              <Card key={helpline.id} className="border shadow-sm bg-white flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <Icon className="w-5 h-5 text-blue-700" />
                    </div>
                    <Badge variant="outline" className={`text-[10px] font-semibold uppercase ${helpline.badgeColor}`}>
                      {helpline.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-gray-900 pt-2">
                    {helpline.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {helpline.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {helpline.timing}
                    </span>
                    <span className="font-mono font-bold text-base text-gray-900">
                      {helpline.number}
                    </span>
                  </div>

                  <a
                    href={`tel:${helpline.number}`}
                    className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call Helpline ({helpline.number})
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Section 2: Atharva Society Internal Emergency Contacts */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <AlertOctagon className="w-6 h-6 text-teal-700" />
              Atharva Society Internal Emergency Contacts
            </h2>
            <p className="text-sm text-gray-600">
              Society-specific emergency contacts (Lift technician, security gate, electrician, plumber) managed via Society Services
            </p>
          </div>

          {isManagerOrAdmin && (
            <Link href="/services">
              <Button variant="outline" size="sm" className="text-teal-700 border-teal-200 hover:bg-teal-50">
                <Settings className="w-4 h-4 mr-1.5" />
                Configure Contacts
              </Button>
            </Link>
          )}
        </div>

        {contactsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-gray-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredSocietyContacts.length === 0 ? (
          <Card className="text-center py-8 border-dashed bg-slate-50/50">
            <CardContent className="space-y-2">
              <PhoneOff className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-sm font-medium text-gray-700">No society-specific emergency contacts configured yet.</p>
              {isManagerOrAdmin && (
                <Link href="/services">
                  <Button size="sm" className="mt-2 bg-teal-700 hover:bg-teal-800 text-white">
                    Add Society Emergency Contact
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSocietyContacts.map((contact) => (
              <Card key={contact._id} className="border shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                        {getCategoryIcon(contact.category)}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base font-bold text-gray-900 leading-tight truncate">
                          {contact.name}
                        </CardTitle>
                        {contact.contact_person ? (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{contact.contact_person}</p>
                        ) : (
                          <p className="text-xs text-gray-400 italic mt-0.5">Contact person unassigned</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] font-semibold uppercase ${getCategoryBadgeClass(contact.category)}`}>
                      {contact.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-1">
                  {contact.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {contact.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {contact.timing || 'Available on Call'}
                    </span>
                    {contact.phone ? (
                      <span className="font-mono font-semibold text-gray-800">
                        {contact.phone}
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                        Unconfigured
                      </span>
                    )}
                  </div>

                  {/* Call Action vs Not Configured Notice */}
                  {contact.phone && contact.phone.trim() ? (
                    <a
                      href={`tel:${contact.phone.replace(/[\s-]/g, '')}`}
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Call ({contact.phone})
                    </a>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-center">
                      <p className="text-xs font-semibold text-slate-600 flex items-center justify-center gap-1.5">
                        <PhoneOff className="w-3.5 h-3.5 text-slate-400" />
                        Contact not configured
                      </p>
                      {isManagerOrAdmin && (
                        <Link href="/services" className="text-[11px] text-teal-700 hover:underline font-medium block mt-1">
                          Configure in Society Services →
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Emergency History Table */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="w-5 h-5 text-teal-700" />
            Lift Emergency History Log
          </CardTitle>
          <CardDescription>
            Past emergency alerts, response times, and logged resolution notes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin h-8 w-8 text-teal-700" />
            </div>
          ) : history && history.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Triggered Time</TableHead>
                      <TableHead>Resident / Flat</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Resolved By</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Notes & Resolution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.data.map((emergency: Emergency) => (
                      <TableRow key={emergency._id}>
                        <TableCell className="whitespace-nowrap text-xs text-gray-700">
                          {formatDate(emergency.triggered_at)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{emergency.triggered_by?.name || 'Resident'}</p>
                            <p className="text-xs text-gray-500">
                              Flat {emergency.flat_no || emergency.triggered_by?.flat_no || 'Unknown'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={emergency.status === 'active' ? 'destructive' : 'default'}
                            className={
                              emergency.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-600 text-white'
                            }
                          >
                            {emergency.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {emergency.resolved_by ? (
                            <div>
                              <p className="font-medium text-gray-900">{emergency.resolved_by.name}</p>
                              <p className="text-[10px] text-gray-500">{emergency.resolved_at && formatDate(emergency.resolved_at)}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-gray-700">
                          {getResponseTime(emergency) || (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[220px]">
                          <p className="truncate text-xs text-gray-600" title={emergency.notes || ''}>
                            {emergency.notes || '—'}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {history.pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => fetchHistory(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="px-3 text-xs text-gray-600">
                    Page {currentPage} of {history.pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === history.pagination.pages}
                    onClick={() => fetchHistory(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <span className="text-3xl block mb-2">📋</span>
              <p className="text-sm">No emergency history recorded</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={(open) => {
        if (!resolveLoading) {
          setResolveDialogOpen(open);
          if (!open) {
            setSelectedEmergency(null);
            setResolveNotes('');
          }
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
              Resolve Lift Emergency
            </DialogTitle>
            <DialogDescription>
              Confirm that occupants have been safely evacuated and the lift situation is resolved.
            </DialogDescription>
          </DialogHeader>

          {selectedEmergency && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1 border">
                <p className="text-gray-700">
                  Triggered by: <strong>{selectedEmergency.triggered_by?.name}</strong>
                </p>
                <p className="text-gray-700">
                  Flat: <strong>{selectedEmergency.flat_no || selectedEmergency.triggered_by?.flat_no}</strong>
                </p>
                <p className="text-gray-700">
                  Triggered: <strong>{getTimeAgo(selectedEmergency.triggered_at)}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolveNotes" className="text-xs font-semibold text-gray-700">
                  Resolution Notes (technician actions, safety check)
                </Label>
                <Textarea
                  id="resolveNotes"
                  placeholder="e.g. Lift technician arrived, power restored, passenger evacuated safely..."
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  disabled={resolveLoading}
                  className="resize-none text-xs"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setResolveDialogOpen(false);
                setSelectedEmergency(null);
                setResolveNotes('');
              }}
              disabled={resolveLoading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleResolve}
              disabled={resolveLoading}
            >
              {resolveLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Resolution
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
