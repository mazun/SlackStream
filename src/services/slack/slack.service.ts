import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';

import { SettingService } from '../setting.service';
import { SlackClient, SlackClientImpl } from './slack-client';
import { Attachment, MessageReactionTarget, FileReactionTarget, FileCommentReactionTarget } from './slack.types';
import { SlackMessage, SlackReactionAdded, SlackReactionRemoved } from './slack-client';
import { SlackParser, LinkParser, EmojiParser, NewLineParser, MarkDownParser, ComposedParser } from './slack-parser.service';

export class DisplaySlackReactionInfo {
    public showReactedUsers = false;

    constructor(public target: DisplaySlackMessageInfo, public rawReaction: string, public reaction: string, public users: string[]) {
    }

    addUser(user: string) {
        this.removeUser(user);
        this.users.push(user);
    }

    removeUser(user: string) {
        this.users = this.users.filter(u => u !== user);
    }

    get count(): number {
        return this.users.length;
    }

    get includeMine(): boolean {
        return !!(this.users.find(u => u === this.target.message.myUserId));
    }

    get userNames(): string {
        return this.users.map((userID) => {
            return this.target.message.dataStore.getUserById(userID).name;
        }).join(', ');
    }
}

export class DisplaySlackMessageInfo {
    edited: boolean = false;
    image: string = null;
    reactions: DisplaySlackReactionInfo[] = [];

    constructor(
        public message: SlackMessage,
        public parser: SlackParser,
        public client: SlackClient
    ) {
    }

    get text(): string {
        return this.parser.parse(this.message.text, this.message.dataStore);
    }

    get imageSrc(): string {
        return `data:${this.message.rawMessage.file.mimetype};base64,${this.image}`;
    }

    get imageURL(): string {
        return this.message.rawMessage.file.url_private;
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
        const target = this.reactions.find(r => r.reaction === reaction);

        if (target) {
            target.addUser(user);
        } else {
            this.reactions.push(new DisplaySlackReactionInfo(this, info.reaction.reaction, reaction, [user]));
        }
    }

    removeReaction(info: SlackReactionRemoved) {
        const reaction = this.parser.parse(`:${info.reaction.reaction}:`, this.message.dataStore);
        const target = this.reactions.find(r => r.reaction === reaction);

        if (target) {
            target.removeUser(info.reaction.user);

            if (target.count === 0) {
                this.reactions = this.reactions.filter(r => r.reaction !== reaction);
            }
        }
    }
}

class SlackClientInfo {
    started: boolean;
    client: SlackClient;
}

@Injectable()
export class SlackService {
    clients: SlackClient[] = [];
    infos: DisplaySlackMessageInfo[] = [];
    private _onChange = new Subject<SlackService>();
    private subscription = new Subscription();

    get onChange(): Observable<SlackService> {
        return this._onChange;
    }

    constructor(private setting: SettingService, private http: Http) {
        this.refresh();
    }

    refresh() {
        this.subscription.unsubscribe();
        this.subscription = new Subscription();

        const cache: { [token: string]: [SlackClient, boolean] } = {};
        for (const slack of this.clients) {
            cache[slack.token] = [slack, false];
        }

        this.clients = this.setting.tokens.map(token => {
            let client: SlackClient;
            if (cache[token]) {
                client = cache[token][0];
                cache[token][1] = true;
            } else {
                client = new SlackClientImpl(token, this.http) as SlackClient;
                client.start();
            }

            const parser = new ComposedParser([
                new LinkParser(),
                new NewLineParser(),
                new EmojiParser(client.emoji),
                new MarkDownParser()
            ]);

            this.subscription.add(client.messages.subscribe(message => this.onReceiveMessage(message, parser, client)));
            this.subscription.add(client.reactionAdded.subscribe(reaction => this.onReactionAdded(reaction, parser, client)));
            this.subscription.add(client.reactionRemoved.subscribe(reaction => this.onReactionRemoved(reaction, parser, client)));

            return client;
        });

        for (const key of Object.keys(cache)) {
            const info = cache[key];
            if (!info[1]) {
                info[0].stop();
            }
        }
    }

