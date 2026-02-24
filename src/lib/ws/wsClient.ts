import type { AvatarEvent } from '../state/avatarState';

export class WSClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private endpoint: string;
  onEvent: (evt: AvatarEvent) => void = () => {};
  onStatus: (status: 'disconnected' | 'connecting' | 'connected') => void = () => {};

  constructor(endpoint = 'ws://localhost:8787') {
    this.endpoint = endpoint;
  }

  connect() {
    this.onStatus('connecting');
    try {
      this.ws = new WebSocket(this.endpoint);
      this.ws.onopen = () => this.onStatus('connected');
      this.ws.onclose = () => {
        this.onStatus('disconnected');
        this.reconnect();
      };
      this.ws.onerror = () => {
        this.onStatus('disconnected');
        this.ws?.close();
      };
      this.ws.onmessage = (message) => {
        const event = this.parseEvent(message.data);
        if (event) this.onEvent(event);
      };
    } catch {
      this.onStatus('disconnected');
      this.reconnect();
    }
  }

  disconnect() {
    if (this.reconnectTimer) window.clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this.onStatus('disconnected');
  }

  private reconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  private parseEvent(raw: string): AvatarEvent | null {
    try {
      const data = JSON.parse(raw);
      if (data.type === 'reply') {
        return {
          type: 'reply',
          mode: data.mode,
          text: String(data.text ?? ''),
          emotion: data.emotion,
          gesture: data.gesture,
          duration_ms: data.duration_ms,
          priority: data.priority
        };
      }
      if (data.type === 'set_mode') return { type: 'set_mode', value: data.value };
      if (data.type === 'set_emotion') return { type: 'set_emotion', emotion: data.emotion };
      if (data.type === 'interrupt') return { type: 'interrupt' };
      if (data.type === 'clear_queue') return { type: 'clear_queue' };
      return null;
    } catch {
      return null;
    }
  }
}
