import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { SlackServiceCollection, SlackMessage, SlackService } from '../services/slack/slack.service';
import { SlackParser, ComposedParser, LinkParser, EmojiParser } from '../services/slack/slack-parser.service';

class DisplaySlackMessageInfo {
    edited: boolean;

    constructor(
      public message: SlackMessage,
      public parser: SlackParser
    ) {
    }

    get text(): string {
      return this.parser.parse(this.message.text, this.message.dataStore);
    }
}

@Component({
  selector: 'ss-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  messages: DisplaySlackMessageInfo[] = [];
  slackServices: SlackService[];

  get doesHaveMultipleTeams(): boolean {
    return this.slackServices.length >= 2;
  }

  get showTeamName(): boolean {
    return false;
  }

  constructor(
    private services: SlackServiceCollection,
    private detector: ChangeDetectorRef
  ) {
    this.slackServices = services.slacks;
  }

  ngOnInit(): void {
    for(const slack of this.slackServices) {
        const parser = new ComposedParser([
            new LinkParser (),
            new EmojiParser (slack)
        ]);
        slack.start();
        slack.messages.subscribe(message => this.onReceiveMessage(message, parser));
    }
  }

  async onReceiveMessage(message: SlackMessage, parser: SlackParser): Promise<void> {
    switch(message.rawMessage.subtype) {
      case 'message_deleted':
        await this.deleteMessage(message, parser);
        break;
      case 'message_changed':
        await this.changeMessage(message, parser);
        break;
      default:
        await this.addMessage(message, parser);
        break;
    }

    this.detector.detectChanges();
  }

  async addMessage(message: SlackMessage, parser: SlackParser): Promise<void> {
    console.log(message.rawDataStore.getUserById(message.rawMessage.user));
    console.log(message.rawMessage);

    this.messages.unshift(new DisplaySlackMessageInfo(message, parser));
  }

  async deleteMessage(message: SlackMessage, parser: SlackParser): Promise<void> {
    this.messages = this.messages.filter (m => message.rawMessage.deleted_ts !== m.message.rawMessage.ts);
  }

  async changeMessage(message: SlackMessage, parser: SlackParser): Promise<void> {
    console.log(message);

    const edited = this.messages.find(m => m.message.rawMessage.ts === message.rawMessage.message.ts);
    if(edited) {
        edited.edited = true;
        edited.message.text = message.rawMessage.message.text;
    }
  }
}
