import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { styled } from '@superset-ui/core';
import { Button, Input } from 'antd';

const Container = styled.div`
  padding: 1em;
`;

export default function MyDynamicTableChart({ formData }: any) {
  const [columnsInput, setColumnsInput] = useState('');
   const dashboardId = 13;

  console.log('Dashboard ID:', dashboardId);


  const handleSubmit = async () => {
    const res = await fetch('/api/v1/plugin_dynamic_table/create_viz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        columns: columnsInput.split(',').map(s => s.trim()),
        dataset_id: formData.datasource.split('__')[0],
        dashboard_id: dashboardId,
      }),
    });
    const json = await res.json();
    if (json.success) {
      alert('Table visualization added to the dashboard!');
    }
  };

  return (
    <Container>
      <h3>Enter columns (comma-separated):</h3>
      <Input
        value={columnsInput}
        onChange={e => setColumnsInput(e.target.value)}
        placeholder="e.g. name, age, salary"
      />
      <Button onClick={handleSubmit} style={{ marginTop: '10px' }}>
        Submit
      </Button>
    </Container>
  );
}
