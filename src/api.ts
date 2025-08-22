export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => resolve();
      this.ws.onerror = err => reject(err);
    });
  }

  hostGame(): Promise<any> {
    return this.sendMessage({ action: 'hostSession' });
  }

  joinGame(sessionCode: string): Promise<any> {
    return this.sendMessage({ action: 'joinSession', sessionCode });
  }

  private sendMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('WebSocket not connected'));
      }

      // Assign a single onmessage handler
      this.ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          resolve(data);
        } catch (err) {
          reject(err);
        } finally {
          // Clear the handler after it fires
          this.ws!.onmessage = null;
        }
      };

      this.ws.send(JSON.stringify(message));
    });
  }
}
