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
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    dotColor: 'bg-green-500',
  },
  under_maintenance: {
    label: 'Maintenance',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    dotColor: 'bg-amber-500',
  },
  not_working: {
    label: 'Not Working',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    dotColor: 'bg-red-500',
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
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-slate-600" />
            </div>
            Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-slate-600" />
            </div>
            Assets
          </CardTitle>
          {overallStatus === 'healthy' && (
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              All OK
            </span>
          )}
          {overallStatus === 'warning' && (
            <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
              Maintenance
            </span>
          )}
          {overallStatus === 'critical' && (
            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
              Issue
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {assets.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No assets configured</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(assetsByType).slice(0, 4).map(([type, typeAssets]) => {
              const status = getTypeStatus(typeAssets);
              const config = statusConfig[status];
              const totalQuantity = typeAssets.reduce((sum, a) => sum + (a.quantity || 1), 0);
              return (
                <div
                  key={type}
                  className={`flex items-center justify-between p-2.5 rounded-lg ${config.bgColor}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-slate-600">{assetIcons[type] || <Package className="w-4 h-4" />}</div>
                    <span className="text-sm font-medium text-gray-700">
                      {assetLabels[type] || type} {totalQuantity > 1 && `(${totalQuantity})`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${config.dotColor}`}></span>
                    <span className={`text-xs font-medium ${config.color}`}>
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
          className="flex items-center justify-center gap-1 text-center text-sm text-teal-600 hover:text-teal-700 font-medium mt-2"
        >
          {isAdmin ? 'Manage Assets' : 'View All Assets'} <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
