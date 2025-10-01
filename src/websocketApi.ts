import { Alert } from 'react-native';

export class GameWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandlers: ((data: any) => void)[] = [];
  private heartbeatInterval: any = null;
  private reconnectTimeout: any = null;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        resolve();

        // Start heartbeat (ping every 5 minutes)
        this.startHeartbeat();
      };

      this.ws.onerror = err => {
        console.error('WebSocket error:', err);
        reject(err);
      };

      this.ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          this.messageHandlers.forEach(h => h(data));
        } catch (err) {
          console.error('Invalid message data', event.data);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');

        // Stop heartbeat when closed
        this.stopHeartbeat();

        // Attempt to reconnect after short delay
        this.scheduleReconnect();
      };
    });
  }

  sendMessage(message: object) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    this.ws.send(JSON.stringify(message));
  }

  once(action: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let handler: (data: any) => void;

      const timeout = setTimeout(() => {
        this.off(handler);
        reject(new Error(`Timeout: No response for action '${action}'`));
      }, 10000);

      handler = (data: any) => {
        if (
          data.action === action ||
          data.action === 'error' ||
          data.playerId
        ) {
          clearTimeout(timeout);
          this.off(handler);

          if (data.action === 'error' && data.code) {
            Alert.alert('Error', data.message || 'An error occurred');
          }

          resolve(data);
        }
      };

      this.messageHandlers.push(handler);
    });
  }

  onMessage(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
  }

  off(handler: (data: any) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  close() {
    this.stopHeartbeat();
    clearTimeout(this.reconnectTimeout);
    this.ws?.close();
    this.ws = null;
    this.messageHandlers = [];
  }

  isConnected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // --- Heartbeat methods ---
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        try {
          this.sendMessage({ action: 'ping' });
        } catch (err) {
          console.warn('Heartbeat ping failed', err);
        }
      }
    }, 5 * 60 * 1000); // every 5 minutes
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // --- Auto-reconnect ---
  private scheduleReconnect() {
    if (this.reconnectTimeout) return; // Already scheduled

    this.reconnectTimeout = setTimeout(async () => {
      console.log('Attempting WebSocket reconnect...');
      try {
        await this.connect();
        console.log('Reconnected successfully');
      } catch (err) {
        console.error('Reconnect failed, will retry...', err);
        this.reconnectTimeout = null;
        this.scheduleReconnect(); // try again
      }
    }, 3000); // wait 3 seconds before reconnect
  }
}
