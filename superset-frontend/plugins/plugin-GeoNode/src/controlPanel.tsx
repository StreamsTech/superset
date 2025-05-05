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
import { ControlPanelConfig, getStandardizedControls, sharedControls} from '@superset-ui/chart-controls';


const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Embedded Code Input'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'embed_code',
            config: {
              type: 'TextControl',
              label: t('Embedded Code'),
              description: t('Paste only the src value of the embedded iframe or script code here'),
              default: '',
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'geonode_map',
            config: {
              type: 'SelectAsyncControl',
              label: t('GeoNode Map'),
              default: null,
              description: t('Select a map from GeoNode'),
              multi: false,
              freeForm: false,
              clearable: true,
              placeholder: t('Select a map'),
              onAsyncErrorMessage: t('Failed to fetch maps from GeoNode'),
        
              // Replace with a proxy endpoint or CORS-safe API
              dataEndpoint:'/api/geonode/maps',
        
              // Converts API response into { value, label } format
              mutator: (data: { objects: any; }) =>
                (data.objects || []).map((item: any) => ({
                  value: String(item.id),
                  label: String(item.title),
                })),
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
