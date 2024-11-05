/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  ColorFormatters,
  getColorFormatters,
  Metric,
} from '@superset-ui/chart-controls';
import {
  GenericDataType,
  getMetricLabel,
  extractTimegrain,
  QueryFormData,
  getValueFormatter,
} from '@superset-ui/core';
import { BigNumberTotalChartProps, BigNumberVizProps } from '../types';
import { getDateFormatter, parseMetricValue } from '../utils';
import { Refs } from '../../types';
const maxChart= 20;

export default function transformProps(
  chartProps: BigNumberTotalChartProps,
): BigNumberVizProps {
  const {
    width,
    height,
    queriesData,
    formData,
    rawFormData,
    hooks,
    datasource: { currencyFormats = {}, columnFormats = {} },
  } = chartProps;
  const {
    headerFontSize,
    metric = 'value',
    subheader = '',
    icon='',
    subheaderFontSize,
    forceTimestampFormatting,
    timeFormat,
    yAxisFormat,
    conditionalFormatting,
    currencyFormat,
	  textColor,
    iconColor,
    iconBackgroundColor,
    subHeadTextColor,
    backgroundColor,
    textAlignment,
  } = formData;
  const refs: Refs = {};
  const { data = [], coltypes = [] } = queriesData[0];
  const granularity = extractTimegrain(rawFormData as QueryFormData);
  //const metricName = getMetricLabel(metric);
  const formattedSubheader = subheader;
  const bigNumber =
    data.length === 0 ? null :  parseMetricValue(data[0][queriesData[0].colnames[0]]);

	let bigNumberConfig = bigNumberConfigProvider(formData, queriesData[0]);
  let metricEntry: Metric | undefined;
  if (chartProps.datasource?.metrics) {
    metricEntry = chartProps.datasource.metrics.find(
      metricItem => metricItem.metric_name === metric,
    );
  }

  const formatTime = getDateFormatter(
    timeFormat,
    granularity,
    metricEntry?.d3format,
  );

  const numberFormatter = getValueFormatter(
    metric,
    currencyFormats,
    columnFormats,
    yAxisFormat,
    currencyFormat,
  );

  const headerFormatter =
    coltypes[0] === GenericDataType.TEMPORAL ||
    coltypes[0] === GenericDataType.STRING ||
    forceTimestampFormatting
      ? formatTime
      : numberFormatter;

  const { onContextMenu } = hooks;

  const defaultColorFormatters = [] as ColorFormatters;

  const colorThresholdFormatters =
    getColorFormatters(conditionalFormatting, data, false) ??
    defaultColorFormatters;

  return {
    width,
    height,
    bigNumber,
    headerFormatter,
    headerFontSize,
    subheaderFontSize,
    subheader: formattedSubheader,
    onContextMenu,
    refs,
    colorThresholdFormatters,
	  textColor,
    icon,
    iconColor,
    iconBackgroundColor,
    subHeadTextColor,
    backgroundColor,
    textAlignment,
	  bigNumberConfig,
    maxChart,
  };
}


function bigNumberConfigProvider(formData: any, queriesData: any) {
 const subHeaders = [];
 const backgroundColors = [];
 const textColors = [];
 const iconColors =[];
 const iconBackgroundColors = [];
 const subHeaderTextColors = [];
 const icons=[];



 // Loop through 1 to 10 to dynamically add values to arrays

 for (let i = 1; i <=  maxChart; i++) {

  subHeaders.push(formData[`subHeader${i}`]);

   backgroundColors.push(formData[`backgroundColor${i}`]);

   textColors.push(formData[`textColor${i}`]);
   icons.push(formData[`icon${i}`]);

   iconColors.push(formData[`iconColor${i}`]);

   iconBackgroundColors.push(formData[`iconBackgroundColor${i}`]);

   subHeaderTextColors.push(formData[`subHeaderTextColor${i}`]);

 }

  let bigNumberConfig = [];

  const columns = queriesData.colnames;

  

  if (queriesData.data) {

    for (let i = 0; i < columns.length; i++) {

      const key = columns[i];

      bigNumberConfig.push({

        subHeader: subHeaders[i] || '',
        
        icon: icons[i] || '',

        subHeaderTextColour: subHeaderTextColors[i] || '',

        bigNumberText: queriesData.data[0][key] || '',

        textColour: textColors[i] || '',
        
        iconColor: iconColors[i] || '',

        iconBackgroundColor: iconBackgroundColors[i] || '',

        backgoundColour: backgroundColors[i] || ''

      });

    }

  }



  return bigNumberConfig;

}


