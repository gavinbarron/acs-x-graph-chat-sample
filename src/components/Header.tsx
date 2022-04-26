// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { useMemo } from 'react';
import { Login } from '@microsoft/mgt-react';
import { IStackStyles, Stack, ITheme } from '@fluentui/react';
import { useTheme } from '@azure/communication-react';

export const Header = (props: {children?: React.ReactNode}): JSX.Element => {
  const theme = useTheme();
  const headerContainerStyles = useMemo(() => quickHeaderStyles(theme), [theme]);
  return (
    <Stack styles={headerContainerStyles} horizontal horizontalAlign="end" verticalAlign="center">
      <Stack.Item>
        {props.children}
      </Stack.Item>
      <Stack.Item>{<Login />}</Stack.Item>
    </Stack>
  );
};

const quickHeaderStyles: (theme: ITheme) => IStackStyles = (theme) => ({
  root: {
    width: '100vw',
    height: '3rem',
    background: theme.palette.neutralLighter,
    paddingLeft: '2rem',
    paddingRight: '2rem'
  }
});
