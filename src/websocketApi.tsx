import { Alert } from 'react-native';

export class GameWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandlers: ((data: any) => void)[] = [];
  private disconnectHandlers: (() => void)[] = [];
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
      };

      this.ws.onerror = err => {
        console.error('WebSocket error:', err);
        reject(err);
      };

      this.ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          this.messageHandlers.forEach(h => {
            try {
              h(data);
            } catch (handlerErr) {
              console.error('Handler error:', handlerErr, 'Data:', data);
            }
          });
        } catch (parseErr) {
          console.error(
            'Failed to parse WebSocket message:',
            parseErr,
            'Raw data:',
            event.data,
          );
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.disconnectHandlers.forEach(h => h());
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
      }, 15000);

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

  onDisconnect(handler: () => void): () => void {
    this.disconnectHandlers.push(handler);
    return () => {
      this.disconnectHandlers = this.disconnectHandlers.filter(
        h => h !== handler,
      );
    };
  }

  off(handler: (data: any) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  close() {
    clearTimeout(this.reconnectTimeout);
    this.ws?.close();
    this.ws = null;
    this.messageHandlers = [];
  }

  isConnected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
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
