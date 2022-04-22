// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
  ChatAdapter,
  ChatComposite,
  useTheme
} from '@azure/communication-react';
import { mergeStyles, Spinner, Stack } from '@fluentui/react';
import React, { useEffect, useState } from 'react';
import { Page } from '../components/Page';
import { createMicrosoftGraphChatAdapter } from '../graph-adapter/MicrosoftGraphChatAdapter';
import { Model } from '../graph-adapter/Model';
import { LeaveChatButton } from '../components/LeaveChatButton';

interface ChatScreenProps {
  model?: Model;
  threadId: string;
  leaveChat?: () => void;
}

export const ChatPage = (props: ChatScreenProps): JSX.Element => {
  const [adapter, setAdapter] = useState<ChatAdapter | undefined>();
  const theme = useTheme();
  useEffect(() => {
    (async () => {
      if (props.model) {
        const graphAdapter = await createMicrosoftGraphChatAdapter(props.threadId, props.model);
        setAdapter(graphAdapter);
      }
    })();
  }, [props.model, props.threadId]);

  if (adapter) {
    return (
      <Page headerChildren={<LeaveChatButton onClick={props.leaveChat} />}>
        <Stack className={chatScreenContainerStyle}>
          <Stack.Item verticalFill>
            <ChatComposite
              adapter={adapter}
              fluentTheme={theme}
              options={{ autoFocus: 'sendBoxTextField', participantPane: true }}
            />
          </Stack.Item>
        </Stack>
      </Page>
    );
  }
  return <Spinner label="Creating MicrosoftGraphChatAdapter..." />;
};

const chatScreenContainerStyle = mergeStyles({
  height: '100%',
  width: '100%',
  paddingTop: '0.5rem',
  paddingBottom: '0.5rem'
});