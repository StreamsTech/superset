import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, Form } from 'antd';
import { PromptChartTransformedProps } from './types';

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(';').shift() ?? '' : '';
}




export default function PromptChart(props: PromptChartTransformedProps) {
  const dashboardIdFromURL = window.location.pathname.match(/\/dashboard\/(\d+)/)?.[1];
  const { chartId, formData, height, width, databaseId, schemaName } = props;
  //const [form] = Form.useForm();
  console.log('chart ID:', chartId)
  const [dashboardId, setDashboardId] = useState<number | null>(null);
  const [query, setQuery] = useState('');


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

  //const parsePrompt = (prompt: string) => {
  //  const result: {
  //    chart?: string;
  //    dimensions?: string[];
  //    metric?: { aggregate: string; column: string };
  //  } = {};
  //
  //  // Example: "chart= Pie, Dimensions= City, Street, Metric=Count[Numbers]"
  //  const parts = prompt.split(',');
  //
  //  parts.forEach(part => {
  //    const [keyRaw, valueRaw] = part.split('=');
  //    if (!keyRaw || !valueRaw) return;
  //
  //    const key = keyRaw.trim().toLowerCase();
  //    const value = valueRaw.trim();
  //
  //    if (key === 'chart') {
  //      result.chart = value.toLowerCase();
  //    } else if (key === 'dimensions') {
  //      result.dimensions = value.split(',').map(d => d.trim());
  //    } else if (key === 'metric') {
  //      const match = value.match(/^(\w+)\[(.+)\]$/);
  //      if (match) {
  //        result.metric = {
  //          aggregate: match[1].toUpperCase(),
  //          column: match[2].trim(),
  //        };
  //      }
  //    }
  //  });
  //
  //  return result;
  //};

  //const handleSubmit = async (values: { columns: string }) => {
  //  //const columnsInput = values.columns;
  //  const parsed = parsePrompt(values.columns);
  //  console.log('Parsed Prompt:', parsed);
  //
  //  if (!parsed.chart || !parsed.dimensions || !parsed.metric) {
  //    Modal.error({ title: 'Invalid prompt format!' });
  //    return;
  //  }
  //  const res = await fetch('/prompt_table/create_viz', {
  //    method: 'POST',
  //    headers: { 'Content-Type': 'application/json' },
  //    body: JSON.stringify({
  //      viz_type: parsed.chart,
  //      groupby: parsed.dimensions,
  //      metric: parsed.metric,
  //      dataset_id: formData.datasource.split('__')[0],
  //      dashboard_id: dashboardId,
  //    }),
  //  });
  //
  //  const json = await res.json();
  //  if (json.success) {
  //    Modal.success({
  //      title: `${parsed.chart} Table visualization added to the dashboard!`,
  //    });
  //    form.resetFields();
  //  }
  //};

  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      Modal.error({ title: 'Query is empty!' });
      return;
    }
    let chartName: string | null = null;
    let queryDescriptionLine = query.trim();

    if (query.includes('\n')) {
      const [firstLine, ...restLines] = query.split('\n');
      queryDescriptionLine = firstLine;

      for (const line of restLines) {
        const match = line.match(/(\w+)\s+(?=chart\b)/i);
        if (match) {
          chartName = match[1];
          break;
        }
      }
    }
    // Append only for PIE or BAR charts
    if (chartName && ['PIE', 'BAR'].includes(chartName.toUpperCase())) {
      queryDescriptionLine += ' Please use alias name for aggregate values.';
    }
    try {
      const res = await fetch('/api/v1/gemini_sql/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrf_token'),
        },
        credentials: 'include',
        body: JSON.stringify({
          queryDescription: queryDescriptionLine,
          dbId: databaseId,
          schemaName: schemaName,
        }),
      });

      const json = await res.json();
      if (json?.query) {
        Modal.success({
          title: `Query Generated${chartName ? ' for ' + chartName + ' chart' : ''}!`,
          content: <pre>{json.query}</pre>,
          width: 600,
          onOk: () => createDatasetFromQuery(json.query, chartName),
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

  const createDatasetFromQuery = async (sql: string, chartName?: string | null) => {
    try {
      const generateMeaningfulTableName = (prefix = 'prompt_dataset') => {
        const now = new Date();
        const date = now.toISOString().slice(0, 10).replace(/-/g, '_');
        const time = now.toTimeString().slice(0, 8).replace(/:/g, '_');
        return `${prefix}_${date}_${time}`;
      };

      const tableName = generateMeaningfulTableName();
      const payload = {
        database: databaseId,
        schema: schemaName,
        table_name: tableName,
        sql,
      };

      const response = await fetch('/api/v1/dataset/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrf_token'),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (!response.ok || !json?.id) {
        Modal.error({ title: 'Failed to create dataset', content: JSON.stringify(json) });
        return;
      }

      const datasetId = json.id;

      // Fetch dataset metadata
      const metadataRes = await fetch(`/api/v1/dataset/${datasetId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrf_token'),
        },
        credentials: 'include',
      });
      const metadataJson = await metadataRes.json();
      const columns = metadataJson.result.columns.map((col: any) => col.column_name);

      const upperChartName = chartName?.toUpperCase() ?? '';
      if (upperChartName === 'PIE') {
        let metricColumn = '';
        let metric;

        // Match the pattern: COUNT(something) AS "alias"
        const aggWithAliasMatch = sql.match(
          /(COUNT|SUM|AVG|MIN|MAX)\s*\(\s*([^)]+?)\s*\)\s+AS\s+["']?([^"'\n\r;]+)["']?/i
        );

        if (aggWithAliasMatch) {
          //const agg = aggWithAliasMatch[1].toUpperCase();   // e.g., COUNT
          //const col = aggWithAliasMatch[2].trim();           // e.g., uc.name
          const alias = aggWithAliasMatch[3].trim();         // e.g., Total Count

          metric = { aggregate: 'SUM', column: alias };
          metricColumn = alias;
        } else {
          Modal.error({ title: 'Could not determine metric from SQL' });
          return;
        }

        // Set all columns except the metric column as groupby
        const groupby = columns.filter((col: string) => col !== metricColumn);
        console.log('Group By:', groupby);
        console.log('Metric:', metric);
        const pieRes = await fetch('/api/v1/prompt_dataset_table/create_pie', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrf_token'),
          },
          credentials: 'include',
          body: JSON.stringify({
            dataset_id: datasetId,
            dashboard_id: dashboardId,
            groupby: groupby,
            metric: metric,
          }),
        });

        const pieJson = await pieRes.json();
        if (pieRes.ok && pieJson?.success) {
          Modal.success({
            title: 'Dataset and Pie Chart Created!',
            content: `Dataset "${tableName}" and a pie chart have been added to the dashboard.`,
          });
        } else {
          Modal.error({ title: 'Failed to create pie chart', content: JSON.stringify(pieJson) });
        }
      }
      else if (upperChartName === 'BAR') {
        let metricColumns: string[] = [];
        let groupColumn: string[] = [];

        // Try to find metric expressions with aliases: e.g., COUNT(col) AS "Total", SUM(sales) AS "Revenue"
        const metricMatches = [...sql.matchAll(/(COUNT|SUM|AVG|MIN|MAX)\s*\(([^)]+)\)\s+AS\s+["']?([^"'\n\r;]+)["']?/gi)];
        if (metricMatches.length === 0) {
          Modal.error({ title: 'Could not determine metrics from SQL' });
          return;
        }

        metricColumns = metricMatches.map(match => match[3].replace(/[,;]/g, '').trim());
        console.log('Metric Columns:', metricColumns);
        // Filter columns to get groupColumn (columns not in metricColumns)
        groupColumn = columns.filter((col: string) => !metricColumns.includes(col));

        if (groupColumn.length === 0) {
          Modal.error({ title: 'Could not determine group columns from SQL' });
          return;
        }

        const xAxisColumn = groupColumn[0];
        const groupby = groupColumn.slice(1); // All except xAxisColumn

        const metrics = metricColumns.map(name => ({
          aggregate: 'SUM', // or detect actual aggregate from match[1] if needed
          column: name,
        }));

        console.log('X Axis Column:', xAxisColumn);
        console.log('Group Columns:', groupColumn);
        console.log('Group By:', groupby);
        console.log('Metrics:', metrics);

        const barRes = await fetch('/api/v1/prompt_dataset_table/create_bar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrf_token'),
          },
          credentials: 'include',
          body: JSON.stringify({
            dataset_id: datasetId,
            dashboard_id: dashboardId,
            groupby: groupby,
            metrics: metrics,
            x_axis: xAxisColumn,
          }),
        });

        const barJson = await barRes.json();
        if (barRes.ok && barJson?.success) {
          Modal.success({
            title: 'Dataset and Bar Chart Created!',
            content: `Dataset "${tableName}" and a bar chart have been added to the dashboard.`,
          });
        } else {
          Modal.error({ title: 'Failed to create bar chart', content: JSON.stringify(barJson) });
        }
      }


      else {
        // Default: table chart
        const chartRes = await fetch('/api/v1/prompt_dataset_table/create_viz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrf_token'),
          },
          credentials: 'include',
          body: JSON.stringify({
            dataset_id: datasetId,
            dashboard_id: dashboardId,
            columns: columns,
          }),
        });

        const chartJson = await chartRes.json();
        if (chartRes.ok && chartJson?.success) {
          Modal.success({
            title: 'Dataset and Table Chart Created!',
            content: `Dataset "${tableName}" and a table visualization have been added to the dashboard.`,
          });
        } else {
          Modal.error({
            title: 'Dataset created, but failed to create table chart',
            content: JSON.stringify(chartJson),
          });
        }
      }
    } catch (error) {
      console.error('Error creating dataset or chart:', error);
      Modal.error({ title: 'Error creating dataset or chart' });
    }
  };




  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', height, width }}>
      <hr style={{ margin: '2em 0' }} />
      <Form layout="vertical">
        <Form.Item label="Write in Natural Language">
          <Input.TextArea
            rows={3}
            defaultValue={query}
            onBlur={e => setQuery(e.target.value)}
            placeholder="Show me the total sales by city and street, grouped by month."
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
