/* eslint-disable camelcase */
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

import { t } from '@superset-ui/core';
import { ControlPanelConfig, getStandardizedControls, sharedControls, ControlPanelsContainerProps } from '@superset-ui/chart-controls';


const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Data Source Settings'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'database_id',
            config: {
              type: 'SelectAsyncControl',
              label: t('Database'),
              default: null,
              description: t('Select a database'),
              multi: false,
              freeForm: false,
              clearable: true,
              placeholder: t('Select a database'),
              onAsyncErrorMessage: t('Failed to fetch databases'),
              dataEndpoint: '/api/v1/database/',
              mutator: (data: any) =>
                (data.result || []).map((item: any) => ({
                  value: item.id,
                  label: item.database_name,
                })),
            },
          },
        ],
        [
          {
            name: 'schema_name',
            config: {
              type: 'SelectAsyncControl',
              label: t('Schema'),
              default: null,
              description: t('Select schema based on selected database'),
              multi: false,
              clearable: true,
              freeForm: false,
              placeholder: t('Select a schema'),

              // Make sure this matches the control name of your DB dropdown
              dependencies: ['database_id'],
              shouldMapStateToProps: () => true,

              mapStateToProps: state => {
                const databaseId = state?.controls?.database_id?.value;
                return {
                  databaseId,
                  dataEndpoint: databaseId ? `/api/v1/database/${databaseId}/schemas/` : undefined,
                };
              },



              mutator: (data: any) =>
                (data.result || []).map((schema: string) => ({
                  value: schema,
                  label: schema,
                })),

              onAsyncErrorMessage: t('Failed to fetch schemas'),

              visibility: ({ controls }: ControlPanelsContainerProps) =>
                Boolean(controls?.database_id?.value),
            },
          }

        ],
        [
          {
            name: 'metrics',
            config: {
              ...sharedControls.metrics,
              validators: [],
              hidden: true,
            },
          },
        ],
      ],
    },
  ],
  formDataOverrides: formData => ({
    ...formData,
    metrics: getStandardizedControls().popAllMetrics(),
    groupby: getStandardizedControls().popAllColumns(),
  }),
};

export default config;
