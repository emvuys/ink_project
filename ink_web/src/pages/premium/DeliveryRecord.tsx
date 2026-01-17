import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/config';

interface DeliveryData {
  proof_id: string;
  order_id: string;
  merchant: string;
  delivery_timestamp: string;
  delivery_location: string;
  delivery_gps: {
    lat: number;
    lng: number;
  };
}

const PremiumDeliveryRecord = () => {
  const { proofId } = useParams<{ proofId: string }>();
  const [data, setData] = useState<DeliveryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!proofId) {
      setLoading(false);
      return;
    }

    // Fetch delivery data from API
    fetch(`${API_BASE_URL}/retrieve/${proofId}`)
      .then(res => res.json())
      .then(fetchedData => {
        setData({
          proof_id: fetchedData.proof_id || proofId,
          order_id: fetchedData.order_id || '#INK-2024-7891',
          merchant: fetchedData.merchant || 'SSENSE',
          delivery_timestamp: fetchedData.delivery?.timestamp || new Date().toISOString(),
          delivery_location: 'Front Door',
          delivery_gps: fetchedData.delivery?.delivery_gps || fetchedData.enrollment?.shipping_address_gps || {
            lat: 40.7128,
            lng: -74.0060
          }
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load delivery data:', err);
        // Use mock data for demo
        setData({
          proof_id: proofId,
          order_id: '#INK-2024-7891',
          merchant: 'SSENSE',
          delivery_timestamp: new Date().toISOString(),
          delivery_location: 'Front Door',
          delivery_gps: {
            lat: 40.7128,
            lng: -74.0060
          }
        });
        setLoading(false);
      });
  }, [proofId]);

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

  const calculateReturnDeadline = (deliveryDate: string) => {
    const date = new Date(deliveryDate);
    date.setDate(date.getDate() + 60);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-serif text-xl">Loading your premium delivery...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center">
          <h1 className="font-serif text-4xl mb-4">Delivery record not found</h1>
          <p className="text-gray-600">Please check your link and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="bg-black text-white py-6 px-6 border-b border-white/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl font-light tracking-[0.1em]">
            ink.
          </a>
          <a href="/support" className="text-sm uppercase tracking-wider hover:opacity-60 transition-opacity">
            Contact Support
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-black text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="font-serif text-5xl md:text-6xl font-light mb-4 leading-tight tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 300 }}>
            Your premium delivery<br />is confirmed
          </div>
          <p className="text-white/70 text-lg tracking-wide">
            Delivered {formatDate(data.delivery_timestamp)}
          </p>
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-white py-12 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-center gap-16 flex-wrap">
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">From</div>
            <div style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl font-medium">
              {data.merchant}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Order</div>
            <div style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl font-medium">
              {data.order_id}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Location</div>
            <div style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl font-medium">
              {data.delivery_location}
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white py-16 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>Delivery Location</h2>
            <p className="text-gray-600">GPS-verified delivery confirmation</p>
          </div>
          
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative border border-gray-300">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.delivery_gps.lng - 0.005},${data.delivery_gps.lat - 0.005},${data.delivery_gps.lng + 0.005},${data.delivery_gps.lat + 0.005}&layer=mapnik&marker=${data.delivery_gps.lat},${data.delivery_gps.lng}`}
              className="border-0 w-full h-full"
              title="Delivery Location Map"
              lang="en"
            />
          </div>
          
          <p className="text-center mt-6 font-serif text-xl text-gray-600" style={{ fontFamily: "'DM Serif Display', serif" }}>
            {data.delivery_location}
          </p>
          <p className="text-center mt-2 text-sm text-gray-500 font-mono">
            {data.delivery_gps.lat.toFixed(6)}, {data.delivery_gps.lng.toFixed(6)}
          </p>
        </div>
      </div>

      {/* Return Passport Section */}
      <div className="bg-[#FAF9F6] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl mb-2 font-light">
              Your Return Passport
            </h2>
            <p className="text-gray-600 text-lg">Easy returns anytime within 60 days</p>
          </div>
          
          <div className="max-w-3xl mx-auto bg-white border border-black p-12">
            <div className="text-center mb-12">
              <div style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl mb-2 font-light">
                Return eligibility confirmed
              </div>
              <div className="text-lg text-gray-600">Unlocked 60 day returns</div>
            </div>
            
            <div className="space-y-6 mb-8">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-600 font-medium">Return window</span>
                <span className="font-medium">60 days (until {calculateReturnDeadline(data.delivery_timestamp)})</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-600 font-medium">Return shipping</span>
                <span className="font-medium">Free prepaid label</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-600 font-medium">Refund processing</span>
                <span className="font-medium">2-3 business days</span>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl mb-2 font-light">
              Premium Delivery Benefits
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-6 bg-[#FAF9F6] rounded-full flex items-center justify-center">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl font-medium mb-2">
                Priority Handling
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your package receives priority handling throughout the delivery process
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-6 bg-[#FAF9F6] rounded-full flex items-center justify-center">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl font-medium mb-2">
                60-Day Returns
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Extended return window with free prepaid shipping labels
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-6 bg-[#FAF9F6] rounded-full flex items-center justify-center">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl font-medium mb-2">
                Instant Refunds
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Fast refund processing within 2-3 business days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-[#FAF9F6] py-12 px-6 text-center">
        <p className="text-gray-600 mb-4">Questions about your delivery or need assistance?</p>
        <a href="/support" className="inline-block text-black border-b-2 border-black font-medium hover:opacity-60 transition-opacity">
          Contact Customer Support
        </a>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white/60 py-12 px-6 text-center">
        <div className="text-xs uppercase tracking-wider space-x-4">
          <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          <span>·</span>
          <span className="hover:opacity-60 transition-opacity">Powered by ink.</span>
        </div>
        <p className="mt-4 text-xs opacity-60">© 2025 ink. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PremiumDeliveryRecord;
