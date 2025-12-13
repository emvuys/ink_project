import { BottomNav } from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

const ReturnPassport = () => {
  const navigate = useNavigate();

  const handleHome = () => {
    navigate("/home");
  };

  const handleReturnPassport = () => {
    navigate("/return-passport");
  };

  const handleInkRecord = () => {
    navigate("/ink-record");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Bottom Navigation */}
      <BottomNav 
        onHome={handleHome}
        onReturnPassport={handleReturnPassport}
        onInkRecord={handleInkRecord}
      />
    </div>
  );
};

export default ReturnPassport;
