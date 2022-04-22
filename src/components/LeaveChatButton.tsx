// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import { concatStyleSets, DefaultButton, IButtonProps, Theme, } from '@fluentui/react';
import { darkTheme, lightTheme, useTheme } from '@azure/communication-react';

export const LeaveChatButton = (props: IButtonProps): JSX.Element => {
  const theme = useTheme();
  const isDarkTheme = isDarkThemed(theme);
  const componentStyles = concatStyleSets(
    isDarkTheme ? darkThemeCallButtonStyles : lightThemeCallButtonStyles,
    props.styles ?? {}
  );

  return <DefaultButton {...props} styles={componentStyles}>Leave Chat</DefaultButton>;
}

const isDarkThemed = (theme: Theme): boolean => {
  const themeBlackBrightness = getPerceptualBrightnessOfHexColor(theme.palette.black);
  const themeWhiteBrightness = getPerceptualBrightnessOfHexColor(theme.palette.white);
  if (Number.isNaN(themeBlackBrightness) || Number.isNaN(themeWhiteBrightness)) {
    return false;
  }
  return themeBlackBrightness > themeWhiteBrightness;
};

const getPerceptualBrightnessOfHexColor = (hexColor: string): number => {
  // return NaN if hexColor is not a hex code
  if (!/^#[0-9A-Fa-f]{6}$/i.test(hexColor)) {
    return NaN;
  }
  const r = parseInt(hexColor.substring(1, 3), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);

  // arithmetic mean μ of the red, green, and blue color coordinates. Source: https://en.wikipedia.org/wiki/Brightness
  return (r + g + b) / 3;
};

// using media query to prevent windows from overwriting the button color
const darkThemeCallButtonStyles = {
  root: {
    color: darkTheme.callingPalette.iconWhite,
    background: darkTheme.callingPalette.callRed,
    '@media (forced-colors: active)': {
      forcedColorAdjust: 'none'
    },
    ':focus::after': { outlineColor: `${darkTheme.callingPalette.iconWhite} !important` } // added !important to avoid override by FluentUI button styles
  },
  rootHovered: {
    color: darkTheme.callingPalette.iconWhite,
    background: darkTheme.callingPalette.callRed,
    '@media (forced-colors: active)': {
      forcedColorAdjust: 'none'
    }
  },
  rootPressed: {
    color: darkTheme.callingPalette.iconWhite,
    background: darkTheme.callingPalette.callRed,
    '@media (forced-colors: active)': {
      forcedColorAdjust: 'none'
    }
  },
  label: {
    color: darkTheme.callingPalette.iconWhite
  }
};

const lightThemeCallButtonStyles = {
  root: {
    color: lightTheme.callingPalette.iconWhite,
    background: lightTheme.callingPalette.callRed,
    '@media (forced-colors: active)': {
      forcedColorAdjust: 'none'
    },
    ':focus::after': { outlineColor: `${lightTheme.callingPalette.iconWhite} !important` } // added !important to avoid override by FluentUI button styles
  },
  rootHovered: {
    color: lightTheme.callingPalette.iconWhite,
    background: lightTheme.callingPalette.callRed,
    '@media (forced-colors: active)': {
      forcedColorAdjust: 'none'
    }
  },
  rootPressed: {
    color: lightTheme.callingPalette.iconWhite,
    background: lightTheme.callingPalette.callRed,
    '@media (forced-colors: active)': {
      forcedColorAdjust: 'none'
    }
  },
  label: {
    color: lightTheme.callingPalette.iconWhite
  }
};
