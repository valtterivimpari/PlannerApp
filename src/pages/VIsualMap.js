import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import './VisualMap.css';

// Remove any default icon URLs so that our custom icons are used.
delete L.Icon.Default.prototype._getIconUrl;

// Helper component to update the map's center programmatically
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function VisualMap() {
  const location = useLocation();
  const navigate = useNavigate();
  const { destinations, tripId } = location.state || {};
  const [coords, setCoords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Helper: fetch coordinates from Nominatim
  const fetchCoordinates = async (cityName) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (error) {
      console.error(`Error fetching coordinates for ${cityName}:`, error);
    }
    return null;
  };

  useEffect(() => {
    const getCoords = async () => {
      if (destinations && destinations.length > 0) {
        // Assume each destination has a 'name' property
        const promises = destinations.map((dest) => fetchCoordinates(dest.name));
        const results = await Promise.all(promises);
        const validCoords = results.filter((coord) => coord !== null);
        setCoords(validCoords);
      }
    };
    getCoords();
  }, [destinations]);

  // Center the map on the current destination or fallback to a default location.
  const defaultCenter = [51.505, -0.09];
  const center = coords.length > 0 ? coords[currentIndex] : defaultCenter;

  // Navigation handlers.
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (coords && currentIndex < coords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="visual-map-container">
      <h2>Trip Route Map</h2>
      <MapContainer center={center} zoom={6} scrollWheelZoom={true} className="map">
        <ChangeMapView center={center} zoom={6} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {coords.map((position, index) => {
          // Create a custom div icon that displays the destination number.
          const markerNumberIcon = L.divIcon({
            html: `<div class="marker-number">${index + 1}</div>`,
            className: 'custom-marker-icon',
            iconSize: [35, 35],
            iconAnchor: [17.5, 35],
          });
          return (
            <Marker key={index} position={position} icon={markerNumberIcon}>
              <Popup>
                {destinations[index]?.name || `Destination ${index + 1}`}
              </Popup>
            </Marker>
          );
        })}
        {coords.length > 1 && <Polyline positions={coords} color="blue" />}
      </MapContainer>
      <div className="navigation-controls">
        <button className="nav-button" onClick={handlePrev} disabled={currentIndex === 0}>
          Previous
        </button>
        <span className="destination-label">
          {destinations && destinations[currentIndex]
            ? `Destination ${currentIndex + 1}: ${destinations[currentIndex].name}`
            : `Destination ${currentIndex + 1}`}
        </span>
        <button className="nav-button" onClick={handleNext} disabled={currentIndex === coords.length - 1}>
          Next
        </button>
      </div>
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate(`/trip-info/${tripId}`)}>
          Back to Trip Info
        </button>
      </div>
    </div>
  );
}

export default VisualMap;





