export interface MerchantVideo {
  id: string;
  merchantName: string;
  videoUrl: string;
  thumbnailUrl: string;
  isLooping: boolean;
  fileSize: string;
  format: string;
  createdAt: string;
}

export const merchantVideos: MerchantVideo[] = [
  {
    id: '1',
    merchantName: 'MAAP',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: '',
    isLooping: true,
    fileSize: '842 KB',
    format: 'MP4',
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    merchantName: 'Kylie Cosmetics',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: '',
    isLooping: true,
    fileSize: '678 KB',
    format: 'MP4',
    createdAt: '2026-01-20',
  },
];
