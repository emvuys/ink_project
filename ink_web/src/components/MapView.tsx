interface MapViewProps {
  lat: number;
  lng: number;
  className?: string;
}

const MapView = ({ lat, lng, className = "" }: MapViewProps) => {
  // Use OpenStreetMap static map image
  // Zoom level 15 provides good detail for delivery locations
  const zoom = 15;
  const size = "320x200";
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`;
  
  // Alternative: Use static image (but it doesn't show marker)
  // const staticMapUrl = `https://tile.openstreetmap.org/${zoom}/${Math.floor((lng + 180) / 360 * Math.pow(2, zoom))}/${Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))}.png`;

  return (
    <div className={`w-full overflow-hidden rounded-lg border border-ink-gray/20 ${className}`}>
      <iframe
        width="100%"
        height="200"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={mapUrl}
        className="border-0"
        title="Delivery Location Map"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};

export default MapView;

