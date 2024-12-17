import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const MapView = ({ destination }) => {
    const [position, setPosition] = useState(null); // Default null until coordinates are fetched

    useEffect(() => {
        if (destination) {
            const fetchCoordinates = async () => {
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${destination}`
                    );
                    const data = await response.json();
                    if (data && data.length > 0) {
                        setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                    } else {
                        console.warn("No results found for the destination");
                    }
                } catch (error) {
                    console.error("Error fetching coordinates:", error);
                }
            };

            fetchCoordinates();
        }
    }, [destination]);

    return (
        <div>
            {position ? (
                <MapContainer center={position} zoom={13} style={{ height: "400px", width: "100%" }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={position}>
                        <Popup>
                            {destination || "Selected Destination"}
                        </Popup>
                    </Marker>
                </MapContainer>
            ) : (
                <p>Loading map for {destination}...</p>
            )}
        </div>
    );
};

export default MapView;
