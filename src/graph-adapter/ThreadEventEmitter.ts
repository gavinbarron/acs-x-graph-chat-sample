// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
  ChatMessageDeletedEvent,
  ChatMessageEditedEvent,
  ChatMessageReceivedEvent,
  ChatThreadCreatedEvent,
  ChatThreadDeletedEvent,
  ChatThreadPropertiesUpdatedEvent,
  ParticipantsAddedEvent,
  ParticipantsRemovedEvent,
  ReadReceiptReceivedEvent,
  TypingIndicatorReceivedEvent
} from '@azure/communication-signaling';
import { EventEmitter } from 'events';

export class ThreadEventEmitter {
  private emitter: EventEmitter = new EventEmitter();

  on(event: string, listener: (...args: any[]) => void) {
    this.emitter.on(event, listener);
  }

  off(event: string, listener: (...args: any[]) => void) {
    this.emitter.off(event, listener);
  }

  chatMessageReceived(e: ChatMessageReceivedEvent) {
    this.emitter.emit('chatMessageReceived', e);
  }
  chatMessageEdited(e: ChatMessageEditedEvent) {
    this.emitter.emit('chatMessageEdited', e);
  }
  chatMessageDeleted(e: ChatMessageDeletedEvent) {
    this.emitter.emit('chatMessageDeleted', e);
  }
  typingIndicatorReceived(e: TypingIndicatorReceivedEvent) {
    this.emitter.emit('typingIndicatorReceived', e);
  }
  readReceiptReceived(e: ReadReceiptReceivedEvent) {
    this.emitter.emit('readReceiptReceived', e);
  }
  chatThreadCreated(e: ChatThreadCreatedEvent) {
    this.emitter.emit('chatThreadCreated', e);
  }
  chatThreadDeleted(e: ChatThreadDeletedEvent) {
    this.emitter.emit('chatThreadDeleted', e);
  }
  chatThreadPropertiesUpdated(e: ChatThreadPropertiesUpdatedEvent) {
    this.emitter.emit('chatThreadPropertiesUpdated', e);
  }
  participantsAdded(e: ParticipantsAddedEvent) {
    this.emitter.emit('participantsAdded', e);
  }
  participantsRemoved(e: ParticipantsRemovedEvent) {
    this.emitter.emit('participantsRemoved', e);
  }
}
