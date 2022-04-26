// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { ChatClient } from '@azure/communication-chat';
import { CommunicationTokenCredential, CommunicationUserIdentifier } from '@azure/communication-common';
import {
  ChatAdapter,
  createAzureCommunicationChatAdapterFromClient,
  createStatefulChatClientWithDeps
} from '@azure/communication-react';
import { MicrosoftGraphChatClient } from './MicrosoftGraphChatClient';
import { Model } from './Model';
import { IChatClient } from './types';

export const createMicrosoftGraphChatAdapter = async (args: {
  participantId: string,
  displayName: string,
  threadId: string,
  model: Model
}): Promise<ChatAdapter> => {
  const chatClient = new MicrosoftGraphChatClient(args.model) as IChatClient as ChatClient;

  const statefulChatClient = createStatefulChatClientWithDeps(chatClient, {
    userId: { id: args.participantId } as unknown as CommunicationUserIdentifier,
    displayName: args.displayName,
    endpoint: 'FAKE_ENDPIONT',
    credential: fakeToken
  });

  statefulChatClient.startRealtimeNotifications();

  return await createAzureCommunicationChatAdapterFromClient(
    statefulChatClient,
    await statefulChatClient.getChatThreadClient(args.threadId)
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
const fakeToken: CommunicationTokenCredential = {
  getToken(): any {},
  dispose(): any {}
};
