// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import { IStackItemStyles, Stack } from '@fluentui/react';
import { Header } from './Header';

export const Page = (props: {children: React.ReactNode; headerChildren?: React.ReactNode}): JSX.Element => {
  return (
    <Stack verticalFill>
      <Stack.Item styles={headerStyles}>
        <Header>{props.headerChildren}</Header>
      </Stack.Item>
      <Stack.Item styles={bodyStyles}>
        <Stack verticalFill verticalAlign='center' horizontalAlign='center'>
          {props.children}
        </Stack>
      </Stack.Item>
    </Stack>
  );
};

const headerStyles: IStackItemStyles = {
  root: {
    height: '3rem'
  }
};

const bodyStyles: IStackItemStyles = {
  root: {
    height: 'calc(100vh - 3rem)'
  }
};