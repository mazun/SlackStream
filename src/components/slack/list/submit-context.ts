import { SlackMessage, SlackClient } from '../../../services/slack/slack-client';
import { DataStore } from '../../../services/slack/slack.types';
import { EmojiService } from '../../../services/slack/emoji.service';
import { DisplaySlackMessageInfo } from '../../../services/slack/slack.service';

export interface SubmitContext {
    channelLikeID: string;
    dataStore: DataStore;
    teamID: string;

    extraInfo: string;
    initialText: string;

    emoji: EmojiService;

    submit(text: string): Promise<any>;

    changeChannelRequest(next: boolean);
}

export class PostMessageContext implements SubmitContext {
    constructor(
        public client: SlackClient,
        public channelLikeID: string,
        public teamID: string,
        public infos: DisplaySlackMessageInfo[],
    ) {
    }

    get dataStore(): DataStore {
        return this.client.dataStore;
    }

    get emoji(): EmojiService {
        return this.client.emoji;
    }

    get lastMessageTs(): string {
        for (let i = 0; i < this.infos.length; i++) {
            if (this.infos[i].message.channelID === this.channelLikeID) {
                return this.infos[i].message.ts;
            }
        }
        return '';
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
            return this.client.addReaction(reaction, this.channelLikeID, this.lastMessageTs);
        } else if (text.trim().match(/^\-:(.*):$/)) {
            let reaction = text.trim().match(/^\-:(.*):$/)[1];
            return this.client.removeReaction(reaction, this.channelLikeID, this.lastMessageTs);
        } else {
            return this.client.postMessage(this.channelLikeID, text);
        }
    }

    changeChannelRequest(next: boolean) {
        const channels: [string, SlackClient, string][] = [];
        for (const info of this.infos) {
            if (!channels.find(c => c[0] === info.message.channelID)) {
                channels.push([info.message.channelID, info.client, info.message.teamID]);
            }
        }

        if (channels.length === 0) { return; }

        const index = channels.findIndex(c => c[0] === this.channelLikeID);

        const nextIndex = (index + (next ? 1 : -1) + channels.length) % channels.length;
        this.channelLikeID = channels[nextIndex][0];
        this.client = channels[nextIndex][1];
        this.teamID = channels[nextIndex][2];
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

    get initialText(): string {
        const messageText = this.message.text;
        return messageText.replace(/<([^>]+)>/g, (value: string) => {
            value = value.substr(1, value.length - 2);
            const bar = value.indexOf('|');
            if (bar >= 0) {
                // Channel: <#XXYYZZ|channel>  =>  #channel
                if (value[0] === '#') {
                    return '#' + value.substr(bar + 1);
                    // Url with no 'http': <http://github.com|github.com>  =>  github.com
                } else {
                    return value.substr(bar + 1);
                }
            } else {
                // Full url: <https://github.com>  =>  https://github.com
                return value;
            }
        }).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }

    get extraInfo(): string {
        return '(editing)';
    }

    async submit(text: string): Promise<any> {
        return this.client.updateMessage(this.message.ts, this.message.channelID, text);
    }

    changeChannelRequest(next: boolean) {
    }
}
