import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Sphere } from "@/components/Sphere";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Globe, Linkedin } from "lucide-react";
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
      <div className="min-h-screen bg-background relative overflow-hidden">
        <Sphere />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs text-muted-foreground">Loading proof...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !proof) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <Sphere />
        <div className="absolute inset-0 flex items-center justify-center z-10 px-6">
          <div className="text-center">
            <h1 className="text-4xl font-medium text-[#1a1a2e] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Not Found</h1>
            <p className="text-xs text-muted-foreground">{error || 'Proof record not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Sphere />

      <main className="relative z-10 min-h-screen flex flex-col px-8 py-16 max-w-lg mx-auto">
        {/* Header - matching InkRecord page style */}
        <div className="text-center animate-fade-in mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#1a1a2e] whitespace-nowrap" style={{ fontFamily: "'Playfair Display', serif" }}>
            Authenticated Record
          </h1>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3 mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center">
            <Check className="w-5 h-5 text-white stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#1a1a2e]">Verified</p>
            <p className="text-xs text-muted-foreground">{formatTimestamp(proof.enrollment.timestamp)}</p>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="space-y-4">
            {proof.merchant && (
              <DetailRow label="Merchant" value={proof.merchant} />
            )}
            <DetailRow label="Order" value={proof.order_id} />
            <DetailRow label="Location" value={address} />
            {proof.order_url && (
              <div className="pt-2">
                <a 
                  href={proof.order_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline hover:text-blue-800"
                >
                  View original order →
                </a>
              </div>
            )}
          </div>

          <div className="w-full h-px bg-border/60" />

          {/* Verification Confirmations */}
          <div className="space-y-3">
            {proof.delivery && (
              <VerificationItem 
                icon={<Globe className="w-4 h-4" />}
                text="Location matched delivery address"
              />
            )}
            <VerificationItem 
              icon={<Check className="w-4 h-4" />}
              text="NFC tag authenticated"
            />
            <VerificationItem 
              icon={<Linkedin className="w-4 h-4" />}
              text="Identity verified"
            />
          </div>

          <div className="w-full h-px bg-border/60" />

          {/* Technical Details */}
          <div className="space-y-3 text-xs">
            <TechDetail label="NFC Tag ID" value={proof.nfc_uid ? proof.nfc_uid.toUpperCase() : 'N/A'} />
            <TechDetail label="Proof ID" value={proof.proof_id ? proof.proof_id.toUpperCase() : 'N/A'} />
            <TechDetail label="Signature" value={formatSignature(proof.signature)} />
          </div>
        </div>

        {/* Package Contents Grid */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Package Contents</p>
          <div className="grid grid-cols-2 gap-2">
            {proof.enrollment.photo_urls.map((url, index) => (
              <div
                key={index}
                className="aspect-square overflow-hidden relative rounded-lg bg-[#e8e7e3]"
              >
                {!loadedImages.has(index) && (
                  <Skeleton className="absolute inset-0 w-full h-full" />
                )}
                <img
                  src={url}
                  alt={`Delivery photo ${index + 1}`}
                  className={`w-full h-full object-cover transition-opacity duration-300 rounded-lg ${
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="text-center pt-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <a 
            href="/privacy" 
            className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Privacy Policy
          </a>
        </div>
      </main>
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-baseline">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-xs font-medium text-[#1a1a2e]">{value}</span>
  </div>
);

const VerificationItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 rounded-full bg-[#FFD700]/20 flex items-center justify-center text-[#1a1a2e]">
      {icon}
    </div>
    <span className="text-xs text-[#1a1a2e]">{text}</span>
  </div>
);

const TechDetail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-muted-foreground uppercase tracking-wider text-[10px]">{label}</span>
    <span className="text-[#1a1a2e] font-mono text-xs break-all">{value}</span>
  </div>
);

export default Record;
