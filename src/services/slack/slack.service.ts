import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { RTMClientWrapper } from 'services/slack/wrapper/rtmwrapper';
import { WebClientWrapper } from 'services/slack/wrapper/webwrapper';
import { RTMMessage, DataStore, Team, RTMReactionAdded, RTMReactionRemoved, Channel } from './slack.types';
import { Observable } from 'rxjs';
import { SettingService } from 'services/setting.service';
import { DisplaySlackMessageInfo } from 'components/slack/list/slacklist.component';
import { defaultEmojis } from 'services/slack/default_emoji';
import { SlackUtil } from 'services/slack/slack-util';

import * as emojione from 'emojione';

export class SlackMessage {
    constructor(public message: RTMMessage, public dataStore: DataStore, public myUserId: string) {
    }

    get text(): string {
        if (this.message.text) {
            return this.message.text;
        } else if (this.rawMessage.attachments) {
            for (const attachment of this.rawMessage.attachments) {
                if (attachment.pretext) {
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

    get shortTeamName(): string {
        return this.team ? this.team.name[0] : '?';
    }

    get teamHasThumbnail(): boolean {
        return this.team ? !this.team.icon.image_default : false;
    }

    get teamThumbnail(): string {
        return this.team ? this.team.icon.image_68 : '';
    }

    get teamID(): string {
        return this.message.team_id || this.message.source_team || this.message.team || '';
    }

    get channel(): Channel {
        return this.dataStore.getChannelById(this.channelID);
    }

    get channelID(): string {
        return this.message.channel;
    }

    get userName(): string {
        if (this.message.comment) {
            const user = this.dataStore.getUserById(this.message.comment.user);
            return user ? user.name : '???';
        }

        if (this.message.user) {
            const user = this.dataStore.getUserById(this.message.user);
            return user ? user.name : '???';
        }

        if (this.message.bot_id) {
            const bot = this.dataStore.getBotById(this.message.bot_id);
            return bot ? bot.name : '???';
        }

        return 'slack-bot';
    }

    get userThumbnail(): string {
        if (this.message.comment) {
            const user = this.dataStore.getUserById(this.message.comment.user);
            return user ? user.profile.image_48 : '';
        }

        if (this.message.user) {
            const user = this.dataStore.getUserById(this.message.user);
            return user ? user.profile.image_48 : '';
        }

        if (this.message.bot_id) {
            const bot = this.dataStore.getBotById(this.message.bot_id);
            return bot ? bot.icons.image_48 : '';
        }
        return 'https://ca.slack-edge.com/T2T2ETX4H-USLACKBOT-sv1444671949-48';
    }


    get channelName(): string {
        return SlackUtil.getChannelName(this.message.channel, this.dataStore);
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

    get mine(): boolean {
        return this.message.user === this.myUserId;
    }
}

export class SlackReactionAdded {
    constructor(public reaction: RTMReactionAdded, public dataStore: DataStore) {
    }
}

export class SlackReactionRemoved {
    constructor(public reaction: RTMReactionRemoved, public dataStore: DataStore) {
    }
}

@Injectable()
export class SlackServiceCollection {
    slacks: SlackService[] = [];
    savedInfos: DisplaySlackMessageInfo[] = [];

    constructor(private setting: SettingService, private http: Http) {
        this.refresh();
    }

    refresh() {
        const cache: {[token: string]: SlackService} = {};
        for(const slack of this.slacks) {
            cache[slack.token] = slack;
        }

        this.slacks = this.setting.tokens.map(token => {
            return cache[token] ? cache[token] : new SlackServiceImpl(token, this.http) as SlackService;
        });
    }
}

export interface SlackService {
    messages: Observable<SlackMessage>;
    reactionAdded: Observable<SlackReactionAdded>;
    reactionRemoved: Observable<SlackReactionRemoved>;
    emoji: EmojiService;
    token: string;
    dataStore: DataStore;

    start(): void;
    stop(): void;
    getEmoji(): Promise<{ string: string }>;
    postMessage(channel: string, text: string): Promise<{ string: any }>;
    deleteMessage(channel: string, timestamp: string): Promise<void>;
    markRead(channel: string, timestamp: string): Promise<void>;
    addReaction(reaction: string, channel: string, ts: string): Promise<void>;
    removeReaction(reaction: string, channel: string, ts: string): Promise<void>;
    updateMessage(ts: string, channel: string, text: string): Promise<any>
    getImage(url: string): Promise<string>;
}

export class EmojiService {
    emojiList: { string: string };
    defaultEmojis = defaultEmojis;

    get allEmojis(): string[] {
        return defaultEmojis.concat(Object.keys(this.emojiList));
    }

    constructor(private client: SlackService) {
        this.initExternalEmojis();
    }

    async initExternalEmojis(): Promise<void> {
        if (!this.emojiList) {
            this.emojiList = await this.client.getEmoji();
        }
    }

    convertEmoji(emoji: string): string {
        if (emoji !== emojione.shortnameToImage(emoji)) {
            return emojione.shortnameToImage(emoji);
        } else if (this.emojiList && !!this.emojiList[emoji.substr(1, emoji.length - 2)]) {
            let image_url = this.emojiList[emoji.substr(1, emoji.length - 2)];
            if(image_url.substr(0, 6) === 'alias:') {
                return this.convertEmoji(`:${image_url.substr(6)}:`);
            } else {
                return `<img class="emojione" src="${image_url}" />`;
            }
        } else {
            return emoji;
        }
    }
}

export class SlackServiceImpl implements SlackService {
    rtm: RTMClientWrapper;
    web: WebClientWrapper;
    emoji: EmojiService;

    constructor(public token: string, private http: Http) {
        this.rtm = new RTMClientWrapper(token);
        this.web = new WebClientWrapper(token, http);
        this.emoji = new EmojiService(this);
    }

    start(): void {
        this.rtm.start();
    }

    stop(): void {
        this.rtm.stop();
    }

    get dataStore(): DataStore {
        return this.rtm.dataStore;
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

    async getEmoji(): Promise<{ string: string }> {
        return this.web.getEmoji();
    }

    async postMessage(channel: string, text: string): Promise<{ string: any }> {
        return this.web.postMessage(channel, text);
    }

    async deleteMessage(channel: string, timestamp: string): Promise<void> {
        return this.web.deleteMessage(channel, timestamp);
    }

    async markRead(channel: string, timestamp: string): Promise<void> {
        const dataStore = this.rtm.dataStore;
        if (dataStore.getChannelById(channel)) {
            return this.web.markRead(channel, timestamp);
        } else if(dataStore.getDMById(channel)) {
            return this.web.markReadDM(channel, timestamp);
        } else {
            return this.web.markReadGroup(channel, timestamp);
        }
    }

    async addReaction(reaction: string, channel: string, ts: string): Promise<void> {
        return this.web.addReaction(reaction, channel, ts);
    }

    async removeReaction(reaction: string, channel: string, ts: string): Promise<void> {
        return this.web.removeReaction(reaction, channel, ts);
    }

    async updateMessage(ts: string, channel: string, text: string): Promise<any> {
        return this.web.updateMessage(ts, channel, text);
    }

    async getImage(url: string): Promise<string> {
        return this.web.getImage(url);
    }
}