    findReactionTarget(reaction: SlackReactionAdded): DisplaySlackMessageInfo {
        /* tslint:disable:no-switch-case-fall-through */
        switch (reaction.reaction.item.type) {
            case 'message': {
                const target = reaction.reaction.item as MessageReactionTarget;
                return this.infos.find(m => m.message.rawMessage.ts === target.ts);
            }
            case 'file': {
                const target = reaction.reaction.item as FileReactionTarget;
                return this.infos.find(m => {
                    return m.message.subType === 'file_share'
                        && m.message.rawMessage.file
                        && m.message.rawMessage.file.id === target.file;
                });
            }
            case 'file_comment': {
                const target = reaction.reaction.item as FileCommentReactionTarget;
                const message = this.infos.find(m => {
                    return m.message.subType === 'file_comment'
                        && m.message.rawMessage.file
                        && m.message.rawMessage.file.id === target.file
                        && m.message.rawMessage.comment
                        && m.message.rawMessage.comment.id === target.file_comment;
                });
                if (message) {
                    return message;
                }

                // If no such message, the comment may be posted with file at the same time.
                return this.infos.find(m => {
                    return m.message.subType === 'file_share'
                        && m.message.rawMessage.file
                        && m.message.rawMessage.file.id === target.file;
                });
            }
            default: {
                return null;
            }
        }
        /* tslint:enable:no-switch-case-fall-through */
    }

    async onReactionAdded(reaction: SlackReactionAdded, parser: SlackParser, client: SlackClient): Promise<void> {
        const target = this.findReactionTarget(reaction);
        if (target) {
            target.addReaction(reaction);
        }
        console.log(reaction.reaction);
        this._onChange.next(this);
    }

    async onReactionRemoved(reaction: SlackReactionAdded, parser: SlackParser, client: SlackClient): Promise<void> {
        const target = this.findReactionTarget(reaction);
        if (target) {
            target.removeReaction(reaction);
        }
        console.log(reaction.reaction);
        this._onChange.next(this);
    }

    async onReceiveMessage(message: SlackMessage, parser: SlackParser, client: SlackClient): Promise<void> {
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
        this._onChange.next(this);
    }

    async addMessage(message: SlackMessage, parser: SlackParser, client: SlackClient): Promise<void> {
        if (message.message) {
            const info = new DisplaySlackMessageInfo(message, parser, client);
            this.infos.unshift(info);

            if (message.message.file && message.message.file.mimetype.indexOf('image') !== -1) {
                info.image = await client.getImage(this.getMaximumThumbnail(message)).catch(e => {
                    console.log('Getting image does not work in developing mode currently');
                    return undefined;
                });
            }

            client.markRead(message.channelID, message.ts);
            this._onChange.next(this);
        }
    }

    getMaximumThumbnail(message: SlackMessage): string {
        const file = message.rawMessage.file;
        if (file.thumb_480) { return file.thumb_480; }
        if (file.thumb_360) { return file.thumb_360; }
        if (file.thumb_160) { return file.thumb_160; }
        if (file.thumb_80) { return file.thumb_80; }
        if (file.thumb_64) { return file.thumb_64; }
        return '';
    }

    async deleteMessage(message: SlackMessage, client: SlackClient): Promise<void> {
        if (message.message) {
            client.deleteMessage(message.channelID, message.ts);
        }
    }

    async replyMessage(message: SlackMessage, parser: SlackParser, client: SlackClient): Promise<void> {
        // TODO
    }

    async removeDeletedMessage(message: SlackMessage, parser: SlackParser, client: SlackClient): Promise<void> {
        this.infos = this.infos.filter(m => message.rawMessage.deleted_ts !== m.message.rawMessage.ts);
        this._onChange.next(this);
    }

    async changeMessage(message: SlackMessage, parser: SlackParser, client: SlackClient): Promise<void> {
        const edited = this.infos.find(m => m.message.rawMessage.ts === message.rawMessage.message.ts);
        if (edited) {
            edited.edited = true;
            edited.message.text = message.rawMessage.message.text;
            edited.message.rawMessage.attachments = message.rawMessage.message.attachments;
            this._onChange.next(this);
        }
    }
}
