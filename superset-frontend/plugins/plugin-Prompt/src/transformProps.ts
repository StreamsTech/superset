/**
 * Licensed to the Apache Software Foundation (ASF)...
 */

import { ChartProps } from '@superset-ui/core';
import { PromptChartTransformedProps } from './types';

export default function transformProps(chartProps: ChartProps): PromptChartTransformedProps {
  const { width, height, datasource, formData } = chartProps;
  const {
    sliceId,
    dashboardId,
    databaseId,
    schemaName,
   
  } = formData;

  return {
    schemaName,
    databaseId,
    chartId: sliceId,
    dashboardId: dashboardId,
    height,
    width,
    formData: {
      ...formData,
      datasource_name: datasource?.name,
      schema: (datasource as any)?.schema, // Use type assertion if schema exists dynamically
      dbId: (datasource as any)?.database?.id, // Use type assertion to access database dynamically
    },
  };
}
