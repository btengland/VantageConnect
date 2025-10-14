import { Alert } from 'react-native';
import { NavigationProp } from '@react-navigation/native';

export class GameWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private navigation: NavigationProp<any> | null = null;
  private messageHandlers: ((data: any) => void)[] = [];
  private isClosingIntentionally = false;

  constructor(url: string, navigation?: NavigationProp<any>) {
    this.url = url;
    this.navigation = navigation || null;
  }

  connect(): Promise<void> {
    this.isClosingIntentionally = false; // Reset on new connection
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        resolve();
      };

      this.ws.onerror = err => {
        console.error('WebSocket error:', err);
        // Don't reject here, let onclose handle navigation
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
        if (this.isClosingIntentionally) {
          console.log('Connection closed intentionally.');
          return;
        }

        console.log('Unexpected disconnection. Navigating to Home.');
        Alert.alert(
          'Connection Lost',
          'You have been disconnected from the game.',
          [{ text: 'OK', onPress: () => this.navigation?.navigate('Home') }],
          { cancelable: false },
        );
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

  off(handler: (data: any) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  close() {
    this.isClosingIntentionally = true;
    this.ws?.close();
    this.ws = null;
    this.messageHandlers = [];
  }

  isConnected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}
