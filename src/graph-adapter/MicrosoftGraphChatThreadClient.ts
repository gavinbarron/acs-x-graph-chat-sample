// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
  AddChatParticipantsResult,
  AddParticipantsRequest,
  ChatMessage,
  ChatMessageReadReceipt,
  ChatParticipant,
  ChatThreadProperties,
  ListMessagesOptions,
  ListParticipantsOptions,
  ListReadReceiptsOptions,
  SendChatMessageResult,
  SendMessageRequest,
  SendReadReceiptRequest,
  SendTypingNotificationOptions,
  UpdateMessageOptions
} from '@azure/communication-chat';
import { CommunicationIdentifier } from '@azure/communication-common';
import { PagedAsyncIterableIterator } from '@azure/core-paging';
import { sendMessage } from './GraphQueries';
import { Model } from './Model';
import { IChatThreadClient, Thread } from './types';
import { pagedAsyncIterator } from './utils';
import { ThreadEventEmitter } from './ThreadEventEmitter';
import { GraphNotificationClient } from './GraphNotificationClient';


/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * A Microsoft Graph implementation of a ChatThreadClient.
 */
export class MicrosoftGraphChatThreadClient implements IChatThreadClient {
  constructor(private model: Model, public threadId: string, private notificationClient: GraphNotificationClient) {}

  async fetchNewMessages(): Promise<void> {
    await this.notificationClient.subscribeToChatNotifications(this.threadId, this.model.getThreadEventEmitter(this.threadId));
  }

  getProperties(): Promise<ChatThreadProperties> {
    const thread = this.getThread();
    return Promise.resolve({
      id: thread.id,
      topic: thread.topic,
      createdOn: thread.createdOn,
      createdBy: thread.createdBy,
      deletedOn: thread.deletedOn
    });
  }

  updateTopic(topic: string): Promise<void> {
    throw new Error('MicrosoftGraphChatThreadClient topic Not implemented');
  }

  async sendMessage(request: SendMessageRequest): Promise<SendChatMessageResult> {
    const messageId = await sendMessage(this.threadId, request.content);
    return {
      id: messageId
    };
  }

  getMessage(messageId: string): Promise<ChatMessage> {
    const message = this.getThread().messages.find((m) => m.id === messageId);
    if (!message) {
      throw new Error(`No message ${messageId} in thread ${this.threadId}`);
    }
    return Promise.resolve(message);
  }

  listMessages(options?: ListMessagesOptions): PagedAsyncIterableIterator<ChatMessage> {
    let messages = this.getThread().messages;
    if (options?.startTime) {
      const startTime = options.startTime;
      // Verify: Does startTime apply to when the message was sent, or last updated?
      messages = messages.filter((m) => m.createdOn > startTime);
    }
    return pagedAsyncIterator(messages);
  }

  deleteMessage(messageId: string): Promise<void> {
    throw new Error('MicrosoftGraphChatThreadClient deleteMessage Not implemented');
  }

  updateMessage(messageId: string, options?: UpdateMessageOptions): Promise<void> {
    throw new Error('MicrosoftGraphChatThreadClient updateMessage Not implemented');
  }

  addParticipants(request: AddParticipantsRequest): Promise<AddChatParticipantsResult> {
    throw new Error('MicrosoftGraphChatThreadClient addParticipants Not implemented');
  }

  listParticipants(options?: ListParticipantsOptions): PagedAsyncIterableIterator<ChatParticipant> {
    if (options?.skip) {
      throw new Error(`options.skip not supported`);
    }
    return pagedAsyncIterator(this.getThread().participants);
  }

  removeParticipant(participant: CommunicationIdentifier): Promise<void> {
    throw new Error('MicrosoftGraphChatThreadClient removeParticipant Not implemented');
  }

  sendTypingNotification(options?: SendTypingNotificationOptions): Promise<boolean> {
    console.error('MicrosoftGraphChatThreadClient sendTypingNotification Not implemented');
    return Promise.resolve(true);
  }

  sendReadReceipt(request: SendReadReceiptRequest): Promise<void> {
    console.error('MicrosoftGraphChatThreadClient  Not implemented');
    return Promise.resolve();
  }

  listReadReceipts(options?: ListReadReceiptsOptions): PagedAsyncIterableIterator<ChatMessageReadReceipt> {
    if (options?.skip) {
      throw new Error(`options.skip not supported`);
    }
    return pagedAsyncIterator(this.getThread().readReceipts);
  }

  private getThread(): Thread {
    const thread = this.model.getThread(this.threadId);
    if (!thread) {
      throw new Error(`Thread not found! (${this.threadId})}`);
    }
    return thread;
  }

  public getThreadEventEmitter(): ThreadEventEmitter {
    const threadEventEmitter = this.model.getThreadEventEmitter(this.threadId);
    if (!threadEventEmitter) {
      throw new Error(`ThreadEventEmitter not found! (${this.threadId})}`);
    }
    return threadEventEmitter;
  }
}
