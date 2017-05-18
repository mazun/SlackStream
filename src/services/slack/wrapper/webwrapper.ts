import { WebClient } from '@slack/client';

export class WebClientWrapper {
    client: any;

    constructor(private token: string) {
        this.client = new WebClient(token);
    }

    async getEmoji(): Promise<{string: string}> {
        return new Promise<{string: string}>((resolve, reject) => {
            this.client.emoji.list((err, info) => {
                if(err) reject(err);
                else resolve(info.emoji as {string: string});
            })
        });
    }
}
