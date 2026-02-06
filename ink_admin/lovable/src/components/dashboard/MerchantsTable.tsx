import { useState } from 'react';
import { Search, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { merchantsApi, Merchant } from '@/services/api';
import { cn } from '@/lib/utils';

interface MerchantsTableProps {
  onViewDetails: (merchant: Merchant) => void;
}

type SortField = 'name' | 'inventory' | 'lastRefill' | 'totalUsed';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'low' | 'critical';

export function MerchantsTable({ onViewDetails }: MerchantsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const { data, isLoading, error } = useQuery({
    queryKey: ['merchants', { search, status: statusFilter, sortBy: sortField, sortOrder: sortDirection }],
    queryFn: () => merchantsApi.getAll({
      search: search || undefined,
      status: statusFilter,
      sortBy: sortField,
      sortOrder: sortDirection,
    }),
  });

  const merchants = data?.data || [];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStockStatus = (inventory: number, threshold: number = 5) => {
    if (inventory > 10) return { status: 'success', label: 'Healthy' };
    if (inventory >= threshold) return { status: 'warning', label: 'Low Stock' };
    return { status: 'critical', label: 'Critical' };
  };

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Failed to load merchants. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search merchants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="critical">Critical Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="data-table overflow-x-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('name')}
                >
                  <span className="flex items-center gap-1">
                    Merchant Name <SortIcon field="name" />
                  </span>
                </th>
                <th
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('inventory')}
                >
                  <span className="flex items-center gap-1">
                    Current Inventory <SortIcon field="inventory" />
                  </span>
                </th>
                <th>Status</th>
                <th
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('lastRefill')}
                >
                  <span className="flex items-center gap-1">
                    Last Refill <SortIcon field="lastRefill" />
                  </span>
                </th>
                <th
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('totalUsed')}
                >
                  <span className="flex items-center gap-1">
                    Total Used <SortIcon field="totalUsed" />
                  </span>
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((merchant) => {
                const stockStatus = merchant.stockStatus || getStockStatus(merchant.currentInventory, merchant.alertThreshold);
                return (
                  <tr key={merchant.id}>
                    <td className="font-medium">{merchant.name}</td>
                    <td>{merchant.currentInventory}</td>
                    <td>
                      <span
                        className={cn(
                          'status-badge',
                          stockStatus.status === 'success' && 'status-success',
                          stockStatus.status === 'warning' && 'status-warning',
                          stockStatus.status === 'critical' && 'status-critical'
                        )}
                      >
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="text-muted-foreground">
                      {formatDate(merchant.lastRefillDate)}
                    </td>
                    <td>{merchant.totalStickersUsed}</td>
                    <td>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(merchant)}
                        className="gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!isLoading && merchants.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No merchants found matching your criteria.
        </div>
      )}
    </div>
  );
}
