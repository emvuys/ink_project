import { NeumorphicButton } from "./NeumorphicButton";

interface BottomNavProps {
  onHome?: () => void;
  onReturnPassport?: () => void;
  onInkRecord?: () => void;
}

const BottomNav = ({ onHome, onReturnPassport, onInkRecord }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 p-6 pb-8 z-50">
      <div className="flex justify-center">
        <div className="bg-secondary/50 backdrop-blur-sm rounded-3xl p-3 shadow-neumorphic inline-flex">
          <div className="flex items-center justify-center gap-3">
            <NeumorphicButton 
              onClick={onHome}
              size="sm"
            >
              <span className="text-sm font-medium text-foreground">Home</span>
            </NeumorphicButton>
            
            <NeumorphicButton 
              onClick={onReturnPassport}
              size="sm"
            >
              <span className="text-sm font-medium text-foreground whitespace-nowrap">Return Passport</span>
            </NeumorphicButton>
            
            <NeumorphicButton 
              onClick={onInkRecord}
              size="sm"
            >
              <span className="text-sm font-medium text-foreground whitespace-nowrap">Ink Record</span>
            </NeumorphicButton>
          </div>
        </div>
      </div>
    </nav>
  );
};

export { BottomNav };

