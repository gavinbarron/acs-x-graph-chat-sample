// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import { Page } from '../components/Page';
import { ChatThreadSelection, ChatThreadSelectionProps } from '../components/ChatThreadSelection';

export const ChatThreadSelectionPage = (props: ChatThreadSelectionProps): JSX.Element => {
  return (
    <Page><ChatThreadSelection {...props} /></Page>
  );
};
