const WEBSOCKET_URL = 'wss://gh1j093d4d.execute-api.us-east-2.amazonaws.com/production/';

class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: WebSocket | null = null;
  private messageHandler: ((data: any) => void) | null = null;
  private openHandler: (() => void) | null = null;

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public connect(sessionId?: string): Promise<void> {
    // If there's an existing open socket, close it before creating a new one.
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }

    return new Promise((resolve, reject) => {
      const url = sessionId ? `${WEBSOCKET_URL}?sessionId=${sessionId}` : WEBSOCKET_URL;
      console.log(`Connecting to WebSocket at ${url}`);
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        if (this.openHandler) {
            this.openHandler();
        }
        resolve();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          if (this.messageHandler) {
            this.messageHandler(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.socket = null;
      };
    });
  }

  public disconnect() {
    if (this.socket) {
      console.log('Disconnecting WebSocket');
      this.socket.close();
      this.socket = null;
    }
  }

  public sendMessage(message: object) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      console.log('WebSocket message sent:', message);
    } else {
      console.error('WebSocket is not connected or not in an open state.');
    }
  }

  public onMessage(handler: (data: any) => void) {
    this.messageHandler = handler;
  }

  public onOpen(handler: () => void) {
    this.openHandler = handler;
  }
}

export const webSocketManager = WebSocketManager.getInstance();
