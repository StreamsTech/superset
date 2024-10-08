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
import emotionStyled from '@emotion/styled';
import { useTheme as useThemeBasic } from '@emotion/react';
import createCache from '@emotion/cache';

export {
  css,
  keyframes,
  jsx,
  ThemeProvider,
  CacheProvider as EmotionCacheProvider,
  withTheme,
} from '@emotion/react';
export { default as createEmotionCache } from '@emotion/cache';

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends SupersetTheme {}
}

export function useTheme() {
  const theme = useThemeBasic();
  // in the case there is no theme, useTheme returns an empty object
  if (Object.keys(theme).length === 0 && theme.constructor === Object) {
    throw new Error(
      'useTheme() could not find a ThemeContext. The <ThemeProvider/> component is likely missing from the app.',
    );
  }
  return theme;
}

export const emotionCache = createCache({
  key: 'superset',
});

export const styled = emotionStyled;

const defaultTheme = {
  borderRadius: 4,
  colors: {
    text: {
      label: '#8B6F59', // Grayish brown for text labels
      help: '#A3927B',  // Light grayish brown for help text
    },
    primary: {
      base: '#7BCE7A',  // Light green base
      dark1: '#5FA75C', // Darker green
      dark2: '#407F3F', // Even darker green
      light1: '#9EE49F', // Lighter green
      light2: '#BDEDBB', // Very light green
      light3: '#DFF6DC', // Softest green
      light4: '#EFFBF0', // Pale green
      light5: '#F5FCF7', // Almost white green
    },
    secondary: {
      base: '#FFA500',  // Orange base
      dark1: '#CC8400', // Darker orange
      dark2: '#995F00', // Even darker orange
      dark3: '#663F00', // Deepest orange
      light1: '#FFB733', // Lighter orange
      light2: '#FFCA66', // Light orange
      light3: '#FFDD99', // Pale orange
      light4: '#FFE6CC', // Very light orange
      light5: '#FFF2E6', // Almost white orange
    },
    grayscale: {
      base: '#8C6848',  // Grayish orange
      dark1: '#704F37', // Darker grayish orange
      dark2: '#4A3425', // Even darker grayish orange
      light1: '#B48F6A', // Lighter grayish orange
      light2: '#CCAE92', // Light orange-gray
      light3: '#E5D3B6', // Pale grayish orange
      light4: '#F2E5CC', // Very pale orange-gray
      light5: '#FAF1E6', // Almost white
    },
    error: {
      base: '#E74C3C',  // Red for errors
      dark1: '#C0392B',
      dark2: '#A93226',
      light1: '#F1948A',
      light2: '#FDEDEC',
    },
    warning: {
      base: '#E67E22',  // Orange for warnings
      dark1: '#D35400',
      dark2: '#A04000',
      light1: '#F5B041',
      light2: '#FDF2E9',
    },
    alert: {
      base: '#F1C40F',  // Yellow for alerts
      dark1: '#D4AC0D',
      dark2: '#B7950B',
      light1: '#F9E79F',
      light2: '#FEF9E6',
    },
    success: {
      base: '#27AE60',  // Green for success
      dark1: '#229954',
      dark2: '#1E8449',
      light1: '#82E0AA',
      light2: '#EAF2F8',
    },
    info: {
      base: '#3498DB',  // Blue for informational messages
      dark1: '#2980B9',
      dark2: '#2471A3',
      light1: '#85C1E9',
      light2: '#EBF5FB',
    },
    
    text2: {
      label: '#879399',
      help: '#737373',
    },
    primary2: {
      base: '#20A7C9',
      dark1: '#1A85A0',
      dark2: '#156378',
      light1: '#79CADE',
      light2: '#A5DAE9',
      light3: '#D2EDF4',
      light4: '#E9F6F9',
      light5: '#F3F8FA',
    },
    secondary2: {
      base: '#444E7C',
      dark1: '#363E63',
      dark2: '#282E4A',
      dark3: '#1B1F31',
      light1: '#8E94B0',
      light2: '#B4B8CA',
      light3: '#D9DBE4',
      light4: '#ECEEF2',
      light5: '#F5F5F8',
    },
    grayscale2: {
      base: '#666666',
      dark1: '#323232',
      dark2: '#000000',
      light1: '#B2B2B2',
      light2: '#E0E0E0',
      light3: '#F0F0F0',
      light4: '#F7F7F7',
      light5: '#FFFFFF',
    },
    error2: {
      base: '#E04355',
      dark1: '#A7323F',
      dark2: '#6F212A',
      light1: '#EFA1AA',
      light2: '#FAEDEE',
    },
    warning2: {
      base: '#FF7F44',
      dark1: '#BF5E33',
      dark2: '#7F3F21',
      light1: '#FEC0A1',
      light2: '#FFF2EC',
    },
    alert2: {
      base: '#FCC700',
      dark1: '#BC9501',
      dark2: '#7D6300',
      light1: '#FDE380',
      light2: '#FEF9E6',
    },
    success2: {
      base: '#5AC189',
      dark1: '#439066',
      dark2: '#2B6144',
      light1: '#ACE1C4',
      light2: '#EEF8F3',
    },
    info2: {
      base: '#66BCFE',
      dark1: '#4D8CBE',
      dark2: '#315E7E',
      light1: '#B3DEFE',
      light2: '#EFF8FE',
    },
  },
  opacity: {
    light: '10%',
    mediumLight: '35%',
    mediumHeavy: '60%',
    heavy: '80%',
  },
  typography: {
    families: {
      sansSerif: `'Inter', Helvetica, Arial`,
      serif: `Georgia, 'Times New Roman', Times, serif`,
      monospace: `'Fira Code', 'Courier New', monospace`,
    },
    weights: {
      light: 200,
      normal: 400,
      medium: 500,
      bold: 600,
    },
    sizes: {
      xxs: 9,
      xs: 10,
      s: 12,
      m: 14,
      l: 16,
      xl: 21,
      xxl: 28,
    },
  },
  zIndex: {
    aboveDashboardCharts: 10,
    dropdown: 11,
    max: 3000,
  },
  transitionTiming: 0.3,
  gridUnit: 4,
  brandIconMaxWidth: 37,
};

export type SupersetTheme = typeof defaultTheme;

export interface SupersetThemeProps {
  theme: SupersetTheme;
}

export const supersetTheme = defaultTheme;
