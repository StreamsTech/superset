import React from 'react';
import { Input, Form, Button } from 'antd';

export default function AutoForm({ allColumns, onSubmit,height,width }) {
  const [form] = Form.useForm();

  const handleFinish = values => {
    onSubmit(values);
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} style={{ overflowX: 'auto', overflowY: 'auto', height: height, width: width }}>
      <div style={{ minHeight: '400px', padding: 'auto' }}>
        {allColumns?.map(col => (
          <Form.Item
            key={col}
            name={col}
            label={col}
            rules={[{ required: true, message: `Please input ${col}` }]}
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
