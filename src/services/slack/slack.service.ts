import { Injectable } from '@angular/core';

import { RTMClientWrapper } from './wrapper/rtmwrapper';
import { WebClientWrapper } from './wrapper/webwrapper';
import { RTMMessage, DataStore } from './slack.types';
import { Observable } from 'rxjs';
import { SettingService } from '../setting.service';

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
    messages: Observable<[RTMMessage, DataStore]>;
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

    get messages(): Observable<[RTMMessage, DataStore]> {
        return this.rtm.messages;
    }
}
