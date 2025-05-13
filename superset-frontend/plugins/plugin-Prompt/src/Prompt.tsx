import { styled } from '@superset-ui/core';
import { Button, Input, Modal, Form } from 'antd';

const Container = styled.div`
  padding: 1em;
`;

export default function MyDynamicTableChart({ formData }: any) {
  const [form] = Form.useForm();
  const dashboardId = 13;

  const handleSubmit = async (values: { columns: string }) => {
    const columnsInput = values.columns;
    const res = await fetch('/prompt_table/create_viz', {
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
      Modal.success({
        title: 'Table visualization added to the dashboard!',
      });
      form.resetFields(); 
    }
  };

  return (
    <Container>
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
          <Input placeholder="e.g. name, age, salary" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Container>
  );
}
