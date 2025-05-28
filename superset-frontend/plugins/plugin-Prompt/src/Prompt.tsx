import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, Form, Select } from 'antd';
import { styled } from '@superset-ui/core';
import { PromptChartTransformedProps } from './types';

const { Option } = Select;

const Container = styled.div`
  padding: 1em;
`;
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(';').shift() ?? '' : '';
}




export default function PromptChart(props: PromptChartTransformedProps) {
  const dashboardIdFromURL = window.location.pathname.match(/\/dashboard\/(\d+)/)?.[1];
  const { chartId, formData, height, width, databaseId,schemaName } = props;
  const [form] = Form.useForm();
  console.log('chart ID:', chartId)
  const [dashboardId, setDashboardId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  //const [databases, setDatabases] = useState<any[]>([]);
  //const [schemas, setSchemas] = useState<any[]>([]);
  //const [selectedDb, setSelectedDb] = useState<number | null>(null);
  //const [selectedSchema, setSelectedSchema] = useState<string | null>(null);

  async function getExploreData(
    formDataKey: string,
    dashboardPageId: string,
    sliceId: number,
  ) {
    try {
      const url = `/api/v1/explore/?form_data_key=${encodeURIComponent(
        formDataKey,
      )}&dashboard_page_id=${encodeURIComponent(
        dashboardPageId,
      )}&slice_id=${encodeURIComponent(sliceId.toString())}`;
      //const url = `/api/v1/explore/?form_data_key=qIHa042GOfr0x55bSO9gH7f861xEyvCnZVWm3Q3mXJF8BHpPHa4QEGAb22G2tSUQ&dashboard_page_id=fyFyQDQEL3z&slice_id=3278`;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCookie('csrf_token'),
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      //console.log('data:', data);
      const dashboardId = data.result?.form_data?.dashboardId;
      //console.log('Dashboard ID:', dashboardId);
      return dashboardId;
    } catch (error) {
      console.error('Error fetching explore data:', error);
      return null;
    }
  }

  //useEffect(() => {
  //  const fetchDatabases = async () => {
  //    try {
  //      const res = await fetch('/api/v1/database/');
  //      const json = await res.json();
  //      setDatabases(json.result || []);
  //      console.log('Databases:', json.result);
  //    } catch (err) {
  //      console.error('Failed to load databases', err);
  //    }
  //  };
  //  fetchDatabases();
  //}, []);
//
  //useEffect(() => {
  //  const fetchSchemas = async () => {
  //    console.log('Selected DB:', selectedDb);
  //    if (!selectedDb) return;
  //    try {
  //      const res = await fetch(`/api/v1/database/${selectedDb}/schemas/`);
  //      const json = await res.json();
  //      setSchemas(json.result || []);
  //      console.log('Schemas:', json.result);
  //    } catch (err) {
  //      console.error('Failed to load schemas', err);
  //    }
  //  };
  //  fetchSchemas();
  //}, [selectedDb]);


  useEffect(() => {
    if (dashboardIdFromURL) {
      setDashboardId(parseInt(dashboardIdFromURL, 10));
    } else {
      const fetchDashboardId = async () => {
        const id = await getExploreData(
          formData.urlParams.form_data_key,
          formData.urlParams.dashboard_page_id,
          formData.urlParams.slice_id,
        );
        setDashboardId(id);
      };
      fetchDashboardId();
    }
  }, [dashboardIdFromURL, formData.urlParams.form_data_key]);


  console.log('Dashboard ID:', dashboardId);
  //console.log('formData:', formData);
  //console.log('formDatadatakey:', formData.urlParams.form_data_key);

  const parsePrompt = (prompt: string) => {
    const result: {
      chart?: string;
      dimensions?: string[];
      metric?: { aggregate: string; column: string };
    } = {};

    // Example: "chart= Pie, Dimensions= City, Street, Metric=Count[Numbers]"
    const parts = prompt.split(',');

    parts.forEach(part => {
      const [keyRaw, valueRaw] = part.split('=');
      if (!keyRaw || !valueRaw) return;

      const key = keyRaw.trim().toLowerCase();
      const value = valueRaw.trim();

      if (key === 'chart') {
        result.chart = value.toLowerCase();
      } else if (key === 'dimensions') {
        result.dimensions = value.split(',').map(d => d.trim());
      } else if (key === 'metric') {
        const match = value.match(/^(\w+)\[(.+)\]$/);
        if (match) {
          result.metric = {
            aggregate: match[1].toUpperCase(),
            column: match[2].trim(),
          };
        }
      }
    });

    return result;
  };

  const handleSubmit = async (values: { columns: string }) => {
    //const columnsInput = values.columns;
    const parsed = parsePrompt(values.columns);
    console.log('Parsed Prompt:', parsed);

    if (!parsed.chart || !parsed.dimensions || !parsed.metric) {
      Modal.error({ title: 'Invalid prompt format!' });
      return;
    }
    const res = await fetch('/prompt_table/create_viz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        viz_type: parsed.chart,
        groupby: parsed.dimensions,
        metric: parsed.metric,
        dataset_id: formData.datasource.split('__')[0],
        dashboard_id: dashboardId,
      }),
    });

    const json = await res.json();
    if (json.success) {
      Modal.success({
        title: `${parsed.chart} Table visualization added to the dashboard!`,
      });
      form.resetFields();
    }
  };

  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      Modal.error({ title: 'Query is empty!' });
      return;
    }

    //if (!selectedDb || !selectedSchema) {
    //  Modal.error({ title: 'Please select both a database and schema before submitting the query.' });
    //  return;
    //}

    try {
      const res = await fetch('/api/v1/gemini_sql/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrf_token'),
        },
        credentials: 'include',
        body: JSON.stringify({
          queryDescription: query,
          dbId: databaseId,
          schemaName: schemaName,
        }),
      });

      const json = await res.json();
      if (json?.query) {
        Modal.success({
          title: 'Query Generated!',
          content: <pre>{JSON.stringify(json.query, null, 2)}</pre>,
          width: 600,
        });
        setQuery('');
      } else {
        Modal.error({ title: 'Failed to generate query' });
      }
    } catch (err) {
      console.error(err);
      Modal.error({ title: 'Error sending query' });
    }
  };

  return (
    <div style={{  overflowX: 'auto', overflowY: 'auto', height, width }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Enter columns (comma-separated)"
          name="columns"
          rules={[{ required: true, message: 'Please enter at least one column' }]}
        >
          <Input placeholder="e.g. chart=Pie, dimensions=City, Street, metric=Count[Numbers]" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
      <hr style={{ margin: '2em 0' }} />
      <Form layout="vertical">
        <Form.Item label="Enter SQL-like query">
          <Input.TextArea
        rows={3}
        defaultValue={query}
        onBlur={e => setQuery(e.target.value)}
        placeholder="SELECT * FROM table WHERE ..."
          />
        </Form.Item>
        <Form.Item>
          <Button type="default" onClick={handleQuerySubmit}>
        Submit Query
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
