// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Providers } from '@microsoft/mgt-element';
import { Chat, ChatMessage, ConversationMember } from '@microsoft/microsoft-graph-types';

async function GET(query: string): Promise<any> {
  const response = await Providers.client.api(query).get();
  console.log(`GET REQUEST: ${query}, response:`, response);
  return response;
}

async function POST<T>(query: string, postBody: T): Promise<any> {
  const response = await Providers.client.api(query).post(postBody);
  console.log(`POST REQUEST: ${query}, body:`, postBody, 'response:', response);
  return response;
}

export const getChats = async (): Promise<Chat[]> => (await GET(`/me/chats`)).value;
export const getChat = async (chatId: string): Promise<Chat> => (await GET(`/me/chats/${chatId}`));
export const getChatMessages = async (chatId: string): Promise<ChatMessage[]> => (await GET(`/chats/${chatId}/messages`)).value;
export const getChatParticipants = async (chatId: string): Promise<ConversationMember[]> => (await GET(`/chats/${chatId}/members`)).value;
export const sendMessage = async (chatId: string, message: string): Promise<string> => (await POST(`/chats/${chatId}/messages`, { body: { content: message } })).id;
