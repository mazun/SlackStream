import { WebClient } from '@slack/client';

export class WebClientWrapper {
    client: any;

    constructor(private token: string) {
        this.client = new WebClient(token);
    }

    async postMessage(channel: string, text: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.client.chat.postMessage(channel, text, { 'as_user': true, 'link_names': 1 }, this.handler<any>(resolve, reject));
        });
    }

    async updateMessage(ts: string, channel: string, text: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.client.chat.update(ts, channel, text, { 'as_user': true, 'link_names': 1 }, this.handler<any>(resolve, reject));
        });
    }

    async deleteMessage(channel: string, timestamp: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.client.chat.delete(timestamp, channel, { 'as_user': true }, this.handler<any>(resolve, reject));
        });
    }

    async getEmoji(): Promise<{ string: string }> {
        return new Promise<any>((resolve, reject) => {
            this.client.emoji.list(this.handler<any>(resolve, reject));
        }).then(res => res.emoji);
    }

    async markRead(channel: string, timestamp: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.client.channels.mark(channel, timestamp, this.handler<any>(resolve, reject));
        });
    }

    async markReadDM(channel: string, timestamp: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.client.im.mark(channel, timestamp, this.handler<any>(resolve, reject));
        });
    }

    async markReadGroup(channel: string, timestamp: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.client.groups.mark(channel, timestamp, this.handler<any>(resolve, reject));
        });
    }

    async addReaction(reaction: string, channel: string, ts: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.client.reactions.add(reaction, { 'timestamp': ts, 'channel': channel }, this.handler<any>(resolve, reject));
        });
    }

    async removeReaction(reaction: string, channel: string, ts: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.client.reactions.remove(reaction, { 'timestamp': ts, 'channel': channel }, this.handler<any>(resolve, reject));
        });
    }

    handler<T>(resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void): ((err: any, info: any) => void) {
        return (err, info) => {
            if (err) {
                reject(err);
            } else {
                resolve(info as T);
            }
        }
    }
}
