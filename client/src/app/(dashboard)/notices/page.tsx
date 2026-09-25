'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import {
  Notice,
  SocietyEvent,
  NoticeCategory,
  NoticePriority,
  EventCategory,
} from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Bell,
  Calendar,
  Pin,
  PinOff,
  Plus,
  Edit2,
  Trash2,
  Search,
  Clock,
  MapPin,
  AlertCircle,
  AlertTriangle,
  Info,
  Sparkles,
  Users,
  Flame,
  Droplets,
  ArrowUpDown,
  Car,
  FileText,
  PartyPopper,
  Trophy,
  Loader2,
  CalendarDays,
  Megaphone
} from 'lucide-react';

const NOTICE_CATEGORIES: { value: NoticeCategory; label: string; icon: any }[] = [
  { value: 'maintenance', label: 'Maintenance Notice', icon: AlertCircle },
  { value: 'water_interruption', label: 'Water Supply Alert', icon: Droplets },
  { value: 'lift_maintenance', label: 'Lift Servicing', icon: ArrowUpDown },
  { value: 'parking', label: 'Parking & Vehicle', icon: Car },
  { value: 'society_meeting', label: 'Society Meeting', icon: Users },
  { value: 'circular', label: 'Official Circular', icon: FileText },
  { value: 'general', label: 'General Announcement', icon: Megaphone },
];

const EVENT_CATEGORIES: { value: EventCategory; label: string; icon: any }[] = [
  { value: 'festival', label: 'Festival Celebration', icon: Sparkles },
  { value: 'meeting', label: 'General Body Meeting', icon: Users },
  { value: 'cultural', label: 'Cultural Program', icon: PartyPopper },
  { value: 'sports', label: 'Sports & Fitness Event', icon: Trophy },
  { value: 'celebration', label: 'Society Gathering', icon: Flame },
  { value: 'other', label: 'Other Event', icon: Calendar },
];

