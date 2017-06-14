import { DisplaySlackMessageInfo } from '../../../services/slack/slack.service';

export interface FilterContext {
    soloMode: boolean;
    muteMode: boolean;
    shouldShow(info: DisplaySlackMessageInfo): boolean;
}

export class NoFilterContext implements FilterContext {
    get soloMode(): boolean {
        return false;
    }

    get muteMode(): boolean {
        return false;
    }

    shouldShow(info: DisplaySlackMessageInfo): boolean {
        return true;
    }
}

export class SoloChannelFilterContext implements FilterContext {
    constructor(private channel: string) {
    }

    get soloMode(): boolean {
        return true;
    }

    get muteMode(): boolean {
        return false;
    }

    shouldShow(info: DisplaySlackMessageInfo): boolean {
        return info.message.channelID === this.channel;
    }
}

export class MuteChannelFilterContext implements FilterContext {
    constructor(private channel: string) {
    }

    get soloMode(): boolean {
        return false;
    }

    get muteMode(): boolean {
        return true;
    }

    shouldShow(info: DisplaySlackMessageInfo): boolean {
        return info.message.channelID !== this.channel;
    }
}
