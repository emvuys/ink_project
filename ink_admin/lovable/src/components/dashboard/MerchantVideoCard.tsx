import { useRef, useState } from 'react';
import { Pencil, Trash2, Repeat, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { MerchantVideo } from '@/services/api';

interface MerchantVideoCardProps {
  merchant: MerchantVideo;
  onEdit: (merchant: MerchantVideo) => void;
  onDelete: (merchant: MerchantVideo) => void;
  onExpand: (merchant: MerchantVideo) => void;
}

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function MerchantVideoCard({ merchant, onEdit, onDelete, onExpand }: MerchantVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    videoRef.current?.play();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Build video URL - handle both relative and absolute URLs
  const videoUrl = merchant.videoUrl.startsWith('http')
    ? merchant.videoUrl
    : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${merchant.videoUrl}`;

  return (
    <Card 
      className="group overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="relative aspect-video bg-muted overflow-hidden"
        onClick={() => onExpand(merchant)}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          muted
          loop={merchant.isLooping}
          playsInline
          preload="metadata"
        />
        {!isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/5">
            <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center shadow-md">
              <Play className="w-5 h-5 text-foreground ml-0.5" />
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">{merchant.merchantName}</h3>
          <Badge 
            variant="secondary" 
            className="flex items-center gap-1 text-xs"
          >
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
        
        <p className="text-sm text-muted-foreground mb-4">
          {formatFileSize(merchant.fileSize)} • {merchant.format || 'MP4'}
        </p>
        
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(merchant);
            }}
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(merchant);
            }}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
