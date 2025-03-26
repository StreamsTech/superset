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
import React from 'react';
import { ensureIsInt, t, validateNonEmpty } from '@superset-ui/core';
import {
  ControlPanelConfig,
  ControlPanelsContainerProps,
  ControlSubSectionHeader,
  D3_FORMAT_DOCS,
  D3_NUMBER_FORMAT_DESCRIPTION_VALUES_TEXT,
  D3_FORMAT_OPTIONS,
  D3_TIME_FORMAT_OPTIONS,
  sections,
  getStandardizedControls,
  Dataset,
} from '@superset-ui/chart-controls';
import { DEFAULT_FORM_DATA } from './types';
import { legendSection } from '../controls';

const {
  donut,
  highlight,
  innerRadius,
  labelsOutside,
  labelType,
  labelLine,
  outerRadius,
  numberFormat,
  showLabels,
} = DEFAULT_FORM_DATA;

const config: ControlPanelConfig = {
  controlPanelSections: [
    sections.legacyRegularTime,
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['groupby'],
        ['metric'],
        ['adhoc_filters'],
        ['row_limit'],
        [
          {
            name: 'sort_by_metric',
            config: {
              default: true,
              type: 'CheckboxControl',
              label: t('Sort by metric'),
              description: t(
                'Whether to sort results by the selected metric in descending order.',
              ),
            },
          },
        ],
      ],
    },
    {
      label: t('Chart Options'),
      expanded: true,
      controlSetRows: [
        ['color_scheme'],
        [
          {
            name: 'show_labels_threshold',
            config: {
              type: 'TextControl',
              label: t('Percentage threshold'),
              renderTrigger: true,
              isFloat: true,
              default: 5,
              description: t(
                'Minimum threshold in percentage points for showing labels.',
              ),
            },
          },
        ],
        ...legendSection,
        // eslint-disable-next-line react/jsx-key
        [<ControlSubSectionHeader>{t('Labels')}</ControlSubSectionHeader>],
        [
          {
            name: 'label_type',
            config: {
              type: 'SelectControl',
              label: t('Label Type'),
              default: labelType,
              renderTrigger: true,
              choices: [
                ['key', t('Category Name')],
                ['value', t('Value')],
                ['percent', t('Percentage')],
                ['key_value', t('Category and Value')],
                ['key_percent', t('Category and Percentage')],
                ['key_value_percent', t('Category, Value and Percentage')],
              ],
              description: t('What should be shown on the label?'),
            },
          },
        ],
        [
          {
            name: 'number_format',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: t('Number format'),
              renderTrigger: true,
              default: numberFormat,
              choices: D3_FORMAT_OPTIONS,
              description: `${D3_FORMAT_DOCS} ${D3_NUMBER_FORMAT_DESCRIPTION_VALUES_TEXT}`,
              tokenSeparators: ['\n', '\t', ';'],
            },
          },
        ],
        ['currency_format'],
        [
          {
            name: 'date_format',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: t('Date format'),
              renderTrigger: true,
              choices: D3_TIME_FORMAT_OPTIONS,
              default: 'smart_date',
              description: D3_FORMAT_DOCS,
            },
          },
        ],
        [
          {
            name: 'show_labels',
            config: {
              type: 'CheckboxControl',
              label: t('Show Labels'),
              renderTrigger: true,
              default: showLabels,
              description: t('Whether to display the labels.'),
            },
          },
        ],
        [
          {
            name: 'labels_outside',
            config: {
              type: 'CheckboxControl',
              label: t('Put labels outside'),
              default: labelsOutside,
              renderTrigger: true,
              description: t('Put the labels outside of the pie?'),
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                Boolean(controls?.show_labels?.value),
            },
          },
        ],
        [
          {
            name: 'label_line',
            config: {
              type: 'CheckboxControl',
              label: t('Label Line'),
              default: labelLine,
              renderTrigger: true,
              description: t(
                'Draw line from Pie to label when labels outside?',
              ),
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                Boolean(controls?.show_labels?.value),
            },
          },
        ],
        [
          {
            name: 'show_total',
            config: {
              type: 'CheckboxControl',
              label: t('Show Total'),
              default: false,
              renderTrigger: true,
              description: t('Whether to display the aggregate count'),
            },
          },
        ],
        [
          {
            name: 'show_table',
            config: {
              type: 'CheckboxControl',
              label: t('Show Table'),
              default: false,
              renderTrigger: true,
              description: t('Whether to display the Pie Table'),
            },
          },
        ],
        // eslint-disable-next-line react/jsx-key
        [<ControlSubSectionHeader>{t('Pie shape')}</ControlSubSectionHeader>],
        [
          {
            name: 'outerRadius',
            config: {
              type: 'SliderControl',
              label: t('Outer Radius'),
              renderTrigger: true,
              min: 10,
              max: 100,
              step: 1,
              default: outerRadius,
              description: t('Outer edge of Pie chart'),
            },
          },
        ],
        [
          {
            name: 'donut',
            config: {
              type: 'CheckboxControl',
              label: t('Donut'),
              default: donut,
              renderTrigger: true,
              description: t('Do you want a donut or a pie?'),
            },
          },
        ],
        [
          {
            name: 'innerRadius',
            config: {
              type: 'SliderControl',
              label: t('Inner Radius'),
              renderTrigger: true,
              min: 0,
              max: 100,
              step: 1,
              default: innerRadius,
              description: t('Inner radius of donut hole'),
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                Boolean(controls?.donut?.value),
            },
          },
        ],
        [
          {
            name: 'highlight',
            config: {
              type: 'CheckboxControl',
              label: t('Highlight a Value'),
              default:  highlight,
              renderTrigger: true,
              description: t('Do you want to highlight a value in the pie?'),
            },
          },
        ],
        [
          {
            name: 'selectHighlight',
            config: {
              type: 'SelectControl',
              label: t('Select the Value to Highlight'),
              default: "",
              freeForm: true,
              renderTrigger: true,
              shouldMapStateToProps() {
                return true;
              },
              
              mapStateToProps: (explore, _, chart) => {
                const data = chart?.queriesResponse?.[0]?.data || [];
                const groupBy = explore?.form_data?.groupby || [];
                
                // Convert column options to the required structure
                const columnOptions = Array.isArray(data) && data.length > 0
                  ? data.map((item: any) => {
                      const key = groupBy.map((key: string) => {
                        const columnValue = item?.[key];
                        return columnValue === null || columnValue === undefined ? "<NULL>" : columnValue;
                      }).join(", ");
                      return [String(key), t(key)];
                    })
                  : [];
                
                //console.log("columnOptionsOK", columnOptions);
                return {
                  verboseMap: explore?.datasource?.hasOwnProperty('verbose_map')
                    ? (explore?.datasource as Dataset)?.verbose_map
                    : explore?.datasource?.columns ?? {},
                  choices: columnOptions, // The choices are now correctly formatted
                  removeIrrelevantConditions: chart?.chartStatus === 'success',
                };
              },
              
              description: t('What should be shown on the label?'),
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                Boolean(controls?.highlight?.value),
            },
          },
        ]
        ,        
        [
          {
            name: 'column_color_formatting',
            config: {
              type: 'ColumnColorFormatingControl',
              renderTrigger: true,
              label: t('Slice Color formatting'),
              description: t(
                'Apply conditional color formatting to numeric columns',
              ),
              shouldMapStateToProps() {
                return true;
              },
              mapStateToProps(explore, _, chart) {
                const verboseMap = explore?.datasource?.hasOwnProperty(
                  'verbose_map',
                )
                  ? (explore?.datasource as Dataset)?.verbose_map
                  : explore?.datasource?.columns ?? {};
                const chartStatus = chart?.chartStatus;
                const {coltypes } =
                  chart?.queriesResponse?.[0] ?? {};
                let groupBy = explore?.form_data?.groupby;
                const ColumnValue = chart?.queriesResponse?.[0].data?.map((item: string) => {
                  const value = groupBy?.map((key : string) => {
                    const columnValue = item[key];
                    return columnValue === null || columnValue === undefined ? "<NULL>" : columnValue;
                  }).join(", ");
                  return {
                      value: value,
                      label: value
                  };
                });
              
                const numericColumns =
                  Array.isArray(ColumnValue) && Array.isArray(coltypes)
                    ? ColumnValue
                        // .filter(
                        //   (colname: string, index: number) =>
                        //     coltypes[index] === GenericDataType.STRING,
                        // )
                        .map(colname => ({
                          value: colname.value,
                          label: colname.label,
                        }))
                    : [];
                return {
                  removeIrrelevantConditions: chartStatus === 'success',
                  columnOptions: numericColumns,
                  verboseMap,
                };
              },
            },
          },
        ],
      ],
    },
  ],
  controlOverrides: {
    series: {
      validators: [validateNonEmpty],
      clearable: false,
    },
    row_limit: {
      default: 100,
    },
  },
  formDataOverrides: formData => ({
    ...formData,
    metric: getStandardizedControls().shiftMetric(),
    groupby: getStandardizedControls().popAllColumns(),
    row_limit:
      ensureIsInt(formData.row_limit, 100) >= 100 ? 100 : formData.row_limit,
  }),
};

export default config;
