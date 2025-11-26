import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PrivacyLink from "@/components/PrivacyLink";
import { Skeleton } from "@/components/ui/skeleton";
import { retrieveProof } from "@/lib/api";
import { reverseGeocode } from "@/lib/geocoding";
import type { ProofRecord } from "@/lib/types";

const Record = () => {
  const { proofId } = useParams<{ proofId: string }>();
  const [proof, setProof] = useState<ProofRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [address, setAddress] = useState<string>('Loading address...');
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!proofId) {
      setError('Invalid proof ID');
      setLoading(false);
      return;
    }

    loadProof();
  }, [proofId]);

  const loadProof = async () => {
    try {
      const data = await retrieveProof(proofId!);
      setProof(data);
      
      // Fetch address from GPS coordinates
      const geocodeResult = await reverseGeocode(data.enrollment.shipping_address_gps);
      if (geocodeResult.success && geocodeResult.address) {
        setAddress(geocodeResult.address);
      } else {
        // Fallback to coordinates if geocoding fails
        const { lat, lng } = data.enrollment.shipping_address_gps;
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (err) {
      setError('Proof not found');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getLocationString = (gps: { lat: number; lng: number }) => {
    return `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}`;
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'pass':
        return 'Location matched delivery address';
      case 'near':
        return 'Location near delivery address';
      case 'flagged':
        return 'Location flagged for review';
      default:
        return 'Location verified';
    }
  };

  const formatSignature = (sig: string) => {
    if (!sig) return 'N/A';
    // Format signature as 0x... with first 4 and last 4 characters
    const cleanSig = sig.startsWith('0x') ? sig.slice(2) : sig;
    if (cleanSig.length <= 8) {
      return `0x${cleanSig}`;
    }
    // Show first 4 and last 4 characters: 0x7a8f...2e4c
    return `0x${cleanSig.slice(0, 4)}...${cleanSig.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ink-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[15px] text-[#666666]">Loading proof...</p>
        </div>
      </div>
    );
  }

  if (error || !proof) {
    return (
      <div className="min-h-screen bg-ink-white flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-[30px] font-bold text-ink-black mb-4">Not Found</h1>
          <p className="text-[15px] text-[#666666]">{error || 'Proof record not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-white animate-container-fade-in">
      <main className="flex flex-col items-center px-6 pt-[40px]">
        <div className="text-center mb-4 animate-fade-up">
          <h1 className="text-[30px] font-bold text-ink-black leading-[34px] tracking-[0] mb-1">
            Delivery Record
          </h1>
          <p className="text-[15px] text-[#666666] leading-[22px]">
            Verified by INK
          </p>
        </div>

        <div 
          className="w-full max-w-[320px] mb-4 animate-fade-in"
          style={{
            animationDelay: "70ms",
            animationFillMode: "backwards",
          }}
        >
          <div className="space-y-1.5">
            <p className="text-[15px] text-ink-black leading-[22px]">
              <span className="font-bold">
                {proof.delivery ? 'Delivered' : 'Enrolled'}
              </span> · {formatTimestamp(proof.enrollment.timestamp)}
            </p>
            {proof.merchant && (
              <p className="text-[15px] text-[#666666] leading-[22px]">
                Merchant: {proof.merchant}
              </p>
            )}
            <p className="text-[15px] text-[#666666] leading-[22px]">
              Order: {proof.order_id}
            </p>
            <p className="text-[15px] text-[#666666] leading-[22px]">
              Location: {address}
            </p>
            {proof.order_url && (
              <a 
                href={proof.order_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] text-blue-600 underline leading-[22px] hover:text-blue-800"
              >
                View original order →
              </a>
            )}
          </div>
        </div>

        <div className="w-full max-w-[300px] mb-4">
          <div className="grid grid-cols-2 gap-1.5">
            {proof.enrollment.photo_urls.map((url, index) => (
              <div
                key={index}
                className="aspect-square overflow-hidden relative animate-fade-in"
                style={{
                  animationDelay: `${140 + index * 70}ms`,
                  animationFillMode: "backwards",
                }}
              >
                {!loadedImages.has(index) && (
                  <Skeleton className="absolute inset-0 w-full h-full" />
                )}
                <img
                  src={url}
                  alt={`Delivery photo ${index + 1}`}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => {
                    setLoadedImages(prev => new Set(prev).add(index));
                  }}
                  onError={() => {
                    setLoadedImages(prev => new Set(prev).add(index));
                  }}
                />
              </div>
            ))}
          </div>
        </div>


        <div 
          className="w-full max-w-[320px] mb-4 animate-fade-in"
          style={{
            animationDelay: "350ms",
            animationFillMode: "backwards",
          }}
        >
          <div className="space-y-1.5 border-t border-ink-gray/20 pt-3">
            {proof.delivery && (
              <p className="text-[13px] text-ink-black leading-[20px] font-medium mb-1">
                {getVerdictLabel(proof.delivery.gps_verdict)}
              </p>
            )}
            <p className="text-[12px] text-[#666666] leading-[18px]">
              NFC Tag ID: {proof.nfc_uid ? proof.nfc_uid.toUpperCase() : 'N/A'}
            </p>
            <p className="text-[12px] text-[#666666] leading-[18px]">
              Proof ID: {proof.proof_id ? proof.proof_id.toUpperCase() : 'N/A'}
            </p>
            <p className="text-[12px] text-[#666666] leading-[18px]">
              Signature: {formatSignature(proof.signature)}
            </p>
          </div>
        </div>

        <footer 
          className="text-center mb-2 pb-2 animate-fade-in"
          style={{
            animationDelay: "470ms",
            animationFillMode: "backwards",
          }}
        >
          <p className="text-[13px] text-[#999999] tracking-[0.5px] uppercase">
            Authenticated by INK
          </p>
        </footer>
      </main>

      <PrivacyLink />
    </div>
  );
};

export default Record;
