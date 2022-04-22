// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import { Stack } from '@fluentui/react';
import { Header } from './Header';

export const Page = (props: {children: React.ReactNode; headerChildren?: React.ReactNode}): JSX.Element => {
  return (
    <Stack verticalFill>
      <Stack.Item>
        <Header>{props.headerChildren}</Header>
      </Stack.Item>
      <Stack.Item grow>
        <Stack verticalFill verticalAlign='center' horizontalAlign='center'>
          {props.children}
        </Stack>
      </Stack.Item>
    </Stack>
  );
};