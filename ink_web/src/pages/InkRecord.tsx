import { Sphere } from "@/components/Sphere";
import { Check, Globe, Linkedin } from "lucide-react";

const InkRecord = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Sphere />

      <main className="relative z-10 min-h-screen flex flex-col px-8 py-16 max-w-lg mx-auto">
        {/* Header - matching Authenticated page style */}
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
            <p className="text-xs text-muted-foreground">Nov 25, 2025 at 5:29 AM</p>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="space-y-4">
            <DetailRow label="Merchant" value="QuickShip Logistics" />
            <DetailRow label="Order" value="1008***008" />
            <DetailRow label="Location" value="Gujarat, India" />
          </div>

          <div className="w-full h-px bg-border/60" />

          {/* Verification Confirmations */}
          <div className="space-y-3">
            <VerificationItem 
              icon={<Globe className="w-4 h-4" />}
              text="Location matched delivery address"
            />
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
            <TechDetail label="NFC Tag ID" value="TEST-H838JVDC6" />
            <TechDetail label="Proof ID" value="PROOF_F382F025IE08D6C493AAFFF6" />
            <TechDetail label="Signature" value="0xe018...4203" />
          </div>
        </div>

        {/* Package Contents Grid */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Package Contents</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="aspect-square bg-[#e8e7e3] rounded-lg flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Photo 1</span>
            </div>
            <div className="aspect-square bg-[#e8e7e3] rounded-lg flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Photo 2</span>
            </div>
            <div className="aspect-square bg-[#e8e7e3] rounded-lg flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Photo 3</span>
            </div>
            <div className="aspect-square bg-[#e8e7e3] rounded-lg flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Photo 4</span>
            </div>
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

export default InkRecord;
