import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative">
      <main className="relative z-10 flex flex-col min-h-screen px-6 py-16 pb-32">
        <div className="max-w-md mx-auto animate-fade-in">
          {/* Back button */}
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          
          <h1 className="text-3xl md:text-4xl font-medium text-[#1a1a2e] tracking-tight mb-8 text-center" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Privacy Policy
          </h1>
          
          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-lg font-serif text-foreground mb-2">Data Collection</h2>
              <p className="text-xs leading-relaxed">
                We collect only the information necessary to provide premium shipping services. 
                This includes delivery confirmations and timestamps.
              </p>
            </section>
            
            <section>
              <h2 className="text-lg font-serif text-foreground mb-2">Data Usage</h2>
              <p className="text-xs leading-relaxed">
                Your delivery data is used solely to confirm successful deliveries 
                and provide premium service features. It is never shared with third parties.
              </p>
            </section>
            
            <section>
              <h2 className="text-lg font-serif text-foreground mb-2">Data Security</h2>
              <p className="text-xs leading-relaxed">
                All data is encrypted and securely stored. We implement industry-standard 
                security measures to protect your information.
              </p>
            </section>
            
            <section>
              <h2 className="text-lg font-serif text-foreground mb-2">Contact</h2>
              <p className="text-xs leading-relaxed">
                For privacy inquiries, please contact our support team.
              </p>
            </section>
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default Privacy;
