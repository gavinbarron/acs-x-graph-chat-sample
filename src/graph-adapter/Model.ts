// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { graphChatMessageToACSChatMessage, graphParticipantToACSParticipant } from './GraphAcsInteropUtils';
import { getChat, getChatMessages, getChatParticipants, getChats } from './GraphQueries';
import { Thread } from './types';
import { ThreadEventEmitter } from './ThreadEventEmitter';
import produce from 'immer';

export class Model {
  private threads: { [key: string]: Thread } = {};
  private threadEventEmitters: { [key: string]: ThreadEventEmitter } = {};

  public async populateAllThreads(): Promise<void> {
    console.log('populateAllThreads');
    const chatsFromGraph = await getChats();
    console.log('chatsFromGraph: ', chatsFromGraph);
    const threadPromises: Promise<Thread>[] = chatsFromGraph.map(async (chat) => {
      console.log('chat: ', chat);

      if (!chat.id) {
        throw new Error('getAllThreads: Chat has no id');
      }
      const messages = (await getChatMessages(chat.id)).map(graphChatMessageToACSChatMessage);
      console.log('messages: ', messages);

      const participants = (await getChatParticipants(chat.id)).map(graphParticipantToACSParticipant);
      console.log('participants: ', participants);

      return {
        id: chat.id,
        topic: chat.topic ?? '',
        createdOn: new Date(chat.createdDateTime ?? 0),
        version: -1,
        participants: participants,
        messages: [...messages],
        readReceipts: []
      };
    });

    const newThreads = await Promise.all(threadPromises);
    newThreads.forEach((thread) => {
      this.threads[thread.id] = thread;
      this.ensureThreadEventEmitterExists(thread.id);
    });
    console.log('threads: ', this.threads);
  }

  public async populateThread(threadId: string): Promise<void> {
    console.log('populateThread');
    const chatFromGraph = await getChat(threadId);
    console.log('chatFromGraph: ', chatFromGraph);

    if (!chatFromGraph.id) {
      throw new Error('getThread: Chat has no id');
    }
    const messages = (await getChatMessages(chatFromGraph.id)).map(graphChatMessageToACSChatMessage);
    console.log('messages: ', messages);
    const participants = (await getChatParticipants(chatFromGraph.id)).map(graphParticipantToACSParticipant);
    console.log('participants: ', participants);

    const newThread: Thread = {
      id: chatFromGraph.id,
      topic: chatFromGraph.topic ?? '',
      createdOn: new Date(chatFromGraph.createdDateTime ?? 0),
      version: -1,
      participants: participants,
      messages: messages,
      readReceipts: []
    };
    this.threads[threadId] = newThread;

    this.ensureThreadEventEmitterExists(newThread.id);
  }

  private ensureThreadEventEmitterExists(threadId: string) {
    if (!this.threadEventEmitters[threadId]) {
      this.threadEventEmitters[threadId] = new ThreadEventEmitter();
    }
  }

  public async fetchNewMessages(threadId: string): Promise<void> {
    const thread = this.threads[threadId];
    const threadEventEmitter = this.threadEventEmitters[threadId];
    // TODO: use graph subscriptions or delta queries here
    const existingMessages = thread.messages;
    const allNewMessages = (await getChatMessages(threadId)).map(graphChatMessageToACSChatMessage);
    const newMessages = allNewMessages.filter(newMessage => existingMessages.every(existingMessage => existingMessage.id !== newMessage.id));
    console.log('New messages: ', newMessages);

    this.modifyThread(threadId, (draft) => {
      draft.messages = allNewMessages;
    });

    newMessages.forEach(message => {
      threadEventEmitter.chatMessageReceived({
        message: message.content?.message!,
        metadata: {},
        id: message.id,
        createdOn: message.createdOn,
        version: message.version,
        type: message.type,
        threadId: thread.id,
        sender: message.sender!,
        senderDisplayName: message.senderDisplayName!,
        recipient: { id: 'who knows again', kind: 'unknown'}
      });
    });
  }

  public getThread(threadId: string): Thread | undefined {
    return this.threads[threadId];
  }

  public getThreadEventEmitter(threadId: string): ThreadEventEmitter {
    this.ensureThreadEventEmitterExists(threadId);
    return this.threadEventEmitters[threadId];
  }

  public getAllThreads(): Thread[] {
    return Object.values(this.threads);
  }

  private modifyThread(threadId: string, action: (t: Thread) => void) {
    const thread = this.threads[threadId];
    const newThread = produce(thread, (draft: Thread) => action(draft));
    if (thread !== newThread) {
      this.threads[threadId] = produce(newThread, (draft) => {
        draft.version++;
      });
    }
  }
}
