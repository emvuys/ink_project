import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Film } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import type { MerchantVideo } from '@/services/api';

interface AddEditMerchantVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant?: MerchantVideo | null;
  onSave: (data: { merchantName: string; videoFile: File | null; isLooping: boolean }) => void;
  isLoading?: boolean;
}

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ACCEPTED_FORMATS = ['video/mp4', 'image/gif'];

export function AddEditMerchantVideoModal({
  open,
  onOpenChange,
  merchant,
  onSave,
  isLoading,
}: AddEditMerchantVideoModalProps) {
  const [merchantName, setMerchantName] = useState('');
  const [isLooping, setIsLooping] = useState(true);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!merchant;

  // Reset form when modal opens/closes or merchant changes
  useEffect(() => {
    if (open) {
      setMerchantName(merchant?.merchantName || '');
      setIsLooping(merchant?.isLooping ?? true);
      setVideoFile(null);
      setUploadProgress(0);
      setIsUploading(false);
      setError(null);
      
      // Set video preview for editing
      if (merchant?.videoUrl) {
        const url = merchant.videoUrl.startsWith('http')
          ? merchant.videoUrl
          : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${merchant.videoUrl}`;
        setVideoPreview(url);
      } else {
        setVideoPreview('');
      }
    }
  }, [open, merchant]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      onOpenChange(newOpen);
    }
  };

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return 'Please upload MP4 or GIF format';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Video must be under 1MB. Please compress and try again.';
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setVideoFile(file);
    
    // Simulate upload progress
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = () => {
    if (!merchantName.trim()) {
      setError('Merchant name is required');
      return;
    }
    if (!videoPreview && !isEditing) {
      setError('Please upload a video');
      return;
    }
    
    onSave({
      merchantName: merchantName.trim(),
      videoFile,
      isLooping,
    });
  };

  const clearVideo = () => {
    setVideoFile(null);
    if (isEditing && merchant?.videoUrl) {
      const url = merchant.videoUrl.startsWith('http')
        ? merchant.videoUrl
        : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${merchant.videoUrl}`;
      setVideoPreview(url);
    } else {
      setVideoPreview('');
    }
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Merchant' : 'Add New Merchant'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Merchant Name */}
          <div className="space-y-2">
            <Label htmlFor="merchantName">
              Merchant Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="merchantName"
              placeholder="e.g., MAAP, Kylie Cosmetics, StockX"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Video Upload */}
          <div className="space-y-2">
            <Label>
              Video Upload <span className="text-destructive">*</span>
            </Label>
            
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp4,.gif,video/mp4,image/gif"
                className="hidden"
                onChange={handleFileInputChange}
                disabled={isLoading}
              />
              
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Drag and drop your video here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or{' '}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      browse files
                    </button>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  MP4 or GIF • Max 1MB
                </p>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Video Preview */}
            {videoPreview && !isUploading && (
              <div className="relative mt-4 rounded-lg overflow-hidden bg-muted">
                <video
                  src={videoPreview}
                  className="w-full aspect-video object-cover"
                  muted
                  autoPlay
                  loop={isLooping}
                  playsInline
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={clearVideo}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Playback Settings */}
          <div className="space-y-2">
            <Label>Playback Settings</Label>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Film className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Loop video</p>
                  <p className="text-xs text-muted-foreground">
                    Video will continuously loop while page loads
                  </p>
                </div>
              </div>
              <Switch
                checked={isLooping}
                onCheckedChange={setIsLooping}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUploading || isLoading}
          >
            {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Merchant'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
