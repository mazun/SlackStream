import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { SlackServiceCollection, SlackMessage, SlackService } from '../services/slack/slack.service';
import { SlackParser, ComposedParser, LinkParser, EmojiParser } from '../services/slack/slack-parser.service';

class DisplaySlackMessageInfo {
    edited: boolean;

    constructor(
      public message: SlackMessage,
      public parser: SlackParser,
      public client: SlackService
    ) {
    }

    get text(): string {
      return this.parser.parse(this.message.text, this.message.dataStore);
    }
}

interface SubmitContext {
    channelName: string;
    channelID: string;
    teamID: string;

    submit(text: string): Promise<any>;
}

class PostMessageContext implements SubmitContext {
    constructor(
        public client: SlackService,
        public channelName: string,
        public channelID: string,
        public teamID: string
    ) {
    }

    async submit(text: string): Promise<any> {
        return this.client.postMessage(this.channelID, text);
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
  submitContext: SubmitContext = null;

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
    for (const slack of this.slackServices) {
        const parser = new ComposedParser([
            new LinkParser (),
            new EmojiParser (slack)
        ]);
        slack.start();
        slack.messages.subscribe(message => this.onReceiveMessage(message, parser, slack));
    }
  }

  async onReceiveMessage(message: SlackMessage, parser: SlackParser, client: SlackService): Promise<void> {
    switch(message.rawMessage.subtype) {
      case 'message_deleted':
        await this.deleteMessage(message, parser, client);
        break;
      case 'message_changed':
        await this.changeMessage(message, parser, client);
        break;
      case 'message_replied':
        await this.replyMessage(message, parser, client);
        break;
      default:
        await this.addMessage(message, parser, client);
        break;
    }

    this.detector.detectChanges();
  }

  async addMessage(message: SlackMessage, parser: SlackParser, client: SlackService): Promise<void> {
    console.log(message.rawDataStore.getUserById(message.rawMessage.user));
    console.log(message.rawMessage);

    if(message.message) {
        this.messages.unshift(new DisplaySlackMessageInfo(message, parser, client));
    }
  }

  async replyMessage(message: SlackMessage, parser: SlackParser, client: SlackService): Promise<void> {
      // TODO
  }

  async deleteMessage(message: SlackMessage, parser: SlackParser, client: SlackService): Promise<void> {
    this.messages = this.messages.filter (m => message.rawMessage.deleted_ts !== m.message.rawMessage.ts);
  }

  async changeMessage(message: SlackMessage, parser: SlackParser, client: SlackService): Promise<void> {
    console.log(message);

    const edited = this.messages.find(m => m.message.rawMessage.ts === message.rawMessage.message.ts);
    if (edited) {
        edited.edited = true;
        edited.message.text = message.rawMessage.message.text;
    }
  }

  get showForm(): boolean {
      return this.submitContext != null;
  }

  onClickWrite(info: DisplaySlackMessageInfo) {
      this.submitContext = new PostMessageContext(
          info.client,
          info.message.channelName,
          info.message.channelID,
          info.message.teamID
      );
      this.detector.detectChanges();
  }

  async submitForm(text: string) {
      if (this.submitContext != null) {
          await this.submitContext.submit (text);
          this.submitContext = null;
          this.detector.detectChanges();
      }
  }

  closeForm() {
      this.submitContext = null;
      this.detector.detectChanges();
  }
}
