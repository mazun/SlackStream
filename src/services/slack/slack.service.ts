import { Injectable } from '@angular/core';

import { RTMClientWrapper } from './wrapper/rtmwrapper';
import { WebClientWrapper } from './wrapper/webwrapper';
import { RTMMessage, DataStore, Team, RTMReactionAdded, RTMReactionRemoved } from './slack.types';
import { Observable } from 'rxjs';
import { SettingService } from '../setting.service';

import * as emojione from 'emojione';

export class SlackMessage {
    constructor (public message: RTMMessage, public dataStore: DataStore) {
    }

    get text(): string {
        if(this.message.text) {
            return this.message.text;
        } else if(this.rawMessage.attachments) {
            for(var attachment of this.rawMessage.attachments) {
                if(attachment.pretext) {
                    return attachment.pretext;
                }
            }
        }
        return '';
    }

    set text(value: string) {
        this.message.text = value;
    }

    get team(): Team {
        return this.dataStore.getTeamById(this.teamID);
    }

    get teamName(): string {
        return this.team ? this.team.name : '???';
    }

    get teamThumbnail(): string {
        return this.team ? this.team.icon.image_68 : '';
    }

    get teamID(): string {
        return this.message.team_id || this.message.source_team || this.message.team || '';
    }

    get channelID(): string {
        return this.message.channel;
    }

    get userName(): string {
        if(this.message.user) {
            const user = this.dataStore.getUserById(this.message.user);
            return user ? user.name : '???';
        }

        if(this.message.bot_id) {
            const bot = this.dataStore.getBotById(this.message.bot_id);
            return bot ? bot.name : '???';
        }

        return 'slack-bot';
    }

    get userThumbnail(): string {
        if(this.message.user) {
            const user = this.dataStore.getUserById(this.message.user);
            return user ? user.profile.image_48 : '';
        }

        if(this.message.bot_id) {
            const bot = this.dataStore.getBotById(this.message.bot_id);
            return bot ? bot.icons.image_48 : '';
        }
        return 'https://ca.slack-edge.com/T2T2ETX4H-USLACKBOT-sv1444671949-48';
    }


    get channelName(): string {
        const channel = this.dataStore.getChannelById(this.message.channel);
        const group = this.dataStore.getGroupById(this.message.channel);
        const channelName = channel ? channel.name : group ? group.name : 'DM';
        return channelName;
    }

    get channelLink(): string {
        const team = this.dataStore.getTeamById(this.message.team_id);
        const channel = this.dataStore.getChannelById(this.message.channel);
        return `slack://channel?team=${team.id}&id=${channel.id}`;
    }

    get subType(): string {
        return this.message.subtype;
    }

    get ts(): string {
        return this.message.ts;
    }

    get rawMessage(): RTMMessage {
        return this.message;
    }

    get rawDataStore(): DataStore {
        return this.dataStore;
    }
}

export class SlackReactionAdded {
    constructor (public reaction: RTMReactionAdded, public dataStore: DataStore) {
    }
}

export class SlackReactionRemoved {
    constructor (public reaction: RTMReactionRemoved, public dataStore: DataStore) {
    }
}

@Injectable()
export class SlackServiceCollection {
    slacks: SlackService[];

    constructor(setting: SettingService) {
        this.slacks = setting.tokens.map(token => {
            return new SlackServiceImpl(token) as SlackService;
        });
    }
}

export interface SlackService {
    messages: Observable<SlackMessage>;
    reactionAdded: Observable<SlackReactionAdded>;
    reactionRemoved: Observable<SlackReactionRemoved>;
    start(): void;
    stop(): void;
    getEmoji(): Promise<{string: string}>;
    postMessage(channel: string, text: string): Promise<{string: any}>;
}

export class EmojiService {
    emojiList: {string: string};

    constructor(private client: SlackService) {

    }

    async initExternalEmojis(): Promise<void> {
        if (!this.emojiList) {
            this.emojiList = await this.client.getEmoji();
        }
    }

    convertEmoji(emoji: string): string {
        if (emoji != emojione.shortnameToImage(emoji)) {
            return emojione.shortnameToImage(emoji);
        } else if (this.emojiList && !!this.emojiList[emoji.substr(1, emoji.length-2)]) {
            let image_url = this.emojiList[emoji.substr(1, emoji.length-2)];
            return `<img class="emojione" src="${image_url}" />`;
        } else {
            return emoji;
        }
    }
}

export class SlackServiceImpl implements SlackService {
    rtm: RTMClientWrapper;
    web: WebClientWrapper;

    constructor(private token: string) {
        this.rtm = new RTMClientWrapper(token);
        this.web = new WebClientWrapper(token);
    }

    start(): void {
        this.rtm.start();
    }

    stop(): void {
        this.rtm.stop();
    }

    get messages(): Observable<SlackMessage> {
        return this.rtm.messages;
    }

    get reactionAdded(): Observable<SlackReactionAdded> {
        return this.rtm.reactionAdded;
    }

    get reactionRemoved(): Observable<SlackReactionRemoved> {
        return this.rtm.reactionRemoved;
    }

    async getEmoji(): Promise<{string: string}> {
        return this.web.getEmoji();
    }

    async postMessage(channel: string, text: string): Promise<{string: any}> {
        return this.web.postMessage(channel, text);
    }

}
