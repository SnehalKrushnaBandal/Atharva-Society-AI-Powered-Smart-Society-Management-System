'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAssets, AssetStats, CreateAssetData, UpdateAssetData, AddServiceData } from '@/hooks/useAssets';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Asset } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Building2, 
  Droplets, 
  Zap, 
  Plus, 
  Wrench, 
  Settings, 
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Calendar,
  RefreshCw,
  Trash2,
  Edit,
  Search,
  Filter,
  Camera,
  Flame,
  Lightbulb,
  Fan,
  Tv,
  Layers,
  MapPin,
  FileText,
  Package
} from 'lucide-react';
import { ASSET_CATEGORIES } from '@/lib/constants';

export default function AdminAssetsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    getAssets, 
    createAsset, 
    updateAsset,
    updateAssetStatus, 
    addServiceEntry,
    deleteAsset
  } = useAssets();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<AssetStats>({ total: 0, working: 0, under_maintenance: 0, not_working: 0 });
  const [dataLoading, setDataLoading] = useState(true);
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateAssetData>({
    name: '',
    type: 'lift',
    category: 'General',
    quantity: 1,
    status: 'working',
    location: '',
    purchase_date: '',
    notes: '',
  });

  const [newStatus, setNewStatus] = useState<'working' | 'under_maintenance' | 'not_working'>('working');
  const [serviceData, setServiceData] = useState<AddServiceData>({
    description: '',
    done_by: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [actionLoading, setActionLoading] = useState(false);

  const isManager = user?.role === 'manager';
  const isAdminOrManager = user && ['manager', 'admin'].includes(user.role);

  const fetchAssets = useCallback(async () => {
    setDataLoading(true);
    try {
      const statusParam = statusFilter !== 'all' ? statusFilter : undefined;
      const categoryParam = categoryFilter !== 'all' ? categoryFilter : undefined;
      const searchParam = searchQuery.trim() || undefined;

      const response = await getAssets(statusParam, undefined, categoryParam, searchParam);
      setAssets(response.data);
      setStats(response.stats);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch assets',
        variant: 'destructive',
      });
    } finally {
      setDataLoading(false);
    }
  }, [getAssets, statusFilter, categoryFilter, searchQuery, toast]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const toggleExpanded = (assetId: string) => {
    setExpandedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };

  const getAssetIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'lift':
        return <Building2 className="h-5 w-5" />;
      case 'water_pump':
        return <Droplets className="h-5 w-5" />;
      case 'generator':
        return <Zap className="h-5 w-5" />;
      case 'cctv':
        return <Camera className="h-5 w-5" />;
      case 'fire_extinguisher':
        return <Flame className="h-5 w-5" />;
      case 'lights':
        return <Lightbulb className="h-5 w-5" />;
      case 'fans':
        return <Fan className="h-5 w-5" />;
      case 'projector':
        return <Tv className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getAssetTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      lift: 'Lift',
      water_pump: 'Water Pump',
      generator: 'Generator',
      chairs: 'Chairs',
      tables: 'Tables',
      benches: 'Benches',
      lights: 'Lights',
      fans: 'Fans',
      projector: 'Projector',
      cctv: 'CCTV Camera',
      fire_extinguisher: 'Fire Extinguisher',
      ladder: 'Ladder',
      other: 'Equipment / Other'
    };
    return labels[type.toLowerCase()] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'working':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Working
          </Badge>
        );
      case 'under_maintenance':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Maintenance
          </Badge>
        );
      case 'not_working':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Not Working
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Create Asset
  const openCreateDialog = () => {
    setFormData({
      name: '',
      type: 'lift',
      category: 'General',
      quantity: 1,
      status: 'working',
      location: '',
      purchase_date: '',
      notes: '',
    });
    setCreateDialogOpen(true);
  };

  const handleCreateAsset = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Asset name is required',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    try {
      await createAsset(formData);
      toast({
        title: 'Success',
        description: 'Asset created successfully',
      });
      setCreateDialogOpen(false);
      fetchAssets();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create asset',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Asset
  const openEditDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      category: asset.category || 'General',
      quantity: asset.quantity || 1,
      status: asset.status,
      location: asset.location || '',
      purchase_date: asset.purchase_date ? new Date(asset.purchase_date).toISOString().split('T')[0] : '',
      notes: asset.notes || '',
    });
    setEditDialogOpen(true);
  };

  const handleEditAsset = async () => {
    if (!selectedAsset) return;
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Asset name is required',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    try {
      await updateAsset(selectedAsset._id, formData as UpdateAssetData);
      toast({
        title: 'Success',
        description: 'Asset updated successfully',
      });
      setEditDialogOpen(false);
      fetchAssets();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update asset',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Update Status
  const openStatusDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setNewStatus(asset.status);
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedAsset) return;

    setActionLoading(true);
    try {
      await updateAssetStatus(selectedAsset._id, newStatus);
      toast({
        title: 'Status Updated',
        description: `Asset status changed to ${newStatus.replace('_', ' ')}`,
      });
      setStatusDialogOpen(false);
      fetchAssets();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Add Service Entry
  const openServiceDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setServiceData({
      description: '',
      done_by: '',
      date: new Date().toISOString().split('T')[0],
    });
    setServiceDialogOpen(true);
  };

  const handleAddService = async () => {
    if (!selectedAsset) return;

    if (!serviceData.description.trim() || !serviceData.done_by.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Description and technician name are required',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    try {
      await addServiceEntry(selectedAsset._id, serviceData);
      toast({
        title: 'Service Logged',
        description: 'Service entry added successfully',
      });
      setServiceDialogOpen(false);
      fetchAssets();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add service entry',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Asset
  const openDeleteDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAsset = async () => {
    if (!selectedAsset) return;

    setActionLoading(true);
    try {
      await deleteAsset(selectedAsset._id);
      toast({
        title: 'Asset Deleted',
        description: 'Asset has been removed',
      });
      setDeleteDialogOpen(false);
      fetchAssets();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete asset',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-gray-600 mt-1">Manage society equipment, inventory, and maintenance logs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAssets} disabled={dataLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {isAdminOrManager && (
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Working</p>
                <p className="text-2xl font-bold text-green-600">{stats.working}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-amber-600">{stats.under_maintenance}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Not Working</p>
                <p className="text-2xl font-bold text-red-600">{stats.not_working}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search assets by name, location, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <Layers className="w-4 h-4 mr-1" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {ASSET_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-1" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="working">Working</SelectItem>
                  <SelectItem value="under_maintenance">Maintenance</SelectItem>
                  <SelectItem value="not_working">Not Working</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      {dataLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : assets.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Assets Found</h3>
            <p className="text-gray-600 mt-1">
              {isAdminOrManager ? 'Add your first society asset to get started.' : 'No assets found matching your filter.'}
            </p>
            {isAdminOrManager && (
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card key={asset._id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      asset.status === 'working' ? 'bg-green-100 text-green-700' :
                      asset.status === 'under_maintenance' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {getAssetIcon(asset.type)}
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-900">{asset.name}</CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        {getAssetTypeLabel(asset.type)} • {asset.category || 'General'}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(asset.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Details */}
                <div className="space-y-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs">Quantity:</span>
                    <Badge variant="outline" className="bg-white font-semibold">
                      {asset.quantity || 1} Unit{(asset.quantity || 1) > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {asset.location && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Location:
                      </span>
                      <span className="font-medium text-slate-800 text-xs">{asset.location}</span>
                    </div>
                  )}
                  {asset.purchase_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Purchased:
                      </span>
                      <span className="font-medium text-slate-800 text-xs">{formatDate(asset.purchase_date)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                      <Wrench className="w-3 h-3" /> Last Service:
                    </span>
                    <span className="font-medium text-slate-800 text-xs">{formatDate(asset.last_service_date)}</span>
                  </div>
                </div>

                {/* Notes if any */}
                {asset.notes && (
                  <div className="p-2.5 bg-blue-50/50 rounded-lg text-xs text-slate-600 flex items-start gap-1.5 border border-blue-100/50">
                    <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="line-clamp-2">{asset.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={() => openStatusDialog(asset)}
                  >
                    <Settings className="h-3.5 w-3.5 mr-1 text-slate-500" />
                    Status
                  </Button>

                  {isAdminOrManager && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => openEditDialog(asset)}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1 text-blue-600" />
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => openServiceDialog(asset)}
                      >
                        <Wrench className="h-3.5 w-3.5 mr-1 text-amber-600" />
                        Service
                      </Button>
                    </>
                  )}

                  {isManager && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                      onClick={() => openDeleteDialog(asset)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                {/* Service History */}
                {asset.services && asset.services.length > 0 && (
                  <Collapsible 
                    open={expandedAssets.has(asset._id)}
                    onOpenChange={() => toggleExpanded(asset._id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-between text-xs py-1.5 h-auto text-slate-600">
                        <span className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                          Service History ({asset.services.length})
                        </span>
                        {expandedAssets.has(asset._id) ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {[...asset.services].reverse().map((service, index) => (
                          <div 
                            key={service._id || index}
                            className="p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-100"
                          >
                            <div className="flex justify-between mb-1">
                              <span className="font-semibold text-slate-800">{formatDate(service.date)}</span>
                              <span className="text-slate-500">by {service.done_by}</span>
                            </div>
                            <p className="text-slate-700">{service.description}</p>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Asset Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Society Asset</DialogTitle>
            <DialogDescription>
              Register society equipment, inventory, or shared community assets.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Club House Chairs, Main Lift, CCTV Camera 01"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="type">Asset Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lift">Lift</SelectItem>
                    <SelectItem value="water_pump">Water Pump</SelectItem>
                    <SelectItem value="generator">Generator</SelectItem>
                    <SelectItem value="chairs">Chairs</SelectItem>
                    <SelectItem value="tables">Tables</SelectItem>
                    <SelectItem value="benches">Benches</SelectItem>
                    <SelectItem value="lights">Lights</SelectItem>
                    <SelectItem value="fans">Fans</SelectItem>
                    <SelectItem value="projector">Projector</SelectItem>
                    <SelectItem value="cctv">CCTV Camera</SelectItem>
                    <SelectItem value="fire_extinguisher">Fire Extinguisher</SelectItem>
                    <SelectItem value="ladder">Ladder</SelectItem>
                    <SelectItem value="other">Other Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category || 'General'}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={formData.quantity || 1}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="status">Condition / Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="working">Working</SelectItem>
                    <SelectItem value="under_maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="not_working">Not Working</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Wing A, Ground Floor, Club House"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date || ''}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes / Description (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes, model numbers, warranty or supplier details..."
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAsset} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Asset Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Asset Details</DialogTitle>
            <DialogDescription>
              Update information for {selectedAsset?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <Label htmlFor="edit-name">Asset Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-type">Asset Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lift">Lift</SelectItem>
                    <SelectItem value="water_pump">Water Pump</SelectItem>
                    <SelectItem value="generator">Generator</SelectItem>
                    <SelectItem value="chairs">Chairs</SelectItem>
                    <SelectItem value="tables">Tables</SelectItem>
                    <SelectItem value="benches">Benches</SelectItem>
                    <SelectItem value="lights">Lights</SelectItem>
                    <SelectItem value="fans">Fans</SelectItem>
                    <SelectItem value="projector">Projector</SelectItem>
                    <SelectItem value="cctv">CCTV Camera</SelectItem>
                    <SelectItem value="fire_extinguisher">Fire Extinguisher</SelectItem>
                    <SelectItem value="ladder">Ladder</SelectItem>
                    <SelectItem value="other">Other Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.category || 'General'}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min={1}
                  value={formData.quantity || 1}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Condition / Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="working">Working</SelectItem>
                    <SelectItem value="under_maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="not_working">Not Working</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-purchase_date">Purchase Date</Label>
                <Input
                  id="edit-purchase_date"
                  type="date"
                  value={formData.purchase_date || ''}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes / Description</Label>
              <Textarea
                id="edit-notes"
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAsset} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Asset Status</DialogTitle>
            <DialogDescription>
              Change the operating status of {selectedAsset?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Status</Label>
              <div className="mt-1">{selectedAsset && getStatusBadge(selectedAsset.status)}</div>
            </div>
            <div>
              <Label htmlFor="newStatus">New Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as any)}
              >
                <SelectTrigger id="newStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="working">Working</SelectItem>
                  <SelectItem value="under_maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="not_working">Not Working</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Service Dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Service Entry</DialogTitle>
            <DialogDescription>
              Add a maintenance record for {selectedAsset?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="serviceDate">Service Date</Label>
              <Input
                id="serviceDate"
                type="date"
                value={serviceData.date}
                onChange={(e) => setServiceData({ ...serviceData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="doneBy">Technician Name *</Label>
              <Input
                id="doneBy"
                placeholder="e.g., Ramesh Kumar, Otis Support"
                value={serviceData.done_by}
                onChange={(e) => setServiceData({ ...serviceData, done_by: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Service Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe service performed, parts replaced, routine inspection notes..."
                rows={3}
                value={serviceData.description}
                onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddService} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Service Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Asset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAsset?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAsset} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
