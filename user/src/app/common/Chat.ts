export class ChatMessage {
  id?: number;
  type: 'user' | 'bot';
  content: string;
  timestamp?: Date;

  constructor(type: 'user' | 'bot', content: string) {
    this.type = type;
    this.content = content;
    this.timestamp = new Date();
  }
}

export interface ChatResponse {
  response: string;
}
