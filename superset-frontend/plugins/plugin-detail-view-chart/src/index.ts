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
import { Behavior, ChartMetadata, ChartPlugin, t } from '@superset-ui/core';
import transformProps from './transformProps';
import thumbnail from './images/DetailViewMain.png';
import example1 from './images/options.png';
import example2 from './images/option2.png';
import example3 from './images/option3.png';
import controlPanel from './controlPanel';
import buildQuery from './buildQuery';
import { TableChartFormData, TableChartProps } from './types';

// must export something for the module to be exist in dev mode
export { default as __hack__ } from './types';
export * from './types';

const metadata = new ChartMetadata({
  behaviors: [
    Behavior.INTERACTIVE_CHART,
    Behavior.DRILL_TO_DETAIL,
    Behavior.DRILL_BY,
  ],
  category: t('Table'),
  canBeAnnotationTypes: ['EVENT', 'INTERVAL'],
  description: t(
    'A detailed, customizable record view chart where users can select specific columns to display and define the number of sections for organizing data. Users can switch between grid and non-grid views, and URLs can be added to any column for enhanced interaction.',
  ),
  exampleGallery: [{ url: example1 }, { url: example2 }, { url: example3 }],
  name: t('Detail View Chart'),
  tags: [
    t('Additive'),
    t('Business'),
    t('Pattern'),
    t('Popular'),
    t('Report'),
    t('Sequential'),
    t('Tabular'),
    t('Description'),
  ],
  thumbnail,
});

export default class DetailViewChart extends ChartPlugin<
  TableChartFormData,
  TableChartProps
> {
  constructor() {
    super({
      loadChart: () => import('./TableChart'),
      metadata,
      transformProps,
      controlPanel,
      buildQuery,
    });
  }
}
