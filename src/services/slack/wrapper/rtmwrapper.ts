import { RtmClient, RTM_EVENTS, MemoryDataStore } from '@slack/client';
import { RTMMessage, DataStore } from '../slack.types';
import { Subject } from 'rxjs';
import { SlackMessage } from '../slack.service';

export class RTMClientWrapper {
    messages: Subject<SlackMessage>;
    client: any;

    constructor(private token: string) {
        this.client = new RtmClient(token, { logLevel: 'debug' }, new MemoryDataStore());
        this.messages = new Subject<SlackMessage>();
    }

    start(): void {
        this.client.start();
        this.client.on(RTM_EVENTS.MESSAGE, async (message: RTMMessage) => {
            this.messages.next(new SlackMessage(message, this.client.dataStore as DataStore));
        });
    }
}
