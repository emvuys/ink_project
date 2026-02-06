import { Package, Users, AlertTriangle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

export function StatCards() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: statsApi.getDashboard,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat-card p-4">
            <Skeleton className="h-4 w-20 mb-3" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat-card p-4 col-span-full text-center text-muted-foreground">
          Failed to load statistics
        </div>
      </div>
    );
  }

  const statItems = [
    {
      label: 'Total Merchants',
      value: stats.totalMerchants,
      icon: Users,
      color: 'text-primary',
    },
    {
      label: 'Stickers in Circulation',
      value: stats.totalStickersInCirculation,
      icon: Package,
      color: 'text-[hsl(var(--status-success))]',
    },
    {
      label: 'Low Stock Alerts',
      value: stats.lowStockCount,
      icon: AlertTriangle,
      color: 'text-[hsl(var(--status-critical))]',
    },
    {
      label: 'Pending Fulfillment',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-[hsl(var(--status-warning))]',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {statItems.map((stat) => (
        <div key={stat.label} className="stat-card p-4">
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <div className={`p-1.5 rounded-md bg-muted ${stat.color}`}>
              <stat.icon className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-semibold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
