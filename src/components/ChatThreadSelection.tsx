// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import { IStackStyles, ITheme, mergeStyles, PrimaryButton, Stack, Text } from '@fluentui/react';
import { Thread } from '../graph-adapter/types';
import { ChatParticipant } from '@azure/communication-chat';
import { useTheme } from '@azure/communication-react';

export type ChatThreadSelectionProps = {
  threads: Thread[],
  joinChatThread: (threadId: string) => void;
};

export const ChatThreadSelection = (props: ChatThreadSelectionProps): JSX.Element => {
  return (
    <Stack tokens={{ childrenGap: '1rem'}}>
      <Stack.Item>
        <Text role={'heading'} aria-level={1} className={headerStyle}>
          {'Your existing chats'}
        </Text>
      </Stack.Item>
      <Stack.Item>
        {props.threads.map(((thread, i) => <Stack.Item key={i}><JoinableChatThread thread={thread} joinCallback={props.joinChatThread} /></Stack.Item>))}
      </Stack.Item>
    </Stack>
  );
};

const headerStyle = mergeStyles({
  fontWeight: 600,
  fontSize: '2rem'
});

const JoinableChatThread = (props: { thread: Thread, joinCallback: (threadId: string) => void; }): JSX.Element => {
  const theme = useTheme();
  return (
    <Stack styles={containerStyles(theme)} tokens={{ childrenGap: '1rem' }}>
      <Stack.Item><ThreadInfo threadId={props.thread.id} threadParticipants={props.thread.participants} /></Stack.Item>
      <Stack.Item>
        <Stack horizontalAlign='end'>
          <JoinButton join={() => props.joinCallback(props.thread.id)} />
        </Stack>
      </Stack.Item>
    </Stack>
  );
}

const JoinButton = (props: { join: () => void }) => (
  <PrimaryButton onClick={props.join}>
    Join Chat
  </PrimaryButton>
);

const ThreadInfo = (props: {threadId: string, threadParticipants: ChatParticipant[]}) => {
  const chatWithString = `Chat with: ${props.threadParticipants.map(((participant) => participant.displayName)).join(' ')}`;

  return (
    <Stack>
      <Stack.Item><Text>{chatWithString}</Text></Stack.Item>
      <Stack.Item>{props.threadId}</Stack.Item>
    </Stack>
  )
};

const containerStyles: (theme: ITheme) => IStackStyles = (theme) => ({
  root: {
    maxWidth: '30rem',
    padding: '1rem',
    border: `2px solid ${theme.palette.neutralLight}`,
    borderRadius: '0.5rem',
  }
});