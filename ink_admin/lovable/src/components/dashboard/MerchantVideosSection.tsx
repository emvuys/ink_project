import { useState, useMemo } from 'react';
import { Plus, Search, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { MerchantVideoCard } from './MerchantVideoCard';
import { AddEditMerchantVideoModal } from './AddEditMerchantVideoModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { VideoPreviewModal } from './VideoPreviewModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videosApi, MerchantVideo } from '@/services/api';
import { toast } from 'sonner';

export function MerchantVideosSection() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<MerchantVideo | null>(null);
  const [deletingMerchant, setDeletingMerchant] = useState<MerchantVideo | null>(null);
  const [previewMerchant, setPreviewMerchant] = useState<MerchantVideo | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['videos', searchQuery],
    queryFn: () => videosApi.getAll({ search: searchQuery || undefined }),
  });

  const createVideoMutation = useMutation({
    mutationFn: (formData: FormData) => videosApi.create(formData),
    onSuccess: () => {
      toast.success('Video uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to upload video', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      videosApi.update(id, formData),
    onSuccess: () => {
      toast.success('Video updated successfully');
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setEditingMerchant(null);
    },
    onError: (error) => {
      toast.error('Failed to update video', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (id: string) => videosApi.delete(id),
    onSuccess: () => {
      toast.success('Video deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setDeletingMerchant(null);
    },
    onError: (error) => {
      toast.error('Failed to delete video', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    },
  });

  const merchants = data?.data || [];

  const handleSave = (saveData: { merchantName: string; videoFile: File | null; isLooping: boolean }) => {
    const formData = new FormData();
    formData.append('merchantName', saveData.merchantName);
    formData.append('isLooping', String(saveData.isLooping));

    if (editingMerchant) {
      if (saveData.videoFile) {
        formData.append('video', saveData.videoFile);
      }
      updateVideoMutation.mutate({ id: editingMerchant.id, formData });
    } else {
      if (saveData.videoFile) {
        formData.append('video', saveData.videoFile);
      }
      createVideoMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (deletingMerchant) {
      deleteVideoMutation.mutate(deletingMerchant.id);
    }
  };

  const handleEdit = (merchant: MerchantVideo) => {
    setEditingMerchant(merchant);
  };

  const hasNoMerchants = merchants.length === 0 && !searchQuery;
  const hasNoResults = merchants.length === 0 && searchQuery;

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Merchant Videos</h1>
            <p className="text-muted-foreground mt-1">
              Manage branded loading animations for delivery verification
            </p>
          </div>
        </div>
        <div className="text-center py-12 text-destructive">
          Failed to load videos. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Merchant Videos</h1>
          <p className="text-muted-foreground mt-1">
            Manage branded loading animations for delivery verification
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Add New Merchant
        </Button>
      </div>

      {/* Search */}
      {!isLoading && !hasNoMerchants && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search merchants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border border-border overflow-hidden">
              <Skeleton className="aspect-video" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : hasNoMerchants ? (
        // Empty State
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Video className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No merchant videos yet</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Add your first merchant video to get started with branded loading animations.
          </p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Merchant
          </Button>
        </div>
      ) : hasNoResults ? (
        // No Search Results
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No results found</h3>
          <p className="text-muted-foreground text-sm">
            No merchants match "{searchQuery}"
          </p>
        </div>
      ) : (
        // Merchant Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {merchants.map((merchant) => (
            <MerchantVideoCard
              key={merchant.id}
              merchant={merchant}
              onEdit={handleEdit}
              onDelete={setDeletingMerchant}
              onExpand={setPreviewMerchant}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddEditMerchantVideoModal
        open={isAddModalOpen || !!editingMerchant}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setEditingMerchant(null);
          }
        }}
        merchant={editingMerchant}
        onSave={handleSave}
        isLoading={createVideoMutation.isPending || updateVideoMutation.isPending}
      />

      <DeleteConfirmModal
        open={!!deletingMerchant}
        onOpenChange={(open) => !open && setDeletingMerchant(null)}
        merchantName={deletingMerchant?.merchantName || ''}
        onConfirm={handleDelete}
        isLoading={deleteVideoMutation.isPending}
      />

      <VideoPreviewModal
        open={!!previewMerchant}
        onOpenChange={(open) => !open && setPreviewMerchant(null)}
        merchant={previewMerchant}
      />
    </div>
  );
}
