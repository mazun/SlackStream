import { SlackMessage, SlackClient } from '../../../services/slack/slack-client';
import { DataStore } from '../../../services/slack/slack.types';
import { EmojiService } from '../../../services/slack/emoji.service';
import { DisplaySlackMessageInfo } from '../../../services/slack/slack.service';
import { SlackUtil } from '../../../services/slack/slack-util';

export interface SubmitContext {
    channelLikeID: string;
    dataStore: DataStore;
    teamID: string;
    ts: string;

    extraInfo: string;
    initialText: string;

    emoji: EmojiService;

    submit(text: string): Promise<any>;

    changeChannelRequest(next: boolean);
    changeMessageRequest(next: boolean);
}

export class PostMessageContext implements SubmitContext {
    constructor(
        public client: SlackClient,
        public channelLikeID: string,
        public teamID: string,
        public ts: string,
        public infos: DisplaySlackMessageInfo[],
    ) {
    }

    get dataStore(): DataStore {
        return this.client.dataStore;
    }

    get emoji(): EmojiService {
        return this.client.emoji;
    }

    get initialText(): string {
        return '';
    }

    get extraInfo(): string {
        return '';
    }

    async submit(text: string): Promise<any> {
        if (text.trim().match(/^\+:(.*):$/)) {
            let reaction = text.trim().match(/^\+:(.*):$/)[1];
            return this.client.addReaction(reaction, this.channelLikeID, this.ts);
        } else if (text.trim().match(/^\-:(.*):$/)) {
            let reaction = text.trim().match(/^\-:(.*):$/)[1];
            return this.client.removeReaction(reaction, this.channelLikeID, this.ts);
        } else {
            return this.client.postMessage(this.channelLikeID, text);
        }
    }

    changeRequest(nextIndexFunc: (i: number) => number) {
        if (this.infos.length === 0) { return; }

        const index = this.infos.findIndex(
            info => info.message.teamID === this.teamID && info.message.channelID === this.channelLikeID && info.message.ts === this.ts
        );
        if (index === -1) { return; }

        const nextIndex = nextIndexFunc(index);
        if (nextIndex < 0) { return; }

        this.channelLikeID = this.infos[nextIndex].message.channelID;
        this.client = this.infos[nextIndex].client;
        this.teamID = this.infos[nextIndex].message.teamID;
        this.ts = this.infos[nextIndex].message.ts;
    }

    changeMessageRequest(next: boolean) {
        this.changeRequest((index) => {
            let nextIndex = next ? index + 1 : index - 1;
            if (nextIndex >= this.infos.length) { nextIndex = 0; }
            if (nextIndex < 0) { nextIndex = this.infos.length - 1; }
            return nextIndex;
        });
    }

    changeChannelRequest(next: boolean) {
        this.changeRequest((index) => {
            let nextIndex = -1;

            if (next) {
                nextIndex = this.infos.slice(index).findIndex((info) => {
                    return info.message.teamID !== this.teamID || info.message.channelID !== this.channelLikeID;
                });

                if (nextIndex < 0) {
                    nextIndex = 0;
                } else {
                    nextIndex += index;
                }
            } else {
                nextIndex = this.infos.slice(0, index).reverse().findIndex((e) => {
                    return e.message.teamID !== this.teamID || e.message.channelID !== this.channelLikeID;
                });

                if (nextIndex < 0) {
                    nextIndex = this.infos.length - 1;
                } else {
                    nextIndex = Math.abs(nextIndex - (index - 1));
                }
            }
            return nextIndex;
        });
    }
}

export class EditMessageContext implements SubmitContext {
    constructor(
        public client: SlackClient,
        public message: SlackMessage,
    ) {
    }

    get dataStore(): DataStore {
        return this.client.dataStore;
    }

    get emoji(): EmojiService {
        return this.client.emoji;
    }

    get channelLikeID(): string {
        return this.message.channelID;
    }

    get channelName(): string {
        return this.message.channelName;
    }

    get channelID(): string {
        return this.message.channelID;
    }

    get teamID(): string {
        return this.message.teamID;
    }

    get ts(): string {
        return this.message.ts;
    }

    get initialText(): string {
        const messageText = this.message.text;
        return messageText.replace(/<([^>]+)>/g, (value: string) => {
            return SlackUtil.parseLink(value, this.client.dataStore).text;
        }).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }

    get extraInfo(): string {
        return '(editing)';
    }

    async submit(text: string): Promise<any> {
        if (text.match(/^\s*$/)) {
            return this.client.deleteMessage(this.message.channelID, this.message.ts);
        } else {
            return this.client.updateMessage(this.message.ts, this.message.channelID, text);
        }
    }

    changeChannelRequest(next: boolean) {
    }

    changeMessageRequest(next: boolean) {
    }
}
