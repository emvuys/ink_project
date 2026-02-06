import { useState } from 'react';
import { StatCards } from './StatCards';
import { MerchantsTable } from './MerchantsTable';
import { MerchantDetailModal } from './MerchantDetailModal';
import { FulfillmentQueue } from './FulfillmentQueue';
import { Separator } from '@/components/ui/separator';
import { Merchant } from '@/services/api';

export function StickerFulfillment() {
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewDetails = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMerchant(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Sticker Fulfillment</h1>
        <p className="text-muted-foreground mt-1">
          Manage merchant sticker inventory and fulfillment orders
        </p>
      </div>

      <StatCards />

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Merchant Inventory</h2>
        <MerchantsTable onViewDetails={handleViewDetails} />
      </div>

      <Separator />

      <FulfillmentQueue />

      <MerchantDetailModal
        merchant={selectedMerchant}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
