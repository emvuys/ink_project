import { useState } from 'react';
import { MapPin, Download, FileText, X } from 'lucide-react';

const AuthDeliveryRecord = () => {
  const [showTechnical, setShowTechnical] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // Mock data - replace with actual data fetching
  const data = {
    proof_id: 'PROOF_F382F025IE08D6C493AAFFF6',
    order_id: '1008***008',
    merchant: 'QuickShip Logistics',
    delivery_timestamp: '2025-11-25T05:29:00',
    delivery_location: 'Gujarat, India',
    delivery_gps: {
      lat: 23.0225,
      lng: 72.5714,
    },
    photo_urls: ['', '', '', ''],
    nfc_tag_id: 'TEST-H838JVDC6',
    signature: '0xe018...4203',
    public_key: '0x7a9f...8b2c',
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const downloadPDF = () => {
    window.print();
  };

  const photoLabels = [
    'Authentication Markers',
    'Serial Number',
    'Complete Contents',
    'Packaging Condition'
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="bg-black text-white py-6 px-6 border-b border-white/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="font-serif text-3xl font-light tracking-[0.1em]" style={{ fontFamily: "'DM Serif Display', serif" }}>ink.</a>
          <a href="/support" className="text-sm uppercase tracking-wider hover:text-[#D4AF37] transition-colors">
            Contact Support
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-black text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="font-serif text-5xl md:text-6xl font-light mb-4 leading-tight tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Your delivery has<br />been authenticated
          </div>
          <p className="text-white/70 text-lg tracking-wide">
            {formatDate(data.delivery_timestamp)}
          </p>
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-white py-12 px-6">
        <div className="max-w-4xl mx-auto flex justify-center gap-16 flex-wrap">
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Merchant</div>
            <div className="font-serif text-2xl font-medium" style={{ fontFamily: "'DM Serif Display', serif" }}>{data.merchant}</div>
          </div>
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Order Number</div>
            <div className="font-serif text-2xl font-medium" style={{ fontFamily: "'DM Serif Display', serif" }}>{data.order_id}</div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-[#FAF9F6] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>Delivery Location</h2>
            <p className="text-gray-600">GPS-verified delivery confirmation</p>
          </div>
          
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative border border-gray-300">
            <div className="absolute inset-0 bg-[#e8e7e3] flex items-center justify-center">
              <span className="text-gray-400 text-sm">Map placeholder</span>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <MapPin className="w-12 h-12 text-[#D4AF37] drop-shadow-lg" />
            </div>
          </div>
          
          <p className="text-center mt-6 font-serif text-xl text-gray-600" style={{ fontFamily: "'DM Serif Display', serif" }}>
            {data.delivery_location}
          </p>
        </div>
      </div>

      {/* Photos Section */}
      <div className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>Pre-Shipment Documentation</h2>
            <p className="text-gray-600">Verified package contents before sealing</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.photo_urls.map((url, index) => (
              <button
                key={index}
                onClick={() => url && setLightboxPhoto(url)}
                className="aspect-[4/3] bg-[#FAF9F6] rounded overflow-hidden border border-gray-200 hover:border-black transition-all hover:-translate-y-2 hover:shadow-2xl group"
              >
                <div className="w-full h-full flex items-center justify-center relative">
                  {url ? (
                    <img 
                      src={url} 
                      alt={photoLabels[index]}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <span className="text-sm text-gray-400 uppercase tracking-wider font-medium">
                        {photoLabels[index]}
                      </span>
                    </div>
                  )}
                  {url && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end p-4">
                      <span className="text-white text-sm uppercase tracking-wider font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {photoLabels[index]}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#FAF9F6] py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>Your Authenticated Record</h2>
          <p className="text-gray-600 mb-8">Permanent verification for warranty, insurance, or resale</p>
          
          <div className="flex justify-center gap-6 flex-wrap">
            <button
              onClick={downloadPDF}
              className="bg-black text-white px-10 py-4 text-sm uppercase tracking-wider font-medium hover:bg-gray-800 transition-all hover:-translate-y-1 hover:shadow-xl flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF Certificate
            </button>
            <button
              onClick={() => setShowTechnical(!showTechnical)}
              className="bg-transparent text-black border border-black px-10 py-4 text-sm uppercase tracking-wider font-medium hover:bg-black hover:text-white transition-all hover:-translate-y-1 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              View Technical Proof
            </button>
          </div>

          {/* Technical Details Expandable */}
          {showTechnical && (
            <div className="mt-12 bg-white p-8 rounded border border-gray-200 text-left animate-fade-in">
              <h3 className="font-serif text-2xl mb-6" style={{ fontFamily: "'DM Serif Display', serif" }}>Technical Verification Details</h3>
              <div className="font-mono text-xs space-y-4">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">NFC Tag ID:</span>
                  <span className="font-medium">{data.nfc_tag_id}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Proof ID:</span>
                  <span className="font-medium break-all">{data.proof_id}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">GPS Coordinates:</span>
                  <span className="font-medium">{data.delivery_gps.lat}, {data.delivery_gps.lng}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Signature:</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(data.signature)}
                    className="font-medium hover:text-[#D4AF37] transition-colors"
                    title="Click to copy"
                  >
                    {data.signature}
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Public Key:</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(data.public_key)}
                    className="font-medium hover:text-[#D4AF37] transition-colors"
                    title="Click to copy"
                  >
                    {data.public_key}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white/60 py-12 px-6 text-center">
        <div className="text-xs uppercase tracking-wider space-x-4">
          <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          <span>·</span>
          <a href="https://in.ink" className="hover:text-[#D4AF37] transition-colors">Powered by ink.</a>
        </div>
        <p className="mt-4 text-xs">© 2025 ink. All rights reserved.</p>
      </footer>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-[#D4AF37] transition-colors"
            onClick={() => setLightboxPhoto(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={lightboxPhoto} 
            alt="Full size" 
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default AuthDeliveryRecord;
