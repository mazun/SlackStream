import { RtmClient, RTM_EVENTS, MemoryDataStore, CLIENT_EVENTS } from '@slack/client';
import {
    RTMMessage, DataStore, RTMReactionAdded, RTMReactionRemoved,
    RTMEmojiChanged, RTMEmojiAdded, RTMEmojiRemoved, Channel, Group
} from '../slack.types';
import { Subject } from 'rxjs';
import { SlackMessage, SlackReactionAdded, SlackReactionRemoved, SlackEmojiAdded, SlackEmojiRemoved } from '../slack-client';

export class RTMClientWrapper {
    messages = new Subject<SlackMessage>();
    reactionAdded = new Subject<SlackReactionAdded>();
    reactionRemoved = new Subject<SlackReactionRemoved>();
    emojiAdded = new Subject<SlackEmojiAdded>();
    emojiRemoved = new Subject<SlackEmojiRemoved>();
    subTeams: string[] = [];
    channels: Channel[] = [];
    groups: Group[] = [];
    teamID: string;

    client: any;
    get dataStore(): DataStore {
        return this.client.dataStore;
    }

    get memberChannels(): any[] {
        let memberChannels = [];
        for (let i = 0; i < this.channels.length; i++) {
            if (this.channels[i].is_member) {
                memberChannels.push(this.channels[i]);
            }
        }

        for (let i = 0; i < this.groups.length; i++) {
            if (!this.groups[i].is_mpim) {
                memberChannels.push(this.groups[i]);
            }
        }

        return memberChannels;
    }

    constructor(private token: string) {
        this.client = new RtmClient(token, { logLevel: 'debug' }, new MemoryDataStore());
        this.client.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
            console.log(`start ${this.token} ${rtmStartData}`);
            console.log(rtmStartData);
            this.subTeams = rtmStartData.subteams.all.map(s => s.handle);
            this.channels = rtmStartData.channels;
            this.groups = rtmStartData.groups;
            this.teamID = rtmStartData.team.id;
            this.client.dataStore.teamID = rtmStartData.team.id; // for convenience
        });

        this.client.on(RTM_EVENTS.MESSAGE, (message: RTMMessage) => {
            this.messages.next(new SlackMessage(message, this.client.dataStore as DataStore, this.teamID, this.client.activeUserId));
        });

        this.client.on(RTM_EVENTS.REACTION_ADDED, (reaction: RTMReactionAdded) => {
            this.reactionAdded.next(new SlackReactionAdded(reaction, this.client.dataStore as DataStore));
        });

        this.client.on(RTM_EVENTS.REACTION_REMOVED, (reaction: RTMReactionRemoved) => {
            this.reactionRemoved.next(new SlackReactionAdded(reaction, this.client.dataStore as DataStore));
        });

        this.client.on(RTM_EVENTS.EMOJI_CHANGED, (emojiChanged: RTMEmojiChanged) => {
            if (emojiChanged.subtype === 'add') {
                this.emojiAdded.next(new SlackEmojiAdded(emojiChanged as RTMEmojiAdded));
            } else if (emojiChanged.subtype === 'remove') {
                this.emojiRemoved.next(new SlackEmojiRemoved(emojiChanged as RTMEmojiRemoved));
            }
        });
    }

    start(): void {
        this.client.start();
    }

    stop(): void {
        this.client.disconnect();
    }
}
