import React from 'react';
import { GeoNodeChartTransformedProps } from './types';

export default function GeoNode(props: GeoNodeChartTransformedProps) {
  const { height, width,embedCode,geonodeMap } = props;
  if (embedCode) {
    return (
      <div>
        <iframe
          width={width}
          height={height}
          src={embedCode}
          frameBorder="0"
          style={{ border: 'none' }}
          allowFullScreen
          title="GeoNode Dataset"
        ></iframe>
      </div>
    );
  }
  if (!geonodeMap) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6c757d' }}>
      <h1>No map selected</h1>
      </div>
    );
  }

  return (
    <div>
      <iframe
        width={width}
        height={height}
        src={`https://geonode.streamstech.com/maps/${geonodeMap}/embed`}
        frameBorder="0"
        style={{ border: 'none' }}
        allowFullScreen
        title="GeoNode Dataset"
      ></iframe>
    </div>
  );
}
