import { RtmClient, RTM_EVENTS, MemoryDataStore } from '@slack/client';
import { RTMMessage, DataStore } from '../slack.types';
import { Subject } from 'rxjs';

export class RTMClientWrapper {
    messages: Subject<[RTMMessage, DataStore]>; // FIXME: Don't use any
    client: any;

    constructor(private token: string) {
        this.client = new RtmClient(token, { logLevel: 'debug' }, new MemoryDataStore());
        this.messages = new Subject<[RTMMessage, DataStore]>();
    }

    start(): void {
        this.client.start();
        this.client.on(RTM_EVENTS.MESSAGE, async (message: RTMMessage) => {
            this.messages.next([message, this.client.dataStore as DataStore]);
        });
    }
}
