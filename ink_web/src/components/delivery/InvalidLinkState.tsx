import PrivacyLink from "@/components/PrivacyLink";

const InvalidLinkState = () => {
  return (
    <div className="min-h-screen bg-ink-white flex flex-col items-center px-6 pt-[120px] animate-container-fade-in">
      {/* Horizontal Dash Symbol */}
      <div className="mb-8 animate-fade-in">
        <svg width="40" height="2" viewBox="0 0 40 2" fill="none">
          <line x1="0" y1="1" x2="40" y2="1" stroke="#000000" strokeWidth="1" />
        </svg>
      </div>

      {/* Headline */}
      <div className="text-center animate-fade-up mb-auto">
        <h1 className="text-[30px] font-bold text-ink-black leading-[34px] mb-[6px]">
          Page not found
        </h1>
        <p className="text-[15px] text-[#666666] leading-[22px]">
          This link is no longer active
        </p>
      </div>

      <div className="mt-auto">
        <PrivacyLink />
      </div>
    </div>
  );
};

export default InvalidLinkState;
