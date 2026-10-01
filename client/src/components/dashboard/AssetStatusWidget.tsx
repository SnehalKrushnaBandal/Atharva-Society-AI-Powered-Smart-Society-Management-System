'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssets } from '@/hooks/useAssets';
import { Asset } from '@/types';
import {
  Building2,
  Droplets,
  Zap,
  ArrowRight,
  Camera,
  Flame,
  Lightbulb,
  Fan,
  Tv,
  Package,
} from 'lucide-react';

type AssetStatus = 'working' | 'under_maintenance' | 'not_working';

interface AssetStatusWidgetProps {
  isAdmin?: boolean;
}

const assetIcons: Record<string, React.ReactNode> = {
  lift: <Building2 className="w-4 h-4" />,
  water_pump: <Droplets className="w-4 h-4" />,
  generator: <Zap className="w-4 h-4" />,
  cctv: <Camera className="w-4 h-4" />,
  fire_extinguisher: <Flame className="w-4 h-4" />,
  lights: <Lightbulb className="w-4 h-4" />,
  fans: <Fan className="w-4 h-4" />,
  projector: <Tv className="w-4 h-4" />,
};

const assetLabels: Record<string, string> = {
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
  other: 'Equipment',
};

const statusConfig: Record<AssetStatus, { label: string; color: string; bgColor: string; dotColor: string }> = {
  working: {
    label: 'Working',
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-50/70 border border-emerald-200/60',
    dotColor: 'bg-emerald-600',
  },
  under_maintenance: {
    label: 'Maintenance',
    color: 'text-amber-800',
    bgColor: 'bg-amber-50/70 border border-amber-200/60',
    dotColor: 'bg-amber-600',
  },
  not_working: {
    label: 'Not Working',
    color: 'text-red-800',
    bgColor: 'bg-red-50/70 border border-red-200/60',
    dotColor: 'bg-red-600',
  },
};

export default function AssetStatusWidget({
  isAdmin = false,
}: AssetStatusWidgetProps) {
  const { getAssets } = useAssets();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await getAssets();
        setAssets(response.data);
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, [getAssets]);

  // Calculate overall status
  const getOverallStatus = () => {
    if (assets.length === 0) return 'unknown';
    const hasNotWorking = assets.some((a) => a.status === 'not_working');
    const hasMaintenance = assets.some((a) => a.status === 'under_maintenance');

    if (hasNotWorking) return 'critical';
    if (hasMaintenance) return 'warning';
    return 'healthy';
  };

  const overallStatus = getOverallStatus();

  // Group assets by type for summary display
  const assetsByType = assets.reduce((acc, asset) => {
    const key = asset.type || 'other';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(asset);
    return acc;
  }, {} as Record<string, Asset[]>);

  // Get worst status for each type
  const getTypeStatus = (typeAssets: Asset[]): AssetStatus => {
    if (typeAssets.some(a => a.status === 'not_working')) return 'not_working';
    if (typeAssets.some(a => a.status === 'under_maintenance')) return 'under_maintenance';
    return 'working';
  };

  if (loading) {
    return (
      <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              <Building2 className="w-4 h-4" />
            </div>
            Society Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-9 bg-slate-100 rounded-xl"></div>
            <div className="h-9 bg-slate-100 rounded-xl"></div>
            <div className="h-9 bg-slate-100 rounded-xl"></div>
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
              <Building2 className="w-4 h-4" />
            </div>
            <span>Society Assets</span>
          </CardTitle>
          {overallStatus === 'healthy' && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
              All OK
            </span>
          )}
          {overallStatus === 'warning' && (
            <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
              Maintenance
            </span>
          )}
          {overallStatus === 'critical' && (
            <span className="text-xs font-bold text-red-800 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
              Attention Needed
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        {assets.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No assets configured</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(assetsByType).slice(0, 4).map(([type, typeAssets]) => {
              const status = getTypeStatus(typeAssets);
              const config = statusConfig[status];
              const totalQuantity = typeAssets.reduce((sum, a) => sum + (a.quantity || 1), 0);
              return (
                <div
                  key={type}
                  className={`flex items-center justify-between p-2.5 rounded-xl ${config.bgColor}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="text-slate-700">{assetIcons[type] || <Package className="w-4 h-4" />}</div>
                    <span className="text-xs font-bold text-slate-900">
                      {assetLabels[type] || type} {totalQuantity > 1 && `(${totalQuantity})`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${config.dotColor}`}></span>
                    <span className={`text-xs font-bold ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Link
          href={isAdmin ? "/admin/assets" : "/assets"}
          className="flex items-center justify-center gap-1 text-center text-xs text-teal-700 hover:text-teal-800 font-bold pt-1"
        >
          {isAdmin ? 'Manage Society Inventory' : 'View Assets Inventory'} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
