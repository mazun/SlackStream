import { DisplaySlackMessageInfo } from '../../../services/slack/slack.service';

export interface FilterContext {
    soloMode: boolean;
    shouldShow(info: DisplaySlackMessageInfo): boolean;
}

export class NoFilterContext implements FilterContext {
    get soloMode(): boolean {
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

    shouldShow(info: DisplaySlackMessageInfo): boolean {
        return info.message.channelID === this.channel;
    }
}
