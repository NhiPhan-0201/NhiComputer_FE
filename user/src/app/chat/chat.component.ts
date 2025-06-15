import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { ChatResponse } from '../common/Chat';

class ChatMessage {
  constructor(
    public type: 'user' | 'bot',
    public content: string,
    public timestamp?: Date
  ) {}
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading = false;

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.addBotMessage('Xin chào! Tôi có thể giúp gì cho bạn?');
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.isLoading) {
      return;
    }
    const messageText = this.newMessage.trim();
    this.newMessage = '';
    this.isLoading = true;
    this.addUserMessage(messageText);

    this.chatService.sendMessage(messageText).subscribe({
      next: (response: ChatResponse) => {
        // Luôn hiển thị phản hồi từ backend (có thể là sản phẩm hoặc Gemini)
        this.addBotMessage(response.response || 'Xin lỗi, không nhận được phản hồi hợp lệ.');
        this.isLoading = false;
      },
      error: (error) => {
        this.addBotMessage('Lỗi hệ thống, vui lòng thử lại sau!');
        this.isLoading = false;
      }
    });
  }

  private addBotMessage(content: string) {
    this.messages.push(new ChatMessage('bot', content, new Date()));
    this.scrollToBottom();
  }

  private addUserMessage(content: string) {
    this.messages.push(new ChatMessage('user', content, new Date()));
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
