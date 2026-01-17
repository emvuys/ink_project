import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Download, FileText, X } from "lucide-react";
import { retrieveProof } from "@/lib/api";
import { reverseGeocode } from "@/lib/geocoding";
import type { ProofRecord } from "@/lib/types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Record = () => {
  const { proofId } = useParams<{ proofId: string }>();
  const [proof, setProof] = useState<ProofRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [address, setAddress] = useState<string>('Loading address...');
  const [showTechnical, setShowTechnical] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

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
      
      const geocodeResult = await reverseGeocode(data.enrollment.shipping_address_gps);
      if (geocodeResult.success && geocodeResult.address) {
        setAddress(geocodeResult.address);
      } else {
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
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatSignature = (sig: string) => {
    if (!sig) return 'N/A';
    const cleanSig = sig.startsWith('0x') ? sig.slice(2) : sig;
    if (cleanSig.length <= 8) {
      return `0x${cleanSig}`;
    }
    return `0x${cleanSig.slice(0, 4)}...${cleanSig.slice(-4)}`;
  };

  const downloadPDF = async () => {
    if (!proof) {
      console.error('No proof data available');
      alert('No proof data available. Please try again.');
      return;
    }
    
    setGeneratingPDF(true);
    console.log('Starting PDF generation...');
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      console.log('jsPDF instance created');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Authenticated Delivery Record', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Subtitle
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Cryptographically verified proof of delivery', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Horizontal line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Order Information
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Order Information', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      if (proof.merchant) {
        pdf.text(`Merchant: ${proof.merchant}`, margin, yPosition);
        yPosition += 6;
      }
      
      pdf.text(`Order Number: ${proof.order_id}`, margin, yPosition);
      yPosition += 6;
      
      pdf.text(`Delivery Date: ${formatTimestamp(proof.enrollment.timestamp)}`, margin, yPosition);
      yPosition += 6;
      
      pdf.text(`Location: ${address}`, margin, yPosition);
      yPosition += 12;

      // GPS Coordinates
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('GPS Verification', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const gps = proof.enrollment.shipping_address_gps;
      pdf.text(`Coordinates: ${gps.lat.toFixed(6)}, ${gps.lng.toFixed(6)}`, margin, yPosition);
      yPosition += 6;

      if (proof.delivery) {
        const deliveryGps = proof.delivery.delivery_gps;
        pdf.text(`Delivery GPS: ${deliveryGps.lat.toFixed(6)}, ${deliveryGps.lng.toFixed(6)}`, margin, yPosition);
        yPosition += 12;
      } else {
        yPosition += 6;
      }

      // Map image
      const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${gps.lng - 0.005},${gps.lat - 0.005},${gps.lng + 0.005},${gps.lat + 0.005}&layer=mapnik&marker=${gps.lat},${gps.lng}`;
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.text(`Map: ${mapUrl}`, margin, yPosition);
      yPosition += 12;

      // Technical Details
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Technical Verification Details', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      
      pdf.text(`NFC Tag ID: ${proof.nfc_uid ? proof.nfc_uid.toUpperCase() : 'N/A'}`, margin, yPosition);
      yPosition += 6;
      
      pdf.text(`Proof ID: ${proof.proof_id ? proof.proof_id.toUpperCase() : 'N/A'}`, margin, yPosition);
      yPosition += 6;
      
      const sigText = `Signature: ${proof.signature || 'N/A'}`;
      const splitSig = pdf.splitTextToSize(sigText, pageWidth - 2 * margin);
      pdf.text(splitSig, margin, yPosition);
      yPosition += 6 * splitSig.length;
      
      yPosition += 6;

      // Photos section
      if (proof.enrollment.photo_urls && proof.enrollment.photo_urls.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Package Documentation', margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        
        for (let i = 0; i < proof.enrollment.photo_urls.length; i++) {
          const url = proof.enrollment.photo_urls[i];
          if (url) {
            try {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.src = url;
              
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                setTimeout(reject, 5000);
              });

              const imgWidth = 80;
              const imgHeight = (img.height / img.width) * imgWidth;
              
              if (yPosition + imgHeight > pageHeight - margin) {
                pdf.addPage();
                yPosition = margin;
              }

              pdf.addImage(img, 'JPEG', margin, yPosition, imgWidth, imgHeight);
              pdf.setFontSize(8);
              pdf.setTextColor(100, 100, 100);
              pdf.text(photoLabels[i], margin, yPosition + imgHeight + 4);
              yPosition += imgHeight + 10;
            } catch (err) {
              console.error('Failed to load image:', err);
              pdf.text(`${photoLabels[i]}: [Image unavailable]`, margin, yPosition);
              yPosition += 6;
            }
          }
        }
      }

      // Footer
      const footerY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('This document is a cryptographically verified proof of delivery.', pageWidth / 2, footerY, { align: 'center' });
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 4, { align: 'center' });
      pdf.text('Powered by ink. - https://in.ink', pageWidth / 2, footerY + 8, { align: 'center' });

      // Save PDF
      const filename = `delivery-record-${proof.order_id.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      console.log('Saving PDF as:', filename);
      pdf.save(filename);
      console.log('PDF saved successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const photoLabels = [
    'Authentication Markers',
    'Serial Number',
    'Complete Contents',
    'Packaging Condition'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-serif text-xl" style={{ fontFamily: "'DM Serif Display', serif" }}>Loading your delivery record...</p>
        </div>
      </div>
    );
  }

  if (error || !proof) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center">
          <h1 className="font-serif text-4xl mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>Delivery record not found</h1>
          <p className="text-gray-600">{error || 'Please check your link and try again.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="bg-black text-white py-6 px-6 border-b border-white/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="font-serif text-3xl font-light tracking-[0.1em] hover:text-[#D4AF37] transition-colors" style={{ fontFamily: "'DM Serif Display', serif" }}>ink.</Link>
          <Link to="/privacy" className="text-sm uppercase tracking-wider hover:text-[#D4AF37] transition-colors">
            Privacy Policy
          </Link>
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
            {formatTimestamp(proof.enrollment.timestamp)}
          </p>
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-white py-12 px-6">
        <div className="max-w-4xl mx-auto flex justify-center gap-16 flex-wrap">
          {proof.merchant && (
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Merchant</div>
              <div className="font-serif text-2xl font-medium" style={{ fontFamily: "'DM Serif Display', serif" }}>{proof.merchant}</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">Order Number</div>
            <div className="font-serif text-2xl font-medium" style={{ fontFamily: "'DM Serif Display', serif" }}>{proof.order_id}</div>
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
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${proof.enrollment.shipping_address_gps.lng - 0.005},${proof.enrollment.shipping_address_gps.lat - 0.005},${proof.enrollment.shipping_address_gps.lng + 0.005},${proof.enrollment.shipping_address_gps.lat + 0.005}&layer=mapnik&marker=${proof.enrollment.shipping_address_gps.lat},${proof.enrollment.shipping_address_gps.lng}`}
              className="border-0 w-full h-full"
              title="Delivery Location Map"
              lang="en"
            />
            <style>{`
              iframe[title="Delivery Location Map"] {
                filter: grayscale(0);
              }
            `}</style>
          </div>
          
          <p className="text-center mt-6 font-serif text-xl text-gray-600" style={{ fontFamily: "'DM Serif Display', serif" }}>
            {address}
          </p>
          <p className="text-center mt-2 text-sm text-gray-500 font-mono">
            {proof.enrollment.shipping_address_gps.lat.toFixed(6)}, {proof.enrollment.shipping_address_gps.lng.toFixed(6)}
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
            {proof.enrollment.photo_urls.map((url, index) => (
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
              disabled={generatingPDF}
              className="bg-black text-white px-10 py-4 text-sm uppercase tracking-wider font-medium hover:bg-gray-800 transition-all hover:-translate-y-1 hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {generatingPDF ? 'Generating PDF...' : 'Download PDF Certificate'}
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
                  <span className="font-medium">{proof.nfc_uid ? proof.nfc_uid.toUpperCase() : 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Proof ID:</span>
                  <span className="font-medium break-all">{proof.proof_id ? proof.proof_id.toUpperCase() : 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">GPS Coordinates:</span>
                  <span className="font-medium">
                    {proof.enrollment.shipping_address_gps.lat.toFixed(4)}, {proof.enrollment.shipping_address_gps.lng.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Signature:</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(proof.signature || '')}
                    className="font-medium hover:text-[#D4AF37] transition-colors"
                    title="Click to copy"
                  >
                    {formatSignature(proof.signature)}
                  </button>
                </div>
                {proof.delivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery GPS:</span>
                    <span className="font-medium">
                      {proof.delivery.delivery_gps.lat.toFixed(4)}, {proof.delivery.delivery_gps.lng.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white/60 py-12 px-6 text-center">
        <div className="text-xs uppercase tracking-wider space-x-4">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link to="/" className="hover:text-[#D4AF37] transition-colors">Powered by ink.</Link>
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

export default Record;
