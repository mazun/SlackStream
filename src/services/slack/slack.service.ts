import { Injectable } from '@angular/core';

import { RTMClientWrapper } from './wrapper/rtmwrapper';
import { WebClientWrapper } from './wrapper/webwrapper';
import { RTMMessage, DataStore } from './slack.types';
import { Observable } from 'rxjs';
import { SettingService } from '../setting.service';

export class SlackMessage {
    constructor (public message: RTMMessage, public dataStore: DataStore) {
    }

    get text(): string {
        return this.message.text;
    }

    set text(value: string) {
        this.message.text = value;
    }

    get teamName(): string {
        const team = this.dataStore.getTeamById(this.message.team_id || this.message.source_team);
        const teamName = team ? team.name : '???';
        return teamName;
    }

    get userName(): string {
        if(this.message.user) {
            const user = this.dataStore.getUserById(this.message.user);
            return user ? user.name : '???';
        }

        if(this.message.bot_id) {
            const bot = this.dataStore.getBotById(this.message.bot_id);
            return bot ? bot.name : '???';
        }

        return 'slack-bot';
    }

    get userThumbnail(): string {
        if(this.message.user) {
            const user = this.dataStore.getUserById(this.message.user);
            return user ? user.profile.image_32 : '';
        }

        if(this.message.bot_id) {
            const bot = this.dataStore.getBotById(this.message.bot_id);
            return bot ? bot.profile.image_32 : '';
        }
        return '';
    }


    get channelName(): string {
        const channel = this.dataStore.getChannelById(this.message.channel);
        const group = this.dataStore.getGroupById(this.message.channel);
        const channelName = channel ? channel.name : group ? group.name : 'DM';
        return channelName;
    }

    get channelLink(): string {
        const team = this.dataStore.getTeamById(this.message.team_id);
        const channel = this.dataStore.getChannelById(this.message.channel);
        return `slack://channel?team=${team.id}&id=${channel.id}`;
    }

    get subType(): string {
        return this.message.subtype;
    }

    get rawMessage(): RTMMessage {
        return this.message;
    }

    get rawDataStore(): DataStore {
        return this.dataStore;
    }
}

@Injectable()
export class SlackServiceCollection {
    slacks: SlackService[];

    constructor(setting: SettingService) {
        this.slacks = setting.tokens.map(token => {
            return new SlackServiceImpl(token) as SlackService;
        });
    }
}

export interface SlackService {
    messages: Observable<SlackMessage>;
    start(): void;
}

export class SlackServiceImpl implements SlackService {
    private rtm: RTMClientWrapper;
    private web: WebClientWrapper;

    constructor(private token: string) {
        this.rtm = new RTMClientWrapper(token);
        this.web = new WebClientWrapper(token);
    }

    start(): void {
        this.rtm.start();
    }

    get messages(): Observable<SlackMessage> {
        return this.rtm.messages;
    }
}
