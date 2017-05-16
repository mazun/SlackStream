import { Component, ChangeDetectorRef } from '@angular/core';
import { SlackServiceCollection, SlackMessage } from '../services/slack/slack.service';
import { RTMMessage, DataStore } from '../services/slack/slack.types';

class DisplaySlackMessageInfo {
    edited: boolean;

    constructor(public message: SlackMessage) {
    }
}

@Component({
  selector: 'ss-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  messages: DisplaySlackMessageInfo[] = [];

  constructor(private services: SlackServiceCollection, private detector: ChangeDetectorRef) {
    services.slacks.forEach(slack => {
      slack.start();
      slack.messages.subscribe(message => this.onReceiveMessage(message));
    });
  }

  onReceiveMessage(message: SlackMessage): void {
    switch(message.rawMessage.subtype) {    
      case "message_deleted":
        this.deleteMessage(message);
        break;
      case "message_changed":
        this.changeMessage(message);
        break;
      default:
        this.addMessage(message);
        break;
    }

    this.detector.detectChanges();
  }

  addMessage(message: SlackMessage): void {
    console.log(message.rawDataStore.getUserById(message.rawMessage.user));
    console.log(message.rawMessage);

    this.messages.push(new DisplaySlackMessageInfo(message));
  }

  deleteMessage(message: SlackMessage): void {
    this.messages = this.messages.filter (m => message.rawMessage.deleted_ts != m.message.rawMessage.ts);
  }

  changeMessage(message: SlackMessage): void {
    console.log(message);

    const edited = this.messages.find(m => m.message.rawMessage.ts == message.rawMessage.message.ts);
    if(edited) {
        edited.edited = true;
        edited.message.text = message.rawMessage.message.text;
    }
  }
}
