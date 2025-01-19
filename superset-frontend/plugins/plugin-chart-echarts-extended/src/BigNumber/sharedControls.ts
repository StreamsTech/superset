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

// These are control configurations that are shared ONLY within the BigNumberWithTrendline viz plugin repo.
import { t } from '@superset-ui/core';
import { CustomControlItem } from '@superset-ui/chart-controls';

export const headerFontSize: CustomControlItem = {
  name: 'header_font_size',
  config: {
    type: 'SelectControl',
    label: t('Big Number Font Size'),
    renderTrigger: true,
    clearable: false,
    default: 0.4,
    // Values represent the percentage of space a header should take
    options: [
      {
        label: t('Tiny'),
        value: 0.2,
      },
      {
        label: t('Small'),
        value: 0.3,
      },
      {
        label: t('Normal'),
        value: 0.4,
      },
      {
        label: t('Large'),
        value: 0.5,
      },
      {
        label: t('Huge'),
        value: 0.6,
      },
    ],
  },
};

export const subheaderFontSize: CustomControlItem = {
  name: 'subheader_font_size',
  config: {
    type: 'SelectControl',
    label: t('Subheader Font Size'),
    renderTrigger: true,
    clearable: false,
    default: 0.15,
    // Values represent the percentage of space a subheader should take
    options: [
      {
        label: t('Tiny'),
        value: 0.125,
      },
      {
        label: t('Small'),
        value: 0.15,
      },
      {
        label: t('Normal'),
        value: 0.2,
      },
      {
        label: t('Large'),
        value: 0.3,
      },
      {
        label: t('Huge'),
        value: 0.4,
      },
    ],
  },
};

export const textColor: CustomControlItem = {
  name: 'text_color',
  config: {
    type: 'SelectControl',
    label: t('Change Text Color'),
    renderTrigger: true,
    clearable: false,
    default: 'black',
    // Values represent the percentage of space a subheader should take
    options: [
      {
        label: t('Black'),
        value: 'black',
      },
      {
        label: t('White'),
        value: 'white',
      },
      {
        label: t('Blue'),
        value: '#4287f5',
      },
      {
        label: t('Pink'),
        value: '#f54298',
      },
      {
        label: t('Yellow'),
        value: '#eff542',
      },
      {
        label: t('Red'),
        value: '#f54245',
      },
      {
        label: t('Violet'),
        value: '#e642f5',
      },
    ],
  },
};

export const subHeadTextColor: CustomControlItem = {
  name: 'sub_head_text_color',
  config: {
    type: 'SelectControl',
    label: t('Change Sub Head Text Color'),
    renderTrigger: true,
    clearable: false,
    default: 'black',
    // Values represent the percentage of space a subheader should take
    options: [
      {
        label: t('Black'),
        value: 'black',
      },
      {
        label: t('White'),
        value: 'white',
      },
      {
        label: t('Blue'),
        value: '#4287f5',
      },
      {
        label: t('Pink'),
        value: '#f54298',
      },
      {
        label: t('Yellow'),
        value: '#eff542',
      },
      {
        label: t('Red'),
        value: '#f54245',
      },
      {
        label: t('Violet'),
        value: '#e642f5',
      },
    ],
  },
};
export const backgroundColor: CustomControlItem = {
  name: 'background_Color',
  config: {
    type: 'SelectControl',
    label: t('Change Background Color'),
    renderTrigger: true,
    clearable: false,
    default: 'white',
    // Values represent the percentage of space a subheader should take
    options: [
      {
        label: t('Black'),
        value: 'black',
      },
      {
        label: t('White'),
        value: 'white',
      },
      {
        label: t('Blue'),
        value: '#4287f5',
      },
      {
        label: t('Pink'),
        value: '#f54298',
      },
      {
        label: t('Yellow'),
        value: '#eff542',
      },
      {
        label: t('Red'),
        value: '#f54245',
      },
      {
        label: t('Violet'),
        value: '#e642f5',
      },
    ],
  },
};

export const textAlignment: CustomControlItem = {
  name: 'text_alignment',
  config: {
    type: 'SelectControl',
    label: t('text_alignmen'),
    renderTrigger: true,
    clearable: false,
    default: 'flex-start',
    options: [
      {
        label: t('Left'),
        value: 'flex-start',
      },
      {
        label: t('Center'),
        value: 'center',
      },
      {
        label: t('Right'),
        value: 'flex-end',
      },
    ],
  },
};

export const cardDisplay: CustomControlItem = {
  name: 'card_display',
  config: {
    type: 'SelectControl',
    label: t('Display Multiple Cards'),
    renderTrigger: true,
    clearable: false,
    default: 'column',
    options: [
      {
        label: t('Top-Down'),
        value: 'column',
      },
      {
        label: t('Left-Right'),
        value: 'row',
      },
    ],
  },
};