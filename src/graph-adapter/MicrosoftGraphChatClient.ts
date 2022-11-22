// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
  ChatThreadClient,
  ChatThreadItem,
  CreateChatThreadRequest,
  CreateChatThreadOptions,
  CreateChatThreadResult,
} from "@azure/communication-chat";
import { PagedAsyncIterableIterator } from "@azure/core-paging";
import { Model } from "./Model";
import { IChatClient, IChatThreadClient } from "./types";
import { MicrosoftGraphChatThreadClient } from "./MicrosoftGraphChatThreadClient";
import { pagedAsyncIterator, latestMessageTimestamp } from "./utils";
import { GraphNotificationClient } from "./GraphNotificationClient";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/**
 * A MicrosoftGraph implementation of a ChatClient.
 */
export class MicrosoftGraphChatClient implements IChatClient {
  private threadClients: MicrosoftGraphChatThreadClient[] = [];
  private _notificationClient?: GraphNotificationClient;

  private get notificationClient(): GraphNotificationClient {
    if (!this._notificationClient) {
      this._notificationClient = new GraphNotificationClient();
    }
    return this._notificationClient;
  }

  constructor(private model: Model) {}

  getChatThreadClient(threadId: string): ChatThreadClient {
    this.model.getThread(threadId);
    const threadClient = new MicrosoftGraphChatThreadClient(
      this.model,
      threadId,
      this.notificationClient
    );
    this.threadClients.push(threadClient);
    return threadClient as IChatThreadClient as ChatThreadClient;
  }

  createChatThread(
    request: CreateChatThreadRequest,
    options?: CreateChatThreadOptions
  ): Promise<CreateChatThreadResult> {
    throw new Error(
      "MicrosoftGraphChatClient createChatThread Not Implemented"
    );
  }

  listChatThreads(): PagedAsyncIterableIterator<ChatThreadItem> {
    const threads = this.model.getAllThreads();
    const response: ChatThreadItem[] = threads.map((t) => ({
      id: t.id,
      topic: t.topic,
      lastMessageReceivedOn: latestMessageTimestamp(t.messages),
    }));
    return pagedAsyncIterator(response);
  }

  deleteChatThread(threadId: string): Promise<void> {
    throw new Error(
      "MicrosoftGraphChatClient deleteChatThread Not Implemented"
    );
  }

  async startRealtimeNotifications(): Promise<void> {
    console.log('starting "real time" notifications');

    // Call to register for notifications.
    await this.notificationClient.createSignalConnection();

    // NotificationClient updates messages in the thread via threadEventEmitter.chatMessageReceived currently in the model class
    for (const threadClient of this.threadClients) {
      await threadClient.fetchNewMessages();
    }
  }

  stopRealtimeNotifications(): Promise<void> {
    throw new Error(
      "MicrosoftGraphChatClient stopRealtimeNotifications Not Implemented"
    );
  }

  // registers a listener for a specific event
  // in this sample only the 'chatMessageReceived' event is supported
  on(event: string, listener: any): void {
    if (event === "chatMessageReceived") {
      for (const threadClient of this.threadClients) {
        threadClient.getThreadEventEmitter().on(event, listener);
      }
    }

    console.error(`MicrosoftGraphChatClient ${event} on Not implemented`);
  }

  off(event: string, listener: any): void {
    console.error(`MicrosoftGraphChatClient ${event} off Not implemented`);
  }
}
