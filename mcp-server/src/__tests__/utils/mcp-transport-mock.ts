import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { JSONRPCRequest, JSONRPCResponse, JSONRPCNotification } from '@modelcontextprotocol/sdk/shared/types.js';
import { EventEmitter } from 'events';

export class MockTransport extends EventEmitter implements Transport {
  private requests: JSONRPCRequest[] = [];
  private responses: JSONRPCResponse[] = [];
  private notifications: JSONRPCNotification[] = [];
  private isClosed = false;

  async start(): Promise<void> {
    // Mock transport starts immediately
  }

  async close(): Promise<void> {
    if (this.isClosed) return;
    this.isClosed = true;
    this.emit('close');
  }

  async send(data: JSONRPCRequest | JSONRPCNotification | JSONRPCResponse): Promise<void> {
    if (this.isClosed) {
      throw new Error('Transport is closed');
    }

    if ('id' in data && data.id !== undefined) {
      if ('method' in data) {
        this.requests.push(data as JSONRPCRequest);
      } else {
        this.responses.push(data as JSONRPCResponse);
      }
    } else {
      this.notifications.push(data as JSONRPCNotification);
    }
  }

  // Test helper methods
  getRequests(): JSONRPCRequest[] {
    return [...this.requests];
  }

  getResponses(): JSONRPCResponse[] {
    return [...this.responses];
  }

  getNotifications(): JSONRPCNotification[] {
    return [...this.notifications];
  }

  clearHistory(): void {
    this.requests = [];
    this.responses = [];
    this.notifications = [];
  }

  // Simulate receiving a message
  simulateMessage(message: JSONRPCRequest | JSONRPCNotification | JSONRPCResponse): void {
    this.emit('message', message);
  }

  // Simulate connection error
  simulateError(error: Error): void {
    this.emit('error', error);
  }

  // Check if transport is closed
  get closed(): boolean {
    return this.isClosed;
  }
}