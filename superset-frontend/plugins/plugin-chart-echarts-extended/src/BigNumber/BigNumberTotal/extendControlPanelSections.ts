import { t } from '@superset-ui/core';

// externalConfig.js
export const generateTextControls = (count: number) => {
  const controls = [];
  for (let i = 1; i <= count; i++) {
    controls.push([
      {
        name: 'subHeader_'+ i,
        config: {
          type: 'TextControl',
          label: t(`subHeader_`+ i),
          renderTrigger: true,
          description: t(`Description text that shows up below your Big Number`),
        },
      },
    ]);
  }
  return controls;
};


export const backgroundColorControl = (count : number) =>{
  const controls = [];
  for (let i = 1; i <= count; i++) {
    controls.push([
      {
        name: 'background_color_'+ i,
        config: {
          type: 'TextControl',
          label: t(`background_color_`+ i),
          renderTrigger: true,
          description: t(`Description text that shows up below your Big Number`),
        },
      },
    ]);
  }
  return controls;
}


export const subHeadTextColorControl = ( textPortion: string , count : number) =>{
  const controls = [];
  for (let i = 1; i <= count; i++) {

    controls.push([
      {
        name: textPortion + i,
        config: {
          type: 'TextControl',
          label: t(textPortion + i),
          renderTrigger: true,
          description: t(`Description text that shows up below your Big Number`),
        },
      },
    ]);
  }
  return controls;
}

