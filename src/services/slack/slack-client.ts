import { Http } from '@angular/http';
import { Observable } from 'rxjs';

import { RTMClientWrapper } from './wrapper/rtmwrapper';
import { WebClientWrapper } from './wrapper/webwrapper';
import { EmojiService } from './emoji.service';
import { RTMMessage, DataStore, Team, RTMReactionAdded, RTMReactionRemoved,
         RTMEmojiAdded, RTMEmojiRemoved, Channel } from './slack.types';
import { SlackUtil } from './slack-util';
import { SlackParser } from './slack-parser.service';

export class SlackReactionAdded {
    constructor(public reaction: RTMReactionAdded, public dataStore: DataStore) {
    }
}

export class SlackReactionRemoved {
    constructor(public reaction: RTMReactionRemoved, public dataStore: DataStore) {
    }
}

export class SlackEmojiAdded {
    constructor(public emojiAdded: RTMEmojiAdded) {
    }
}

export class SlackEmojiRemoved {
    constructor(public emojiRemoved: RTMEmojiRemoved) {
    }
}

export class SlackMessage {
    constructor(public message: RTMMessage, public dataStore: DataStore, public teamID: string, public myUserId: string) {
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

    get channel(): Channel {
        return this.dataStore.getChannelById(this.channelID);
    }

    get channelID(): string {
        return this.message.channel;
    }

    get userName(): string {
        if (this.message.comment) {
            const user = this.dataStore.getUserById(this.message.comment.user);
            if (user !== undefined) {
                return (user.profile.display_name !== '' ? user.profile.display_name : user.profile.real_name);
            } else {
                return '???';
            }
        }

        if (this.message.user) {
            const user = this.dataStore.getUserById(this.message.user);
            if (user !== undefined) {
                return (user.profile.display_name !== '' ? user.profile.display_name : user.profile.real_name);
            } else {
                return '???';
            }
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

    get subType(): string {
        return this.message.subtype;
    }

    get ts(): string {
        return this.message.ts;
    }

    get threadTs(): string {
        return this.message.thread_ts;
    }

    get isThread(): boolean {
        return (this.threadTs !== undefined);
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

export interface SlackClient {
    messages: Observable<SlackMessage>;
    reactionAdded: Observable<SlackReactionAdded>;
    reactionRemoved: Observable<SlackReactionRemoved>;
    emojiAdded: Observable<SlackEmojiAdded>;
    emojiRemoved: Observable<SlackEmojiRemoved>;
    emoji: EmojiService;
    token: string;
    dataStore: DataStore;
    subTeams: string[];
    attachmentTextParser: SlackParser;

    start(): void;
    stop(): void;
    getEmoji(): Promise<{ string: string }>;
    postMessage(channel: string, text: string): Promise<{ string: any }>;
    deleteMessage(channel: string, timestamp: string): Promise<void>;
    markRead(channel: string, timestamp: string): Promise<void>;
    addReaction(reaction: string, channel: string, ts: string): Promise<void>;
    removeReaction(reaction: string, channel: string, ts: string): Promise<void>;
    updateMessage(ts: string, channel: string, text: string): Promise<any>;
    getImage(url: string): Promise<string>;
}

export class SlackClientImpl implements SlackClient {
    rtm: RTMClientWrapper;
    web: WebClientWrapper;
    emoji: EmojiService;
    attachmentTextParser: SlackParser;

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

    get emojiAdded(): Observable<SlackEmojiAdded> {
        return this.rtm.emojiAdded;
    }

    get emojiRemoved(): Observable<SlackEmojiRemoved> {
        return this.rtm.emojiRemoved;
    }

    get subTeams(): string[] {
        return this.rtm.subTeams;
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
        } else if (dataStore.getDMById(channel)) {
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
