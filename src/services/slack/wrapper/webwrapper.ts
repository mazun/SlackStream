import { WebClient } from '@slack/client';

export class WebClientWrapper {
    client: any;

    constructor(private token: string) {
        this.client = new WebClient(token);
    }

    async postMessage(channel: string, text: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.client.chat.postMessage(channel, text, { 'as_user': true, 'link_names': 1 }, (err, info) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(info);
                }
            })
        });
    }

    async getEmoji(): Promise<{string: string}> {
        return new Promise<{string: string}>((resolve, reject) => {
            this.client.emoji.list((err, info) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(info.emoji as {string: string});
                }
            })
        });
    }

    async markRead(channel: string, timestamp: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
	    this.client.channels.mark(channel, timestamp, (err) => {
		if(err) {
		    reject(err);
		} else {
		    resolve();
		}
	    })
	});
    }
}
