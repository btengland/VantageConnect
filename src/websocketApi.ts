// websocketApi.ts
export class GameWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandlers: ((data: any) => void)[] = [];

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
          this.messageHandlers.forEach(h => h(data));
        } catch (err) {
          console.error('Invalid message data', event.data);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
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
      }, 10000); // 10 seconds

      handler = (data: any) => {
        if (data.action === action || data.playerId) {
          // fallback if your Lambda just sends {playerId, sessionCode}
          clearTimeout(timeout);
          this.off(handler);
          resolve(data);
        }
      };

      this.messageHandlers.push(handler);
    });
  }

  off(handler: (data: any) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  close() {
    this.ws?.close();
    this.ws = null;
    this.messageHandlers = [];
  }

  isConnected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}
