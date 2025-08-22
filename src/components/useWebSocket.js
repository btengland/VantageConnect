// useWebSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';

export const useWebSocket = ({ url, onMessage }) => {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      setConnected(true);
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = event => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
      if (onMessage) onMessage(data); // optional callback
    };

    wsRef.current.onerror = error => console.error('WebSocket error', error);

    wsRef.current.onclose = () => {
      setConnected(false);
      console.log('WebSocket closed');
    };

    return () => wsRef.current?.close();
  }, [url, onMessage]);

  const sendMessage = useCallback(payload => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      console.warn('WebSocket not connected');
    }
  }, []);

  return { connected, messages, sendMessage };
};
