import { X, Package, Mail, Phone, MapPin, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantsApi, ordersApi, Merchant } from '@/services/api';

interface MerchantDetailModalProps {
  merchant: Merchant | null;
  open: boolean;
  onClose: () => void;
}

export function MerchantDetailModal({ merchant, open, onClose }: MerchantDetailModalProps) {
  const [alertThreshold, setAlertThreshold] = useState(5);
  const queryClient = useQueryClient();

  // Fetch full merchant details with history
  const { data: merchantDetails, isLoading } = useQuery({
    queryKey: ['merchant', merchant?.id],
    queryFn: () => merchantsApi.getById(merchant!.id),
    enabled: open && !!merchant?.id,
  });

  useEffect(() => {
    if (merchantDetails) {
      setAlertThreshold(merchantDetails.alertThreshold);
    }
  }, [merchantDetails]);

  const updateThresholdMutation = useMutation({
    mutationFn: ({ id, threshold }: { id: string; threshold: number }) =>
      merchantsApi.updateThreshold(id, threshold),
    onSuccess: () => {
      toast.success('Alert threshold updated', {
        description: `Will notify when inventory falls below ${alertThreshold} stickers`,
      });
      queryClient.invalidateQueries({ queryKey: ['merchant', merchant?.id] });
      queryClient.invalidateQueries({ queryKey: ['merchants'] });
    },
    onError: (error) => {
      toast.error('Failed to update threshold', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: { merchantId: string; quantity: number; shippingAddress: string }) =>
      ordersApi.create(data),
    onSuccess: () => {
      toast.success('Refill order created successfully', {
        description: `Order placed for ${merchant?.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      toast.error('Failed to create order', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });

  if (!merchant) return null;

  const data = merchantDetails || merchant;
  const stockStatus = data.stockStatus || getStockStatus(data.currentInventory, data.alertThreshold);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCreateRefillOrder = () => {
    createOrderMutation.mutate({
      merchantId: merchant.id,
      quantity: 20,
      shippingAddress: merchant.address || '',
    });
  };

  const handleSaveThreshold = () => {
    updateThresholdMutation.mutate({
      id: merchant.id,
      threshold: alertThreshold,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{data.name}</span>
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
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{data.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{data.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{data.address || '-'}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Inventory Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Package className="w-4 h-4" />
                <span className="text-sm">Current Inventory</span>
              </div>
              <p className="text-2xl font-semibold">{data.currentInventory} stickers</p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-muted-foreground mb-1">Lifetime Usage</p>
              <p className="text-2xl font-semibold">{data.totalStickersUsed} stickers</p>
            </div>
          </div>

          <Separator />

          {/* Usage History */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Recent Usage</h3>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg divide-y divide-border">
                {(data.usageRecords || []).slice(0, 5).map((record, i) => (
                  <div key={record.id || i} className="flex justify-between items-center px-4 py-3 text-sm">
                    <span className="text-muted-foreground">{formatDate(record.date)}</span>
                    <span className="font-medium">{record.stickersUsed} stickers used</span>
                  </div>
                ))}
                {(!data.usageRecords || data.usageRecords.length === 0) && (
                  <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                    No usage records
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Refill History */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Refill History</h3>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="data-table">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Quantity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.fulfillmentOrders || [])
                      .filter((order) => order.status === 'delivered')
                      .map((record) => (
                        <tr key={record.id}>
                          <td>{formatDate(record.deliveredAt || record.orderDate)}</td>
                          <td>{record.quantity} stickers</td>
                          <td>
                            <span className="status-badge status-success">Delivered</span>
                          </td>
                        </tr>
                      ))}
                    {(!data.fulfillmentOrders || data.fulfillmentOrders.filter((o) => o.status === 'delivered').length === 0) && (
                      <tr>
                        <td colSpan={3} className="text-center text-muted-foreground">
                          No refill history
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <Separator />

          {/* Alert Threshold */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alert Threshold
            </h3>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label htmlFor="threshold" className="text-sm text-muted-foreground">
                  Notify when inventory falls below
                </Label>
                <Input
                  id="threshold"
                  type="number"
                  min={1}
                  max={50}
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <Button
                variant="outline"
                onClick={handleSaveThreshold}
                disabled={updateThresholdMutation.isPending}
              >
                {updateThresholdMutation.isPending ? 'Saving...' : 'Save Threshold'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={handleCreateRefillOrder}
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? 'Creating...' : 'Create Refill Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getStockStatus(inventory: number, threshold: number = 5) {
  if (inventory > 10) return { status: 'success' as const, label: 'Healthy' };
  if (inventory >= threshold) return { status: 'warning' as const, label: 'Low Stock' };
  return { status: 'critical' as const, label: 'Critical' };
}
