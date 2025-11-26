import { InkButton } from "@/components/ui/ink-button";
import PrivacyLink from "@/components/PrivacyLink";
import { useNavigate } from "react-router-dom";

interface SuccessStateProps {
  proofId?: string;
  verifyUrl?: string;
}

const SuccessState = ({ proofId, verifyUrl }: SuccessStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ink-white animate-container-fade-in">
      {/* Main Content - Pixel-Perfect Spacing */}
      <main className="flex flex-col items-center px-6 pt-[120px]">
        {/* Success Title */}
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="text-[30px] font-bold text-ink-black leading-[34px] tracking-[0] mb-[6px]">
            Delivered
          </h1>
          <p className="text-[15px] text-[#666666] leading-[22px]">
            successfully authenticated
          </p>
        </div>

        {/* Action Button */}
        <div 
          className="w-full max-w-[320px] mb-16 animate-fade-in"
          style={{
            animationDelay: "310ms",
            animationFillMode: "backwards",
          }}
        >
          <InkButton 
            size="full"
            className="tracking-[0.6px]"
            onClick={() => {
              if (proofId) {
                navigate(`/verify/${proofId}`);
              } else if (verifyUrl) {
                const match = verifyUrl.match(/\/verify\/([^\/]+)$/);
                if (match) navigate(`/verify/${match[1]}`);
              }
            }}
          >
            View Record
          </InkButton>
        </div>

        {/* Footer */}
        <footer 
          className="text-center mb-8 pb-4 animate-fade-in"
          style={{
            animationDelay: "360ms",
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

export default SuccessState;
