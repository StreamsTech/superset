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
import {
  t, //validateNonEmpty,
  ensureIsArray,
  QueryFormColumn,
  QueryMode,
} from '@superset-ui/core';
import {
  sharedControls,
  ColumnOption,
  ControlStateMapping,
  ColumnMeta,
  ControlPanelConfig,
  //ControlSubSectionHeader,
  //D3_FORMAT_DOCS,
  //D3_FORMAT_OPTIONS,
  //D3_TIME_FORMAT_OPTIONS,
  getStandardizedControls,
  sections,
} from '@superset-ui/chart-controls';
//import OptionDescription from './OptionDescription';
function getQueryMode(controls: ControlStateMapping): QueryMode {
  const mode = controls?.query_mode?.value;
  if (mode === QueryMode.aggregate || mode === QueryMode.raw) {
    return mode as QueryMode;
  }
  const rawColumns = controls?.all_columns?.value as
    | QueryFormColumn[]
    | undefined;
  const hasRawColumns = rawColumns && rawColumns.length > 0;
  return hasRawColumns ? QueryMode.raw : QueryMode.aggregate;
}

const allColumnsControl: typeof sharedControls.groupby = {
  ...sharedControls.groupby,
  label: t('Columns'),
  description: t('Columns to display'),
  multi: true,
  freeForm: true,
  allowAll: true,
  commaChoosesOption: false,
  optionRenderer: (c: ColumnMeta) => <ColumnOption showType column={c} />,
  valueRenderer: (c: ColumnMeta) => <ColumnOption column={c} />,
  valueKey: 'column_name',
  mapStateToProps: ({ datasource, controls }, controlState) => ({
    options: datasource?.columns || [],
    queryMode: getQueryMode(controls),
    externalValidationErrors:
     ensureIsArray(controlState?.value).length === 0
        ? [t('must have a value')]
        : [],
  }),
  resetOnHide: false,
};

const config: ControlPanelConfig = {
  controlPanelSections: [
    sections.legacyRegularTime,
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'all_columns',
            config: allColumnsControl,
          },
        ],
        [
          {
            name: 'metrics',
            config: {
              ...sharedControls.metrics,
              hidden: true,
              //default: ['count'], // Force default
            },
          },
        ],
 
      ],
    },
  ],
  formDataOverrides: formData => ({
    ...formData,
    groupby: getStandardizedControls().popAllColumns(),
    metrics: ['count'], 
  }),
};

export default config;
