import { useState } from 'react';
import { TopNav } from '@/components/dashboard/TopNav';
import { StickerFulfillment } from '@/components/dashboard/StickerFulfillment';
import { AnalyticsPlaceholder } from '@/components/dashboard/AnalyticsPlaceholder';
import { VideosPlaceholder } from '@/components/dashboard/VideosPlaceholder';

type Tab = 'analytics' | 'stickers' | 'videos';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('stickers');

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-screen-2xl mx-auto px-6 pt-8 pb-32">
        {activeTab === 'analytics' && <AnalyticsPlaceholder />}
        {activeTab === 'stickers' && <StickerFulfillment />}
        {activeTab === 'videos' && <VideosPlaceholder />}
      </main>
    </div>
  );
};

export default Index;
