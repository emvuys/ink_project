import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PrivacyLink from "@/components/PrivacyLink";
import { retrieveProof } from "@/lib/api";
import type { ProofRecord } from "@/lib/types";

const Record = () => {
  const { proofId } = useParams<{ proofId: string }>();
  const [proof, setProof] = useState<ProofRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

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

  const shortenSignature = (sig: string) => {
    if (sig.length <= 16) return sig;
    return `${sig.slice(0, 8)}...${sig.slice(-8)}`;
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
      <main className="flex flex-col items-center px-6 pt-[120px]">
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="text-[30px] font-bold text-ink-black leading-[34px] tracking-[0] mb-[6px]">
            Delivery Record
          </h1>
          <p className="text-[15px] text-[#666666] leading-[22px]">
            Verified by INK
          </p>
        </div>

        <div 
          className="w-full max-w-[320px] mb-8 animate-fade-in"
          style={{
            animationDelay: "70ms",
            animationFillMode: "backwards",
          }}
        >
          <div className="space-y-2">
            <p className="text-[15px] text-ink-black leading-[22px]">
              <span className="font-bold">
                {proof.delivery ? 'Delivered' : 'Enrolled'}
              </span> · {formatTimestamp(proof.enrollment.timestamp)}
            </p>
            <p className="text-[15px] text-[#666666] leading-[22px]">
              Order: {proof.order_id}
            </p>
            <p className="text-[15px] text-[#666666] leading-[22px]">
              Location: {getLocationString(proof.enrollment.shipping_address_gps)}
            </p>
          </div>
        </div>

        <div className="w-full max-w-[300px] mb-8">
          <div className="grid grid-cols-2 gap-[6px]">
            {proof.enrollment.photo_urls.map((url, index) => (
              <div
                key={index}
                className="aspect-square overflow-hidden animate-fade-in"
                style={{
                  animationDelay: `${140 + index * 70}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <img
                  src={url}
                  alt={`Delivery photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {proof.delivery && (
          <div 
            className="w-full max-w-[320px] mb-8 animate-fade-in"
            style={{
              animationDelay: "350ms",
              animationFillMode: "backwards",
            }}
          >
            <div className="space-y-2 border-t border-ink-gray/20 pt-6">
              <p className="text-[15px] text-ink-black leading-[22px] font-medium">
                Delivery Confirmed
              </p>
              <p className="text-[13px] text-[#666666] leading-[20px]">
                {formatTimestamp(proof.delivery.timestamp)}
              </p>
              <p className="text-[13px] text-[#666666] leading-[20px]">
                {getLocationString(proof.delivery.delivery_gps)}
              </p>
              <p className="text-[13px] text-[#666666] leading-[20px]">
                {proof.delivery.device_info}
              </p>
            </div>
          </div>
        )}

        <div 
          className="w-full max-w-[320px] mb-12 animate-fade-in"
          style={{
            animationDelay: "420ms",
            animationFillMode: "backwards",
          }}
        >
          <div className="space-y-2 border-t border-ink-gray/20 pt-6">
            {proof.delivery && (
              <p className="text-[13px] text-ink-black leading-[20px] font-medium">
                {getVerdictLabel(proof.delivery.gps_verdict)}
              </p>
            )}
            <p className="text-[12px] text-[#666666] leading-[18px]">
              Proof ID: {proof.proof_id}
            </p>
            <p className="text-[12px] text-[#666666] leading-[18px] font-mono">
              Signature: {shortenSignature(proof.signature)}
            </p>
            <p className="text-[12px] text-[#666666] leading-[18px]">
              Key ID: {proof.key_id}
            </p>
          </div>
        </div>

        <footer 
          className="text-center mb-8 pb-4 animate-fade-in"
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
