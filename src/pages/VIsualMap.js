import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import './VisualMap.css';

// Remove any default icon URLs so that our custom icons are used.
delete L.Icon.Default.prototype._getIconUrl;

function VisualMap() {
  const location = useLocation();
  const { destinations, tripId } = location.state || {};
  const [coords, setCoords] = useState([]);

  // Helper function to fetch coordinates from Nominatim
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
        const promises = destinations.map(dest => fetchCoordinates(dest.name));
        const results = await Promise.all(promises);
        const validCoords = results.filter(coord => coord !== null);
        setCoords(validCoords);
      }
    };
    getCoords();
  }, [destinations]);

  // Center map on first destination or a default location
  const center = coords.length > 0 ? coords[0] : [51.505, -0.09];

  return (
    <div className="visual-map-container">
      <h2>Trip Route Map</h2>
      <MapContainer center={center} zoom={6} scrollWheelZoom={true} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {coords.map((position, index) => {
          // Create a custom div icon that displays the destination number
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
    </div>
  );
}

export default VisualMap;



