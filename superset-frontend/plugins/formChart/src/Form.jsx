import React, { useState, useEffect } from 'react';
import { Input, Form, Button, Modal } from 'antd';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(';').shift() : '';
}

export default function AutoForm({ allColumns, formData, height, width, chartId }) {
  const isInDashboard = window.location.pathname.includes('/dashboard/');
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customLabels, setCustomLabels] = useState({});
  const [originalLabels, setOriginalLabels] = useState({}); // Save original column names

  useEffect(() => {
    const fetchLabels = async () => {
      if (!chartId) return;

      try {
        const response = await fetch(`/api/v1/chart/${chartId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrf_token'),
          },
        });

        const data = await response.json();
        const chart = data?.result;
        const params = chart?.params ? JSON.parse(chart.params) : {};
        const labels = params?.extra_form_data?.custom_form_labels || {};
        setCustomLabels(labels);
        setOriginalLabels(
          allColumns.reduce((acc, col) => {
            acc[col] = col;
            return acc;
          }, {})
        );
      } catch (error) {
        console.error('Failed to fetch chart metadata:', error);
      }
    };

    fetchLabels();
  }, [allColumns]);

  const updateChartMetadata = async (customLabelsToSave) => {
    if (!chartId) {
      Modal.error({ title: 'Chart ID missing' });
      return;
    }

    try {
      const getResponse = await fetch(`/api/v1/chart/${chartId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrf_token'),
        },
      });

      const chartData = await getResponse.json();
      const chart = chartData?.result;
      if (!chart) throw new Error('Chart metadata (result) not found');

      let currentParams = {};
      try {
        currentParams = chart.params ? JSON.parse(chart.params) : {};
      } catch (err) {
        console.warn('Failed to parse params:', err);
      }

      currentParams.extra_form_data = {
        ...currentParams.extra_form_data,
        custom_form_labels: customLabelsToSave,
      };

      const putResponse = await fetch(`/api/v1/chart/${chartId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrf_token'),
        },
        body: JSON.stringify({
          slice_name: chart.slice_name,
          viz_type: chart.viz_type,
          datasource_id: chart.datasource_id,
          datasource_type: chart.datasource_type,
          params: JSON.stringify(currentParams),
        }),
      });

      if (!putResponse.ok) {
        const errorText = await putResponse.text();
        throw new Error(errorText || 'Failed to update chart');
      }
      if (customLabelsToSave && Object.keys(customLabelsToSave).length > 0) {
        Modal.success({ title: 'Labels Saved Successfully' });
      } else {
        Modal.success({ title: 'Labels Reset Successfully' });
      }
    } catch (error) {
      Modal.error({
        title: 'Save Error',
        content: error?.message || 'Unknown error occurred',
      });
    }
  };

  const handleFinish = async values => {
    const dbId = formData.dbId;
    let tableName;
    let schema;
    if (formData.datasource_name?.includes('.')) {
      const parts = formData.datasource_name.split('.');
      schema = parts[0];
      tableName = parts[1].replace(/"/g, '');
    }

    if (!dbId || !tableName) {
      Modal.error({
        title: 'Missing Database Info',
        content: 'Datasource name or database ID is missing from formData.',
      });
      return;
    }

    const columns = Object.keys(values);
    const formattedValues = columns.map(col => {
      const val = values[col];
      return typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val;
    });

    const quotedColumns = columns.map(col => `"${col}"`).join(', ');
    const insertQuery = `INSERT INTO ${schema}."${tableName}" (${quotedColumns}) VALUES (${formattedValues.join(', ')});`;

    try {
      const response = await fetch('/api/v1/sqllab/execute/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrf_token'),
        },
        body: JSON.stringify({
          sql: insertQuery,
          database_id: dbId,
          schema: schema || null,
        }),
      });

      const result = await response.json();

      if (response.ok && result?.status === 'success') {
        Modal.success({ title: 'Row Inserted' });
        form.resetFields();
      } else {
        Modal.error({ title: 'Insert Failed' });
      }
    } catch (err) {
      Modal.error({ title: 'Request Error', content: err.toString() });
    }
  };

  const showEditLabelsModal = () => {
    setIsModalVisible(true);
  };

  const handleSaveLabels = () => {
    const updatedLabels = {};
    allColumns.forEach(col => {
      const newLabel = document.getElementById(`label-input-${col}`).value;
      updatedLabels[col] = newLabel;
    });

    setCustomLabels(updatedLabels);
    updateChartMetadata(updatedLabels);
    setIsModalVisible(false);
  };

  const handleUndoLabels = () => {
    const clearedLabels = {};
    allColumns.forEach(col => {
      clearedLabels[col] = col;
    });

    setCustomLabels({});
    updateChartMetadata({});
    //Modal.info({ title: 'Labels Reset to Original Column Names' });
  };

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', height, width }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ overflowX: 'auto', overflowY: 'auto' }}
      >
        <div style={{ minHeight: '400px', padding: '1rem' }}>
          {allColumns?.map(col => (
            <Form.Item
              key={col}
              name={col}
              label={customLabels[col] || col}
              rules={[{ required: false, message: `Please input ${col}` }]}
            >
              <Input />
            </Form.Item>
          ))}
        </div>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
      </Form>

      {!isInDashboard && (
        <>
          <Button type="link" onClick={showEditLabelsModal}>
            Edit Labels
          </Button>
          <Button type="link" onClick={handleUndoLabels}>
            Reset Labels
          </Button>
        </>
      )}

      <Modal
        title="Edit Form Field Labels"
        visible={isModalVisible}
        onOk={handleSaveLabels}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSaveLabels}>
            Save
          </Button>,
        ]}
      >
        <div>
          {allColumns?.map(col => (
            <div key={col} style={{ marginBottom: '10px' }}>
              <label>{col}</label>
              <Input
                id={`label-input-${col}`}
                defaultValue={customLabels[col] || col}
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
