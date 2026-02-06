import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Download, FileText, X } from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';
import { getMerchantByProofId, getMerchantAnimation } from '@/lib/api';
import { reverseGeocode } from '@/lib/geocoding';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const DeliveryRecord = () => {
  const { proofId } = useParams<{ proofId: string }>();
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [animationUrl, setAnimationUrl] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const [data, setData] = useState({
    order_id: '1008***008',
    merchant: 'QuickShip Logistics',
    delivery_timestamp: '2025-11-25T05:29:00',
    delivery_location: 'Loading address...',
    delivery_gps: { lat: 0, lng: 0 },
    has_delivery_location: false,
    photo_urls: ['', '', '', ''],
  });

  useEffect(() => {
    if (!proofId) {
      setLoading(false);
      return;
    }

    const loadAnimation = async () => {
      try {
        const { merchant } = await getMerchantByProofId(proofId);
        const name = (merchant && merchant.trim()) || 'default';
        const res = await getMerchantAnimation(name);
        if (res?.animation_url) setAnimationUrl(res.animation_url);
      } catch (_) {
        try {
          const r = await getMerchantAnimation('default');
          if (r?.animation_url) setAnimationUrl(r.animation_url);
        } catch (_2) {}
      }
    };
    loadAnimation();
  }, [proofId]);

  useEffect(() => {
    if (!proofId) {
      setLoading(false);
      return;
    }

    // Fetch delivery data from API
    fetch(`${API_BASE_URL}/retrieve/${proofId}`)
      .then(res => res.json())
      .then(async (fetchedData) => {
        const rawGps = fetchedData.delivery?.delivery_gps;
        // (0,0) 表示未授权定位时的占位，不作为真实交付位置
        const hasRealLocation = rawGps && (rawGps.lat !== 0 || rawGps.lng !== 0);
        const deliveryGps = hasRealLocation ? rawGps : { lat: 0, lng: 0 };

        let deliveryLocation = 'Location not available';
        if (hasRealLocation) {
          try {
            const geocodeResult = await reverseGeocode(deliveryGps);
            if (geocodeResult.success && geocodeResult.address) {
              deliveryLocation = geocodeResult.address;
            } else {
              deliveryLocation = `${deliveryGps.lat.toFixed(4)}, ${deliveryGps.lng.toFixed(4)}`;
            }
          } catch (err) {
            deliveryLocation = `${deliveryGps.lat.toFixed(4)}, ${deliveryGps.lng.toFixed(4)}`;
          }
        }

        setData({
          order_id: fetchedData.order_id || '1008***008',
          merchant: fetchedData.merchant || 'QuickShip Logistics',
          delivery_timestamp: fetchedData.delivery?.timestamp || new Date().toISOString(),
          delivery_location: deliveryLocation,
          delivery_gps: deliveryGps,
          has_delivery_location: hasRealLocation,
          photo_urls: fetchedData.enrollment?.photo_urls || ['', '', '', ''],
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load delivery data:', err);
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

  const downloadPDF = async () => {
    if (!data) {
      alert('No delivery data available. Please try again.');
      return;
    }
    
    setGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 25;
      let yPosition = margin + 10;

      // Header Background
      pdf.setFillColor(26, 26, 46); // #1a1a2e
      pdf.rect(0, 0, pageWidth, 50, 'F');

      // Title
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text('Premium Delivery', pageWidth / 2, yPosition + 5, { align: 'center' });
      yPosition += 10;
      
      pdf.setFontSize(22);
      pdf.text('Confirmation', pageWidth / 2, yPosition + 5, { align: 'center' });
      yPosition += 15;

      // Subtitle
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(200, 200, 200);
      pdf.text('Your shipment has been delivered and documented', pageWidth / 2, yPosition + 5, { align: 'center' });
      yPosition += 25;

      // Reset text color for body
      pdf.setTextColor(0, 0, 0);

      // Date Badge
      pdf.setFillColor(240, 240, 245);
      pdf.roundedRect(margin, yPosition, pageWidth - (2 * margin), 12, 2, 2, 'F');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatDate(data.delivery_timestamp), pageWidth / 2, yPosition + 8, { align: 'center' });
      yPosition += 20;

      // Order Information Card
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin, yPosition, pageWidth - (2 * margin), 35, 3, 3, 'S');
      
      yPosition += 8;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 26, 46);
      pdf.text('Order Information', margin + 5, yPosition);
      yPosition += 8;

      // Order details in two columns
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      
      const colWidth = (pageWidth - (2 * margin) - 10) / 2;
      const col1X = margin + 5;
      const col2X = margin + 5 + colWidth;
      
      // Column 1
      pdf.text('MERCHANT', col1X, yPosition);
      yPosition += 5;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(data.merchant, col1X, yPosition);
      
      // Column 2
      yPosition -= 5;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('ORDER NUMBER', col2X, yPosition);
      yPosition += 5;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(data.order_id, col2X, yPosition);
      
      yPosition += 15;

      // Confirmed Location Tap Card
      const locationCardHeight = data.has_delivery_location ? 28 : 20;
      pdf.setDrawColor(220, 220, 220);
      pdf.roundedRect(margin, yPosition, pageWidth - (2 * margin), locationCardHeight, 3, 3, 'S');

      yPosition += 8;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 26, 46);
      pdf.text('Confirmed Location Tap', margin + 5, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      if (data.has_delivery_location) {
        pdf.text('ADDRESS', margin + 5, yPosition);
        yPosition += 5;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(data.delivery_location, margin + 5, yPosition);
        yPosition += 5;
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(120, 120, 120);
        pdf.text(`GPS: ${data.delivery_gps.lat.toFixed(6)}, ${data.delivery_gps.lng.toFixed(6)}`, margin + 5, yPosition);
      } else {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text('Location was not shared at delivery', margin + 5, yPosition);
      }
      yPosition += 15;

      // Photos section
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 26, 46);
      pdf.text('Package Documentation', margin, yPosition);
      yPosition += 10;

      const validPhotos = data.photo_urls.filter(url => url);
      
      // Display photos in a 2-column grid
      const photoMargin = margin;
      const photoSpacing = 5;
      const photoWidth = (pageWidth - (2 * photoMargin) - photoSpacing) / 2;
      let photoX = photoMargin;
      let photoY = yPosition;
      
      for (let i = 0; i < validPhotos.length; i++) {
        const photoUrl = validPhotos[i];
        
        // Check if we need a new page
        if (photoY > pageHeight - 90) {
          pdf.addPage();
          photoY = margin;
          photoX = photoMargin;
        }

        try {
          // Load image
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = photoUrl;
          });

          // Calculate dimensions maintaining aspect ratio
          const maxPhotoHeight = 65;
          let imgWidth = photoWidth;
          let imgHeight = (img.height * photoWidth) / img.width;
          
          if (imgHeight > maxPhotoHeight) {
            imgHeight = maxPhotoHeight;
            imgWidth = (img.width * maxPhotoHeight) / img.height;
          }

          // Photo label
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(100, 100, 100);
          pdf.text(`PHOTO ${i + 1}`, photoX, photoY);
          photoY += 4;

          // Draw border around photo
          pdf.setDrawColor(220, 220, 220);
          pdf.setLineWidth(0.5);
          pdf.rect(photoX, photoY, imgWidth, imgHeight, 'S');

          // Add image to PDF
          pdf.addImage(img, 'JPEG', photoX, photoY, imgWidth, imgHeight);
          
          // Move to next position
          if (i % 2 === 0) {
            // Move to right column
            photoX = photoMargin + photoWidth + photoSpacing;
          } else {
            // Move to next row, left column
            photoX = photoMargin;
            photoY += imgHeight + 10;
          }
        } catch (error) {
          console.error(`Failed to load photo ${i + 1}:`, error);
          pdf.setFontSize(9);
          pdf.setTextColor(200, 0, 0);
          pdf.text(`Photo ${i + 1}: Failed to load`, photoX, photoY);
          
          // Move to next position
          if (i % 2 === 0) {
            photoX = photoMargin + photoWidth + photoSpacing;
          } else {
            photoX = photoMargin;
            photoY += 15;
          }
        }
      }

      // Footer on every page
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Footer line
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
        
        // Footer text
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(150, 150, 150);
        pdf.text('Generated by INK System', margin, pageHeight - 12);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
        pdf.text(`Generated: ${new Date().toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
      }

      // Save PDF
      pdf.save(`Delivery_Record_${data.order_id}_${new Date().getTime()}.pdf`);
      
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const photoLabels = [
    'Picture 1',
    'Picture 2',
    'Picture 3',
    'Picture 4'
  ];

  if (loading) {
    if (animationUrl) {
      const isVideo = /\.(mp4|webm|mov)$/i.test(animationUrl);
      return (
        <div className="h-[100dvh] bg-black flex items-center justify-center">
          {isVideo ? (
            <video src={animationUrl} autoPlay loop muted playsInline className="w-full h-full object-contain" />
          ) : (
            <img src={animationUrl} alt="" className="w-full h-full object-contain" />
          )}
        </div>
      );
    }
    return <div className="h-[100dvh] bg-black" />;
  }

  return (
    <>
      <title>Delivery Verified | INK</title>
      <div className="min-h-screen bg-[#FAF9F6]">
        {/* Header */}
        <header className="bg-black text-white py-6 px-6 border-b border-white/20">
          <div className="max-w-7xl mx-auto">
            <a href="/" className="font-serif text-3xl font-light tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>ink.</a>
          </div>
        </header>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-black text-white py-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <div className="font-serif text-5xl md:text-6xl font-light mb-2 leading-tight tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Delivery Verified
            </div>
            <p className="text-white/50 text-sm tracking-wide mb-4">
              Your shipment has been documented and confirmed
            </p>
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

        {/* Map Section：仅在有真实交付位置时显示 */}
        <div className="bg-[#FAF9F6] py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl" style={{ fontFamily: "'DM Serif Display', serif" }}>Confirmed Location Tap</h2>
            </div>
            {data.has_delivery_location ? (
              <>
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative border border-gray-300">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${data.delivery_gps.lat},${data.delivery_gps.lng}&zoom=15`}
                    className="border-0 w-full h-full"
                    title="Confirmed Location Tap Map"
                    allowFullScreen
                  />
                </div>
                <p className="text-center mt-4 text-sm text-gray-600">
                  {data.delivery_location}
                </p>
                <p className="text-center mt-1 text-xs text-gray-400 font-mono">
                  {data.delivery_gps.lat.toFixed(6)}, {data.delivery_gps.lng.toFixed(6)}
                </p>
              </>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Location was not shared at delivery
              </p>
            )}
          </div>
        </div>

        {/* Photos Section */}
        <div className="bg-white py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl" style={{ fontFamily: "'DM Serif Display', serif" }}>Package Documentation</h2>
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
            <h2 className="font-serif text-4xl mb-8" style={{ fontFamily: "'DM Serif Display', serif" }}>Your Verified Delivery Record</h2>
            
            <div className="flex justify-center">
              <button
                onClick={downloadPDF}
                disabled={generatingPDF}
                className="bg-black text-white px-10 py-4 text-sm uppercase tracking-wider font-medium hover:bg-gray-800 transition-all hover:-translate-y-1 hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {generatingPDF ? 'Generating...' : 'Download Delivery Record'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-black text-white/60 py-12 px-6 text-center">
          <div className="text-xs uppercase tracking-wider space-x-4">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>·</span>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
          <a href="/support" className="text-xs uppercase tracking-wider hover:text-white transition-colors mt-4 inline-block">Contact Support</a>
          <p className="mt-4 text-xs">© 2026 ink. All rights reserved.</p>
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
    </>
  );
};

export default DeliveryRecord;
