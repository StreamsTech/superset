import React, { useState, useEffect } from 'react';
import { styled } from '@superset-ui/core';
import { PromptChartTransformedProps } from './types';
import { Button, Input, Modal, Form } from 'antd';

const Container = styled.div`
  padding: 1em;
`;
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(';').shift() ?? '' : '';
}




export default function PromptChart(props: PromptChartTransformedProps) {
  const { chartId, formData } = props;
  const [form] = Form.useForm();
  console.log('chart ID:', chartId)
  const [dashboardId, setDashboardId] = useState<number | null>(null);

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

  useEffect(() => {
    const fetchDashboardId = async () => {
      const id = await getExploreData(
        formData.urlParams.form_data_key,
        formData.urlParams.dashboard_page_id,
        formData.urlParams.slice_id,
      );
      setDashboardId(id);
    };
    fetchDashboardId();
  }, [formData.urlParams.form_data_key]);

  console.log('Dashboard ID:', dashboardId);
  //console.log('formData:', formData);
  //console.log('formDatadatakey:', formData.urlParams.form_data_key);

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
