import React from 'react';
import { PieTransformPropsExtend } from './types';
import Echart from '../components/Echart';
import { allEventHandlers } from '../utils/eventHandlers';

export default function EchartsPie(props: PieTransformPropsExtend) {
  const { height, width, echartOptions, selectedValues, refs, tableData } = props;
  const eventHandlers = allEventHandlers(props);

  return (
    <div style={{overflowX: 'auto', overflowY: 'auto', height: height,  width:width }} >
      <Echart
        refs={refs}
        height={height}
        width={width}
        echartOptions={echartOptions}
        eventHandlers={eventHandlers}
        selectedValues={selectedValues}
      />
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
  <thead>
    <tr>
      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Category</th>
      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Value</th>
      <th style={{ border: '1px solid #ddd', padding: '8px' }}>Percent</th>
    </tr>
  </thead>
  <tbody>
    {tableData.map((row, index) => (
      <tr key={index}>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: typeof row.color === 'string' ? row.color : '#000', // Fallback color if not a string
                marginRight: '8px',
                borderRadius: '2px',
              }}
            ></div>
            <span>{row.name}</span>
          </div>
        </td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.value}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.percent}</td>
      </tr>
    ))}
  </tbody>
</table>


      
    </div>
  );
}
