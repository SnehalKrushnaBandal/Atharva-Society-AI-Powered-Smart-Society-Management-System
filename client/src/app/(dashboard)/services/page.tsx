'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { SocietyService, ServiceCategory } from '@/types';
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
  Phone,
  Plus,
  Edit2,
  Trash2,
  Search,
  Wrench,
  Zap,
  Droplets,
  HeartPulse,
  Ambulance,
  Flame,
  ShieldCheck,
  ArrowUpDown,
  Building,
  Clock,
  User,
  Loader2,
  AlertTriangle,
  Sparkles,
  PhoneCall
} from 'lucide-react';

const CATEGORY_OPTIONS: { value: ServiceCategory; label: string; icon: any }[] = [
  { value: 'medical', label: 'Doctor & Medical', icon: HeartPulse },
  { value: 'ambulance', label: 'Ambulance', icon: Ambulance },
  { value: 'plumber', label: 'Plumber & Water', icon: Droplets },
  { value: 'electrician', label: 'Electrician & Power', icon: Zap },
  { value: 'security', label: 'Security & Gate', icon: ShieldCheck },
  { value: 'lift_technician', label: 'Lift Technician', icon: ArrowUpDown },
  { value: 'fire_safety', label: 'Fire & Safety', icon: Flame },
  { value: 'society_office', label: 'Society Office', icon: Building },
  { value: 'other', label: 'Other Approved Services', icon: Wrench },
];