export default function NoticesPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const isManagerOrAdmin = user && ['manager', 'admin'].includes(user.role);

  // Tabs state
  const [activeTab, setActiveTab] = useState<'notices' | 'events'>('notices');

  // Notices state
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [noticeSearch, setNoticeSearch] = useState('');
  const [noticeCategoryFilter, setNoticeCategoryFilter] = useState<string>('all');
  const [noticePriorityFilter, setNoticePriorityFilter] = useState<string>('all');

  // Events state
  const [events, setEvents] = useState<SocietyEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventSearch, setEventSearch] = useState('');
  const [eventTimeframe, setEventTimeframe] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>('all');

  // Notice Dialog State
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isNoticeSubmitting, setIsNoticeSubmitting] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deletingNotice, setDeletingNotice] = useState<Notice | null>(null);
  const [isNoticeDeleting, setIsNoticeDeleting] = useState(false);

  const [noticeForm, setNoticeForm] = useState({
    title: '',
    category: 'general' as NoticeCategory,
    priority: 'normal' as NoticePriority,
    date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    location: 'All Wings / Society Wide',
    description: '',
    is_pinned: false,
  });

  // Event Dialog State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEventSubmitting, setIsEventSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SocietyEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<SocietyEvent | null>(null);
  const [isEventDeleting, setIsEventDeleting] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'festival' as EventCategory,
    event_date: new Date().toISOString().split('T')[0],
    event_time: '6:00 PM - 9:00 PM',
    location: 'Society Clubhouse',
    organizer: 'Atharva Society Committee',
    description: '',
  });

  // Fetch Notices
  const fetchNotices = useCallback(async () => {
    try {
      setNoticesLoading(true);
      const res = await api.get('/notices');
      if (res.data.success && Array.isArray(res.data.data)) {
        setNotices(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load notices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load society notices',
        variant: 'destructive',
      });
    } finally {
      setNoticesLoading(false);
    }
  }, [toast]);

  // Fetch Events
  const fetchEvents = useCallback(async () => {
    try {
      setEventsLoading(true);
      const res = await api.get('/events');
      if (res.data.success && Array.isArray(res.data.data)) {
        setEvents(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load society events',
        variant: 'destructive',
      });
    } finally {
      setEventsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotices();
    fetchEvents();
  }, [fetchNotices, fetchEvents]);

  // Notice Handlers
  const openAddNoticeModal = () => {
    setEditingNotice(null);
    setNoticeForm({
      title: '',
      category: 'general',
      priority: 'normal',
      date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      location: 'All Wings / Society Wide',
      description: '',
      is_pinned: false,
    });
    setIsNoticeModalOpen(true);
  };

  const openEditNoticeModal = (notice: Notice) => {
    setEditingNotice(notice);
    setNoticeForm({
      title: notice.title,
      category: notice.category,
      priority: notice.priority,
      date: new Date(notice.date).toISOString().split('T')[0],
      expiry_date: notice.expiry_date ? new Date(notice.expiry_date).toISOString().split('T')[0] : '',
      location: notice.location || 'All Wings / Society Wide',
      description: notice.description,
      is_pinned: Boolean(notice.is_pinned),
    });
    setIsNoticeModalOpen(true);
  };

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in notice title and description',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsNoticeSubmitting(true);
      if (editingNotice) {
        const res = await api.put(`/notices/${editingNotice._id}`, noticeForm);
        if (res.data.success) {
          toast({
            title: 'Notice Updated',
            description: `${noticeForm.title} updated successfully.`,
          });
          setIsNoticeModalOpen(false);
          fetchNotices();
        }
      } else {
        const res = await api.post('/notices', noticeForm);
        if (res.data.success) {
          toast({
            title: 'Notice Published',
            description: `${noticeForm.title} published to society board.`,
          });
          setIsNoticeModalOpen(false);
          fetchNotices();
        }
      }
    } catch (error: any) {
      toast({
        title: 'Operation Failed',
        description: error.response?.data?.message || 'Could not save notice',
        variant: 'destructive',
      });
    } finally {
      setIsNoticeSubmitting(false);
    }
  };

  const handleTogglePinNotice = async (notice: Notice) => {
    try {
      const res = await api.patch(`/notices/${notice._id}/pin`);
      if (res.data.success) {
        toast({
          title: res.data.data.is_pinned ? 'Notice Pinned 📌' : 'Notice Unpinned',
          description: res.data.message,
        });
        fetchNotices();
      }
    } catch (error: any) {
      toast({
        title: 'Action Failed',
        description: error.response?.data?.message || 'Could not toggle pin status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNotice = async () => {
    if (!deletingNotice) return;
    try {
      setIsNoticeDeleting(true);
      const res = await api.delete(`/notices/${deletingNotice._id}`);
      if (res.data.success) {
        toast({
          title: 'Notice Deleted',
          description: 'Notice was removed from the society board.',
        });
        setDeletingNotice(null);
        fetchNotices();
      }
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error.response?.data?.message || 'Could not delete notice',
        variant: 'destructive',
      });
    } finally {
      setIsNoticeDeleting(false);
    }
  };

  // Event Handlers
  const openAddEventModal = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      category: 'festival',
      event_date: new Date().toISOString().split('T')[0],
      event_time: '6:00 PM - 9:00 PM',
      location: 'Society Clubhouse',
      organizer: 'Atharva Society Committee',
      description: '',
    });
    setIsEventModalOpen(true);
  };

  const openEditEventModal = (event: SocietyEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      category: event.category,
      event_date: new Date(event.event_date).toISOString().split('T')[0],
      event_time: event.event_time || '6:00 PM - 9:00 PM',
      location: event.location,
      organizer: event.organizer || 'Atharva Society Committee',
      description: event.description,
    });
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.description.trim() || !eventForm.event_date) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required event details',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsEventSubmitting(true);
      if (editingEvent) {
        const res = await api.put(`/events/${editingEvent._id}`, eventForm);
        if (res.data.success) {
          toast({
            title: 'Event Updated',
            description: `${eventForm.title} updated successfully.`,
          });
          setIsEventModalOpen(false);
          fetchEvents();
        }
      } else {
        const res = await api.post('/events', eventForm);
        if (res.data.success) {
          toast({
            title: 'Event Scheduled 🎉',
            description: `${eventForm.title} added to the society calendar.`,
          });
          setIsEventModalOpen(false);
          fetchEvents();
        }
      }
    } catch (error: any) {
      toast({
        title: 'Operation Failed',
        description: error.response?.data?.message || 'Could not save event',
        variant: 'destructive',
      });
    } finally {
      setIsEventSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;
    try {
      setIsEventDeleting(true);
      const res = await api.delete(`/events/${deletingEvent._id}`);
      if (res.data.success) {
        toast({
          title: 'Event Deleted',
          description: 'Event was removed from the calendar.',
        });
        setDeletingEvent(null);
        fetchEvents();
      }
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error.response?.data?.message || 'Could not delete event',
        variant: 'destructive',
      });
    } finally {
      setIsEventDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getPriorityBadgeClass = (priority: NoticePriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-600 text-white border-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getNoticeCategoryBadgeClass = (category: NoticeCategory) => {
    switch (category) {
      case 'maintenance':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'water_interruption':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'lift_maintenance':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'parking':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'society_meeting':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'circular':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getEventCategoryBadgeClass = (category: EventCategory) => {
    switch (category) {
      case 'festival':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'cultural':
        return 'bg-pink-100 text-pink-900 border-pink-300';
      case 'sports':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'meeting':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'celebration':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const matchesCategory =
        noticeCategoryFilter === 'all' || notice.category === noticeCategoryFilter;
      const matchesPriority =
        noticePriorityFilter === 'all' || notice.priority === noticePriorityFilter;

      const q = noticeSearch.toLowerCase();
      const matchesSearch =
        !noticeSearch ||
        notice.title.toLowerCase().includes(q) ||
        notice.description.toLowerCase().includes(q) ||
        (notice.location && notice.location.toLowerCase().includes(q));

      return matchesCategory && matchesPriority && matchesSearch;
    });
  }, [notices, noticeCategoryFilter, noticePriorityFilter, noticeSearch]);

  const filteredEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events.filter((ev) => {
      const evDate = new Date(ev.event_date);
      evDate.setHours(0, 0, 0, 0);

      const matchesTimeframe =
        eventTimeframe === 'all' ||
        (eventTimeframe === 'upcoming' && evDate >= today) ||
        (eventTimeframe === 'past' && evDate < today);

      const matchesCategory =
        eventCategoryFilter === 'all' || ev.category === eventCategoryFilter;

      const q = eventSearch.toLowerCase();
      const matchesSearch =
        !eventSearch ||
        ev.title.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.location.toLowerCase().includes(q) ||
        (ev.organizer && ev.organizer.toLowerCase().includes(q));

      return matchesTimeframe && matchesCategory && matchesSearch;
    });
  }, [events, eventTimeframe, eventCategoryFilter, eventSearch]);

  const upcomingCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.filter((e) => new Date(e.event_date) >= today).length;
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notices & Events</h1>
          <p className="text-gray-600 mt-1">
            Official announcements, maintenance circulars, and community celebrations for Atharva Society
          </p>
        </div>

        {isManagerOrAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={openAddNoticeModal}
              className="bg-teal-700 hover:bg-teal-800 text-white shadow-sm"
            >
              <Megaphone className="w-4 h-4 mr-2" />
              Publish Notice
            </Button>
            <Button
              onClick={openAddEventModal}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        )}
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('notices')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'notices'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          Society Notices ({notices.length})
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'events'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Events & Celebrations ({upcomingCount} Upcoming)
        </button>
      </div>

      {/* ==================== TAB 1: NOTICES VIEW ==================== */}
      {activeTab === 'notices' && (
        <div className="space-y-5">
          {/* Filters Bar */}
          <Card className="border shadow-sm">
            <CardContent className="pt-5 space-y-3">
              <div className="flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <Input
                    placeholder="Search notices by title, description, or wing..."
                    value={noticeSearch}
                    onChange={(e) => setNoticeSearch(e.target.value)}
                    className="pl-9 bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="w-full md:w-52">
                  <Select value={noticeCategoryFilter} onValueChange={setNoticeCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Notice Types</SelectItem>
                      {NOTICE_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-40">
                  <Select value={noticePriorityFilter} onValueChange={setNoticePriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notices Grid */}
          {noticesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredNotices.length === 0 ? (
            <Card className="text-center py-12 border-dashed">
              <CardContent className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">No Notices Found</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  No active society notices matched your filter or search criteria.
                </p>
                {isManagerOrAdmin && (
                  <Button onClick={openAddNoticeModal} variant="outline" className="mt-2">
                    <Plus className="w-4 h-4 mr-2" /> Publish First Notice
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotices.map((notice) => (
                <Card
                  key={notice._id}
                  className={`border shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${
                    notice.is_pinned
                      ? 'border-amber-300 bg-amber-50/20'
                      : notice.priority === 'urgent'
                      ? 'border-red-300 bg-red-50/10'
                      : 'bg-white'
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {notice.is_pinned && (
                            <Badge className="bg-amber-500 text-white text-[10px] flex items-center gap-1">
                              <Pin className="w-3 h-3" /> PINNED
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold uppercase ${getPriorityBadgeClass(notice.priority)}`}
                          >
                            {notice.priority}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-medium uppercase ${getNoticeCategoryBadgeClass(notice.category)}`}
                          >
                            {notice.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        <CardTitle className="text-base font-bold text-gray-900 leading-tight">
                          {notice.title}
                        </CardTitle>
                      </div>

                      {/* Manager Controls */}
                      {isManagerOrAdmin && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleTogglePinNotice(notice)}
                            className={`h-8 w-8 ${notice.is_pinned ? 'text-amber-600' : 'text-gray-400'} hover:bg-amber-50`}
                            title={notice.is_pinned ? 'Unpin notice' : 'Pin to top'}
                          >
                            {notice.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditNoticeModal(notice)}
                            className="h-8 w-8 text-gray-500 hover:text-teal-700 hover:bg-teal-50"
                            title="Edit Notice"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeletingNotice(notice)}
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete Notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-1">
                    <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                      {notice.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <span className="flex items-center gap-1 font-medium text-gray-600">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Posted: {formatDate(notice.date)}
                      </span>

                      {notice.location && (
                        <span className="flex items-center gap-1 text-gray-500 bg-gray-50 px-2 py-0.5 rounded text-[11px]">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {notice.location}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: EVENTS VIEW ==================== */}
      {activeTab === 'events' && (
        <div className="space-y-5">
          {/* Filters Bar */}
          <Card className="border shadow-sm">
            <CardContent className="pt-5 space-y-3">
              <div className="flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <Input
                    placeholder="Search events by name, location, or organizer..."
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    className="pl-9 bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="w-full md:w-48">
                  <Select value={eventTimeframe} onValueChange={(val: any) => setEventTimeframe(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming Events</SelectItem>
                      <SelectItem value="past">Past Events</SelectItem>
                      <SelectItem value="all">All Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-52">
                  <Select value={eventCategoryFilter} onValueChange={setEventCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {EVENT_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events Grid */}
          {eventsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-56 bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card className="text-center py-12 border-dashed">
              <CardContent className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">No Events Scheduled</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  No society events match your selected filters.
                </p>
                {isManagerOrAdmin && (
                  <Button onClick={openAddEventModal} variant="outline" className="mt-2">
                    <Plus className="w-4 h-4 mr-2" /> Create First Event
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvents.map((event) => {
                const evDate = new Date(event.event_date);
                const isPast = evDate < new Date(new Date().setHours(0, 0, 0, 0));

                return (
                  <Card
                    key={event._id}
                    className={`border shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${
                      isPast ? 'bg-slate-50/70 opacity-90' : 'bg-white'
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        {/* Date badge */}
                        <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-center min-w-[58px]">
                          <span className="block text-[10px] font-bold text-teal-800 uppercase">
                            {evDate.toLocaleDateString('en-IN', { month: 'short' })}
                          </span>
                          <span className="block text-xl font-extrabold text-teal-950 leading-none mt-0.5">
                            {evDate.getDate()}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold uppercase ${getEventCategoryBadgeClass(event.category)}`}
                          >
                            {event.category}
                          </Badge>
                          <CardTitle className="text-base font-bold text-gray-900 mt-1 truncate">
                            {event.title}
                          </CardTitle>
                        </div>

                        {/* Manager Controls */}
                        {isManagerOrAdmin && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditEventModal(event)}
                              className="h-7 w-7 text-gray-500 hover:text-teal-700 hover:bg-teal-50"
                              title="Edit Event"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeletingEvent(event)}
                              className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                              title="Delete Event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-1">
                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-gray-600">
                        {event.event_time && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span className="font-medium text-gray-800">{event.event_time}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>

                        {event.organizer && (
                          <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                            <Users className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate">Organized by: {event.organizer}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* Publish / Edit Notice Modal */}
      <Dialog open={isNoticeModalOpen} onOpenChange={setIsNoticeModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-teal-700" />
              {editingNotice ? 'Edit Society Notice' : 'Publish Society Notice'}
            </DialogTitle>
            <DialogDescription>
              Broadcast maintenance circulars, water alerts, or general society notices
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleNoticeSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="notice_title" className="text-xs font-semibold">Notice Title *</Label>
              <Input
                id="notice_title"
                placeholder="e.g., Scheduled Water Interruption, Lift Maintenance on 28th"
                value={noticeForm.title}
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="notice_cat" className="text-xs font-semibold">Category *</Label>
                <Select
                  value={noticeForm.category}
                  onValueChange={(val: NoticeCategory) => setNoticeForm({ ...noticeForm, category: val })}
                >
                  <SelectTrigger id="notice_cat">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTICE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notice_pri" className="text-xs font-semibold">Priority *</Label>
                <Select
                  value={noticeForm.priority}
                  onValueChange={(val: NoticePriority) => setNoticeForm({ ...noticeForm, priority: val })}
                >
                  <SelectTrigger id="notice_pri">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="notice_date" className="text-xs font-semibold">Publish Date</Label>
                <Input
                  id="notice_date"
                  type="date"
                  value={noticeForm.date}
                  onChange={(e) => setNoticeForm({ ...noticeForm, date: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notice_loc" className="text-xs font-semibold">Applicable Wings / Area</Label>
                <Input
                  id="notice_loc"
                  placeholder="e.g. Wing A & B, All Wings"
                  value={noticeForm.location}
                  onChange={(e) => setNoticeForm({ ...noticeForm, location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notice_desc" className="text-xs font-semibold">Notice Content / Details *</Label>
              <Textarea
                id="notice_desc"
                placeholder="Full details, instructions, emergency contact, timeline..."
                value={noticeForm.description}
                onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })}
                rows={4}
                required
                className="resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="notice_pinned"
                checked={noticeForm.is_pinned}
                onChange={(e) => setNoticeForm({ ...noticeForm, is_pinned: e.target.checked })}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <Label htmlFor="notice_pinned" className="text-xs font-medium cursor-pointer">
                Pin this notice to the top of the board
              </Label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsNoticeModalOpen(false)} disabled={isNoticeSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isNoticeSubmitting} className="bg-teal-700 hover:bg-teal-800 text-white">
                {isNoticeSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingNotice ? (
                  'Save Changes'
                ) : (
                  'Publish Notice'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Event Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              {editingEvent ? 'Edit Society Event' : 'Schedule Society Event'}
            </DialogTitle>
            <DialogDescription>
              Schedule festivals, cultural celebrations, sports activities, or general meetings
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEventSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="event_title" className="text-xs font-semibold">Event Title *</Label>
              <Input
                id="event_title"
                placeholder="e.g. Diwali Celebration, Annual General Meeting, Ganpati Utsav"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="event_cat" className="text-xs font-semibold">Category *</Label>
                <Select
                  value={eventForm.category}
                  onValueChange={(val: EventCategory) => setEventForm({ ...eventForm, category: val })}
                >
                  <SelectTrigger id="event_cat">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event_date" className="text-xs font-semibold">Event Date *</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={eventForm.event_date}
                  onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="event_time" className="text-xs font-semibold">Time / Schedule</Label>
                <Input
                  id="event_time"
                  placeholder="e.g. 6:30 PM onwards, 10:00 AM - 1:00 PM"
                  value={eventForm.event_time}
                  onChange={(e) => setEventForm({ ...eventForm, event_time: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event_venue" className="text-xs font-semibold">Venue / Location *</Label>
                <Input
                  id="event_venue"
                  placeholder="e.g. Society Clubhouse, Amphitheatre"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event_org" className="text-xs font-semibold">Organizer / Committee</Label>
              <Input
                id="event_org"
                placeholder="e.g. Cultural Committee, Atharva Youth Club"
                value={eventForm.organizer}
                onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event_desc" className="text-xs font-semibold">Event Description & Program Flow *</Label>
              <Textarea
                id="event_desc"
                placeholder="Detailed itinerary, participation details, dress code..."
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                rows={3}
                required
                className="resize-none"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEventModalOpen(false)} disabled={isEventSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isEventSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isEventSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingEvent ? (
                  'Save Changes'
                ) : (
                  'Schedule Event'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Notice Confirmation */}
      <Dialog open={Boolean(deletingNotice)} onOpenChange={(open) => !open && setDeletingNotice(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Notice
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{deletingNotice?.title}</strong> from the society notice board?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingNotice(null)} disabled={isNoticeDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNotice} disabled={isNoticeDeleting}>
              {isNoticeDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Confirmation */}
      <Dialog open={Boolean(deletingEvent)} onOpenChange={(open) => !open && setDeletingEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Event
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel and remove <strong>{deletingEvent?.title}</strong> from the calendar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingEvent(null)} disabled={isEventDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent} disabled={isEventDeleting}>
              {isEventDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
