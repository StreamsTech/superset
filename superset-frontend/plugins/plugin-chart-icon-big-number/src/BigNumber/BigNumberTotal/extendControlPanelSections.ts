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

export const generateIconControls = (count: number) => {
  const controls = [];
  for (let i = 1; i <= count; i++) {
    controls.push([
      {
        name: 'icon_'+ i,
        config: {
          type: 'TextControl',
          label: t(`icon_`+ i),
          renderTrigger: true,
          description: t(`Enter the FontAwesome icon class`),
        },
      },
    ]);
  }
  return controls;
};

export const backgroundColorControl = (count : number) =>{
  const controls = [];
  for (let i = 1; i <= count; i++) {
    controls.push([{
      name: 'background_color_'+ i,
      config: {
      type: 'TextControl',
      label: t(`background_color_` + i),
      renderTrigger: true,
      clearable: false,
      default: 'white',
      // Values represent the percentage of space a subheader should take
    },
  }])
 }
return controls;
}

export const iconBackgroundColorControl = (count : number) =>{
  const controls = [];
  for (let i = 1; i <= count; i++) {
    controls.push([{
      name: 'icon_background_color_'+ i,
      config: {
      type: 'TextControl',
      label: t(`icon_background_color_` + i),
      renderTrigger: true,
      clearable: true,
      default: 'transparent',
      // Values represent the percentage of space a subheader should take
    },
  }])
 }
return controls;
}

// subHeadTextColor

export const subHeadTextColorControl = ( textPortion: string , count : number) =>{
  const controls = [];
  for (let i = 1; i <= count; i++) {
    controls.push([{
      name: textPortion + i,
      config: {
      type: 'TextControl',
      label: t(textPortion + i),
      renderTrigger: true,
      clearable: false,
      default: 'black',
      // Values represent the percentage of space a subheader should take
    },
  }])
 }
  return controls;
}

