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
import thumbnail from './images/GeoNode.png';
import example1 from './images/GeoNode.png';
import controlPanel from './controlPanel';
import buildQuery from './buildQuery';

// must export something for the module to be exist in dev mode
export { default as __hack__ } from './types';
export * from './types';

const metadata = new ChartMetadata({
  behaviors: [
    Behavior.INTERACTIVE_CHART,
    Behavior.DRILL_TO_DETAIL,
    Behavior.DRILL_BY,
  ],
  category: t('Map'),
  canBeAnnotationTypes: ['EVENT', 'INTERVAL'],
  description: t(
    'This chart directly embeds spatial charts from GeoNode, a web-based platform for developing geospatial information systems (GIS) and deploying spatial data infrastructures (SDI).',
  ),
  exampleGallery: [{ url: example1 }],
  name: t('GeoNode'),
  tags: [
    t('Geo'),
    t('Business'),
    t('Pattern'),
    t('Popular'),
    t('Report'),
    t('Sequential'),
    t('Description'),
  ],
  thumbnail,
});

export default class GeoNode extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('./GeoNode'),
      metadata,
      transformProps,
      controlPanel,
      buildQuery,
    });
  }
}