export default function ServicesPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const isManagerOrAdmin = user && ['manager', 'admin'].includes(user.role);

  const [services, setServices] = useState<SocietyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingService, setEditingService] = useState<SocietyService | null>(null);

  // Delete State
  const [deletingService, setDeletingService] = useState<SocietyService | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    category: 'other' as ServiceCategory,
    contact_person: '',
    phone: '',
    timing: '8:00 AM - 8:00 PM',
    description: '',
    is_emergency: false,
  });

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/services');
      if (res.data.success && Array.isArray(res.data.data)) {
        setServices(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load society services:', error);
      toast({
        title: 'Error',
        description: 'Failed to load services directory',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'other',
      contact_person: '',
      phone: '',
      timing: '8:00 AM - 8:00 PM',
      description: '',
      is_emergency: false,
    });
    setIsFormOpen(true);
  };

  const openEditModal = (service: SocietyService) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      contact_person: service.contact_person || '',
      phone: service.phone || '',
      timing: service.timing || 'Available on Call',
      description: service.description || '',
      is_emergency: Boolean(service.is_emergency),
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a service name',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingService) {
        // Update
        const res = await api.put(`/services/${editingService._id}`, formData);
        if (res.data.success) {
          toast({
            title: 'Service Updated',
            description: `${formData.name} updated successfully.`,
          });
          setIsFormOpen(false);
          fetchServices();
        }
      } else {
        // Create
        const res = await api.post('/services', formData);
        if (res.data.success) {
          toast({
            title: 'Service Added',
            description: `${formData.name} added to society directory.`,
          });
          setIsFormOpen(false);
          fetchServices();
        }
      }
    } catch (error: any) {
      toast({
        title: 'Operation Failed',
        description: error.response?.data?.message || 'Could not save service',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingService) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/services/${deletingService._id}`);
      if (res.data.success) {
        toast({
          title: 'Service Deleted',
          description: `${deletingService.name} was removed from the directory.`,
        });
        setDeletingService(null);
        fetchServices();
      }
    } catch (error: any) {
      toast({
        title: 'Deletion Failed',
        description: error.response?.data?.message || 'Could not delete service',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical':
        return <HeartPulse className="w-5 h-5 text-red-600" />;
      case 'ambulance':
        return <Ambulance className="w-5 h-5 text-red-600" />;
      case 'plumber':
        return <Droplets className="w-5 h-5 text-cyan-600" />;
      case 'electrician':
        return <Zap className="w-5 h-5 text-amber-600" />;
      case 'security':
        return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      case 'lift_technician':
        return <ArrowUpDown className="w-5 h-5 text-indigo-600" />;
      case 'fire_safety':
        return <Flame className="w-5 h-5 text-orange-600" />;
      case 'society_office':
        return <Building className="w-5 h-5 text-teal-600" />;
      default:
        return <Wrench className="w-5 h-5 text-slate-600" />;
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
      case 'society_office':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        selectedCategory === 'all' || service.category === selectedCategory;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        service.name.toLowerCase().includes(q) ||
        (service.contact_person && service.contact_person.toLowerCase().includes(q)) ||
        (service.phone && service.phone.toLowerCase().includes(q)) ||
        (service.description && service.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Society Services</h1>
          <p className="text-gray-600 mt-1">
            Approved technicians, doctors, plumbers, electricians, and society office contacts
          </p>
        </div>

        {isManagerOrAdmin && (
          <Button
            onClick={openAddModal}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Society Service
          </Button>
        )}
      </div>

      {/* Filters & Search Bar */}
      <Card className="border shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <Input
                placeholder="Search services by name, technician, phone, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200"
              />
            </div>

            {/* Category Dropdown (Mobile) */}
            <div className="w-full md:w-56">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category Pills (Desktop) */}
          <div className="hidden md:flex flex-wrap gap-1.5 pt-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({services.length})
            </button>
            {CATEGORY_OPTIONS.map((opt) => {
              const count = services.filter((s) => s.category === opt.value).length;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelectedCategory(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    selectedCategory === opt.value
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt.label} {count > 0 && <span className="opacity-75">({count})</span>}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <CardContent className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No Services Found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              No society services matched your search or category filter.
            </p>
            {isManagerOrAdmin && (
              <Button onClick={openAddModal} variant="outline" className="mt-2">
                <Plus className="w-4 h-4 mr-2" /> Add Service Now
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => (
            <Card
              key={service._id}
              className={`border shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${
                service.is_emergency ? 'border-red-200 bg-gradient-to-b from-red-50/20 to-white' : 'bg-white'
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                      {getCategoryIcon(service.category)}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base font-bold text-gray-900 truncate">
                        {service.name}
                      </CardTitle>
                      {service.contact_person && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="truncate">{service.contact_person}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Manager Edit/Delete Actions */}
                  {isManagerOrAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditModal(service)}
                        className="h-8 w-8 text-gray-500 hover:text-teal-700 hover:bg-teal-50"
                        title="Edit Service"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeletingService(service)}
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete Service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-1">
                {/* Category & Timing */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold uppercase ${getCategoryBadgeClass(service.category)}`}
                  >
                    {service.category.replace('_', ' ')}
                  </Badge>
                  {service.is_emergency && (
                    <Badge className="bg-red-600 hover:bg-red-600 text-white text-[10px]">
                      Emergency Helpline
                    </Badge>
                  )}
                </div>

                {service.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1 font-medium text-gray-600">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {service.timing || 'Available on Call'}
                  </span>
                  {service.phone && (
                    <span className="font-mono font-semibold text-gray-800">
                      {service.phone}
                    </span>
                  )}
                </div>

                {/* Call Action vs Not Configured Notice */}
                {service.phone && service.phone.trim() ? (
                  <a
                    href={`tel:${service.phone.replace(/[\s-]/g, '')}`}
                    className={`inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg text-sm font-bold shadow-sm transition-colors ${
                      service.is_emergency
                        ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white'
                        : 'bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    Call ({service.phone})
                  </a>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-center">
                    <span className="text-xs font-semibold text-slate-500 block">
                      Contact not configured
                    </span>
                    {isManagerOrAdmin && (
                      <button
                        type="button"
                        onClick={() => openEditModal(service)}
                        className="text-[11px] text-teal-700 hover:underline font-medium mt-0.5 block mx-auto"
                      >
                        Edit to configure number →
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Service Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Wrench className="w-5 h-5 text-teal-700" />
              {editingService ? 'Edit Society Service' : 'Add New Society Service'}
            </DialogTitle>
            <DialogDescription>
              Configure society contact, technician, or medical helpline information
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">Service / Contact Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Apex Elevator Tech, Dr. Sharma Clinic, Society Electrician"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val: ServiceCategory) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact_person" className="text-xs font-semibold">Contact Person / Technician</Label>
                <Input
                  id="contact_person"
                  placeholder="e.g. Mahesh Kumar, Dr. Patel"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="e.g. 112, 108, or 10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="timing" className="text-xs font-semibold">Availability / Timing</Label>
                <Input
                  id="timing"
                  placeholder="e.g. 24/7 Emergency, 8 AM - 8 PM"
                  value={formData.timing}
                  onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">Description / Scope</Label>
              <Textarea
                id="description"
                placeholder="Details of services offered, emergency coverage, location..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_emergency"
                checked={formData.is_emergency}
                onChange={(e) => setFormData({ ...formData, is_emergency: e.target.checked })}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <Label htmlFor="is_emergency" className="text-xs font-medium cursor-pointer">
                Mark as Critical Emergency Helpline (Show prominently in Emergency SOS section)
              </Label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-teal-700 hover:bg-teal-800 text-white">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingService ? (
                  'Save Changes'
                ) : (
                  'Add Service'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deletingService)} onOpenChange={(open) => !open && setDeletingService(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Service
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{deletingService?.name}</strong> from the society services directory?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingService(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
