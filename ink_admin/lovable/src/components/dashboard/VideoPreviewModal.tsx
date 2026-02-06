import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Repeat, Play } from 'lucide-react';
import type { MerchantVideo } from '@/services/api';

interface VideoPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: MerchantVideo | null;
}

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function VideoPreviewModal({ open, onOpenChange, merchant }: VideoPreviewModalProps) {
  if (!merchant) return null;

  // Build video URL - handle both relative and absolute URLs
  const videoUrl = merchant.videoUrl.startsWith('http')
    ? merchant.videoUrl
    : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${merchant.videoUrl}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle>{merchant.merchantName}</DialogTitle>
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              {merchant.isLooping ? (
                <>
                  <Repeat className="w-3 h-3" />
                  Looping
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  Play Once
                </>
              )}
            </Badge>
          </div>
        </DialogHeader>

        <div className="rounded-lg overflow-hidden bg-muted">
          <video
            src={videoUrl}
            className="w-full aspect-video object-cover"
            muted
            autoPlay
            loop={merchant.isLooping}
            playsInline
            controls
          />
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatFileSize(merchant.fileSize)} • {merchant.format || 'MP4'}</span>
          <span>Added {new Date(merchant.createdAt).toLocaleDateString()}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
