import React from 'react';
import { GeoNodeChartTransformedProps } from './types';

export default function GeoNode(props: GeoNodeChartTransformedProps) {
  const { height, width,embedCode } = props;
  return (
    <div>
      <iframe
        width={width}
        height={height}
        src={`https://stable.demo.geonode.org/datasets/${embedCode}/embed`}
        frameBorder="0"
        style={{ border: 'none' }}
        allowFullScreen
        title="GeoNode Dataset"
      ></iframe>
    </div>
  );
}
