import React, { useRef, useEffect } from 'react';
import { Map, NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const GlobeMap = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const map = new Map({
      container: mapContainerRef.current,
      style: 'https://demotiles.maplibre.org/style.json', // Demo style from MapLibre
      center: [0, 0],
      zoom: 1,
    });

    map.addControl(new NavigationControl(), 'top-right');

    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '100%', borderRadius: '10px', overflow: 'hidden' }}
    />
  );
};

export default GlobeMap;




