import { Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, OrderStatus } from '@/services/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function FulfillmentQueue() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAll(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success('Order status updated', {
        description: `Order ${variables.id} marked as ${variables.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['merchants'] });
    },
    onError: (error) => {
      toast.error('Failed to update status', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const markAsShipped = (orderId: string) => {
    updateStatus(orderId, 'shipped');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'status-critical';
      case 'packed':
        return 'status-warning';
      case 'shipped':
        return 'text-primary bg-primary/10';
      case 'delivered':
        return 'status-success';
    }
  };

  const orders = data?.data || [];
  const pendingOrders = orders.filter((o) => o.status !== 'delivered');

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Fulfillment Queue</h2>
        </div>
        <div className="text-center py-8 text-destructive">
          Failed to load orders. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Fulfillment Queue</h2>
          <span className="text-sm text-muted-foreground">
            ({isLoading ? '...' : pendingOrders.length} pending)
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : pendingOrders.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">All orders fulfilled!</p>
        </div>
      ) : (
        <div className="data-table overflow-x-auto overflow-y-visible">
          <table className="w-full min-w-[800px]" style={{ overflow: 'visible' }}>
            <thead>
              <tr>
                <th>Order Date</th>
                <th>Merchant</th>
                <th>Quantity</th>
                <th>Shipping Address</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((order) => (
                <tr key={order.id}>
                  <td className="text-muted-foreground">{formatDate(order.orderDate)}</td>
                  <td className="font-medium">{order.merchant?.name || 'Unknown'}</td>
                  <td>{order.quantity} stickers</td>
                  <td className="text-muted-foreground max-w-[200px] truncate">
                    {order.shippingAddress}
                  </td>
                  <td>
                    <Select
                      value={order.status}
                      onValueChange={(v) => updateStatus(order.id, v as OrderStatus)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className={cn('w-28', getStatusColor(order.status))}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="packed">Packed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => markAsShipped(order.id)}
                      disabled={
                        order.status === 'shipped' ||
                        order.status === 'delivered' ||
                        updateStatusMutation.isPending
                      }
                      className="gap-1.5"
                    >
                      <Truck className="w-4 h-4" />
                      Mark as Shipped
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
