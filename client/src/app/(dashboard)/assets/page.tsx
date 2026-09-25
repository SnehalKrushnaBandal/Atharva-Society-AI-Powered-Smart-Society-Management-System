'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAssets, AssetStats } from '@/hooks/useAssets';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Asset } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Building2,
  Droplets,
  Zap,
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
  Package,
  ShieldCheck
} from 'lucide-react';
import { ASSET_CATEGORIES } from '@/lib/constants';

export default function ResidentAssetsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { getAssets } = useAssets();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<AssetStats>({ total: 0, working: 0, under_maintenance: 0, not_working: 0 });
  const [dataLoading, setDataLoading] = useState(true);
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Society Assets</h1>
          <p className="text-gray-600 mt-1">Overview of common society facilities, equipment, and equipment health</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAssets} disabled={dataLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {isAdminOrManager && (
            <Link href="/admin/assets">
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Manage Assets
              </Button>
            </Link>
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
                <p className="text-sm font-medium text-gray-600">Operational</p>
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
                <p className="text-sm font-medium text-gray-600">In Maintenance</p>
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
                <p className="text-sm font-medium text-gray-600">Out of Order</p>
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
                placeholder="Search assets by name or location..."
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
            <ShieldCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Assets Found</h3>
            <p className="text-gray-600 mt-1">
              No society assets matched your search criteria.
            </p>
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
                    <span className="text-slate-500 text-xs">Available Quantity:</span>
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
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                      <Wrench className="w-3 h-3" /> Last Inspected / Serviced:
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

                {/* Service History Read-Only */}
                {asset.services && asset.services.length > 0 && (
                  <Collapsible
                    open={expandedAssets.has(asset._id)}
                    onOpenChange={() => toggleExpanded(asset._id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-between text-xs py-1.5 h-auto text-slate-600">
                        <span className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                          Maintenance History ({asset.services.length})
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
    </div>
  );
}
