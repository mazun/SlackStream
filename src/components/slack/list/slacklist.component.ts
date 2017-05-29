import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
    SlackServiceCollection,
    SlackMessage,
    SlackService,
    SlackReactionAdded,
    SlackReactionRemoved
} from '../../../services/slack/slack.service';

import {
    SlackParser,
    ComposedParser,
    LinkParser,
    EmojiParser,
    NewLineParser
} from '../../../services/slack/slack-parser.service';

import { Attachment } from '../../../services/slack/slack.types';

class DisplaySlackReactionInfo {
    constructor (public reaction: string, public users: string[]) {
    }

    addUser(user: string) {
        this.removeUser (user);
        this.users.push(user);
    }

    removeUser(user: string) {
        this.users = this.users.filter(u => u != user);
    }

    get count(): number {
        return this.users.length;
    }
}

class DisplaySlackMessageInfo {
    edited: boolean = false;
    reactions: DisplaySlackReactionInfo[] = [];

    constructor(
        public message: SlackMessage,
        public parser: SlackParser,
        public client: SlackService
    ) {
    }

    get text(): string {
        return this.parser.parse(this.message.text, this.message.dataStore);
    }

    get attachments(): Attachment[] {
        return this.message.rawMessage.attachments
            ? this.message.rawMessage.attachments
            : [];
    }

    get doesReactionExist(): boolean {
        return this.reactions.length > 0;
    }

    addReaction(info: SlackReactionAdded) {
        const reaction = this.parser.parse(`:${info.reaction.reaction}:`, this.message.dataStore);
        const user = info.reaction.user;
        const target = this.reactions.find(r => r.reaction == reaction);

        if(target) {
            target.addUser(user);
        } else {
            this.reactions.push(new DisplaySlackReactionInfo(reaction, [user]));
        }
    }

    removeReaction(info: SlackReactionRemoved) {
        const reaction = this.parser.parse(`:${info.reaction.reaction}:`, this.message.dataStore);
        const target = this.reactions.find(r => r.reaction == reaction);

        if(target) {
            target.removeUser(info.reaction.user);

            if(target.count == 0) {
                this.reactions = this.reactions.filter(r => r.reaction != reaction);
            }
        }
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
        public teamID: string,
        public infos: DisplaySlackMessageInfo[]
    ) {
    }

    get lastMessageTs(): string {
        for(let i = 0; i < this.infos.length; i++) {
            if(this.infos[i].message.channelID == this.channelID) {
                return this.infos[i].message.ts;
            }
        }
        return '';
    }

    async submit(text: string): Promise<any> {
        if(text.trim().match(/^\+:(.*):$/)) {
            let reaction = text.trim().match(/^\+:(.*):$/)[1];
            this.client.addReaction (reaction, this.channelID, this.lastMessageTs);
        } else if(text.trim().match(/^\-:(.*):$/)) {
            let reaction = text.trim().match(/^\-:(.*):$/)[1];
            this.client.removeReaction (reaction, this.channelID, this.lastMessageTs);
        } else {
            return this.client.postMessage(this.channelID, text);
        }
    }
}

@Component({
  selector: 'ss-list',
  templateUrl: './slacklist.component.html',
  styles: [ require('./slacklist.component.css').toString() ],
})
export class SlackListComponent implements OnInit, OnDestroy {
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
    private detector: ChangeDetectorRef,
    private router: Router
  ) {
    this.slackServices = services.slacks;
  }

  ngOnInit(): void {
    if (this.slackServices.length === 0) {
        this.router.navigate(['/setting']);
        return;
    }

    this.services.refresh();

    for (const slack of this.slackServices) {
        const parser = new ComposedParser([
            new LinkParser (),
            new NewLineParser (),
            new EmojiParser (slack)
        ]);

        slack.messages.subscribe(message => this.onReceiveMessage(message, parser, slack));
        slack.reactionAdded.subscribe(reaction => this.onReactionAdded(reaction, parser, slack));
        slack.reactionRemoved.subscribe(reaction => this.onReactionRemoved(reaction, parser, slack));
        slack.start();
    }
  }

  ngOnDestroy(): void {
      for (const slack of this.slackServices) {
          slack.stop();
      }
  }

  async onReactionAdded(reaction: SlackReactionAdded, parser: SlackParser, client: SlackService): Promise<void> {
    const target = this.messages.find(m => m.message.rawMessage.ts === reaction.reaction.item.ts);
    if(target) {
        target.addReaction(reaction);
    }
    console.log(reaction.reaction);
    this.detector.detectChanges();
  }

  async onReactionRemoved(reaction: SlackReactionAdded, parser: SlackParser, client: SlackService): Promise<void> {
    const target = this.messages.find(m => m.message.rawMessage.ts === reaction.reaction.item.ts);
    if(target) {
        target.removeReaction(reaction);
    }
    console.log(reaction.reaction);
    this.detector.detectChanges();
  }

  async onReceiveMessage(message: SlackMessage, parser: SlackParser, client: SlackService): Promise<void> {
    console.log(message.rawMessage);

    switch (message.rawMessage.subtype) {
      case 'message_deleted':
        await this.removeDeletedMessage(message, parser, client);
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
    if (message.message) {
        this.messages.unshift(new DisplaySlackMessageInfo(message, parser, client));
	client.markRead(message.channelID, message.ts);
    }
  }

  async deleteMessage(message: SlackMessage, client: SlackService): Promise<void> {
      if (message.message) {
          client.deleteMessage(message.channelID, message.ts);
      }
  }

  async replyMessage(message: SlackMessage, parser: SlackParser, client: SlackService): Promise<void> {
      // TODO
  }

  async removeDeletedMessage(message: SlackMessage, parser: SlackParser, client: SlackService): Promise<void> {
    this.messages = this.messages.filter (m => message.rawMessage.deleted_ts !== m.message.rawMessage.ts);
  }

  async changeMessage(message: SlackMessage, parser: SlackParser, client: SlackService): Promise<void> {
    const edited = this.messages.find(m => m.message.rawMessage.ts === message.rawMessage.message.ts);
    if (edited) {
        edited.edited = true;
        edited.message.text = message.rawMessage.message.text;
        edited.message.rawMessage.attachments = message.rawMessage.message.attachments;
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
          info.message.teamID,
          this.messages
      );
      this.detector.detectChanges();
  }

  onClickDelete(info: DisplaySlackMessageInfo) {
      this.deleteMessage(info.message, info.client);
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
