import { RtmClient, RTM_EVENTS, MemoryDataStore, CLIENT_EVENTS } from '@slack/client';
import { RTMMessage, DataStore, RTMReactionAdded, RTMReactionRemoved } from '../slack.types';
import { Subject } from 'rxjs';
import { SlackMessage, SlackReactionAdded, SlackReactionRemoved } from '../slack.service';

export class RTMClientWrapper {
    messages = new Subject<SlackMessage> ();
    reactionAdded = new Subject<SlackReactionAdded> ();
    reactionRemoved = new Subject<SlackReactionRemoved> ();

    client: any;

    constructor(private token: string) {
        this.client = new RtmClient(token, { logLevel: 'debug' }, new MemoryDataStore());
    }

    start(): void {
        this.client.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
            console.log(`start ${this.token} ${rtmStartData}`);
        });

        this.client.on(RTM_EVENTS.MESSAGE, (message: RTMMessage) => {
            this.messages.next(new SlackMessage(message, this.client.dataStore as DataStore, this.client.activeUserId));
        });

        this.client.on(RTM_EVENTS.REACTION_ADDED, (reaction: RTMReactionAdded) => {
            this.reactionAdded.next(new SlackReactionAdded(reaction, this.client.dataStore as DataStore));
        });

        this.client.on(RTM_EVENTS.REACTION_REMOVED, (reaction: RTMReactionRemoved) => {
            this.reactionRemoved.next(new SlackReactionAdded(reaction, this.client.dataStore as DataStore));
        });

        this.client.start();
    }

    stop(): void {
        this.client.stop();
    }
}
