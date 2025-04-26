import React from 'react';
import { Input, Form, Button, Modal } from 'antd';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(';').shift() : '';
}

export default function AutoForm({ allColumns, formData, height, width }) {
  const [form] = Form.useForm();

  const handleFinish = async values => {
    
    //const tableName = formData.datasource_name;
    const dbId = formData.dbId;
    //const schema = formData.schema;
    let tableName;
    let schema;
    if (formData.datasource_name?.includes('.')) {
      const parts = formData.datasource_name.split('.');
      schema = parts[0];
      tableName = parts[1].replace(/"/g, ''); // strip any quotes
    }
    console.log(' tableName',  tableName);
    console.log(' dbId',  dbId);
    console.log(' schema',  schema);

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
      console.log("Response:", result);

      if (response.ok && result?.status === 'success') {
        Modal.success({
          title: 'Row Inserted',
          content: <pre>{insertQuery}</pre>,
        });
        form.resetFields();
      } else {
        Modal.error({
          title: 'Insert Failed',
          content: result.message || JSON.stringify(result),
        });
      }
    } catch (err) {
      Modal.error({
        title: 'Request Error',
        content: err.toString(),
      });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      style={{ overflowX: 'auto', overflowY: 'auto', height, width }}
    >
      <div style={{ minHeight: '400px', padding: '1rem' }}>
        {allColumns?.map(col => (
          <Form.Item
            key={col}
            name={col}
            label={col}
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
  );
}
