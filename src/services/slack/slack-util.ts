import { DataStore } from 'services/slack/slack.types';
import * as seedrandom from 'seedrandom';

export class SlackUtil {
    static channelColor(channelName: string): string {
        let res = '#';
        for (let i = 0; i < 3; i++) {
            let rng = seedrandom(channelName + i);
            let colorNum = Math.floor(rng() * 180).toString(16);
            if (colorNum.length === 1) {
                colorNum = '0' + colorNum;
            }
            res += colorNum;
        }
        return res;
    }

    static getImage(url: string, token: string): Promise<string> {
        return undefined;
    }

    static ts2date(ts: string): Date {
        return new Date(Number(ts) * 1000);
    }

    static getChannelName(channelLikeID: string, dataStore: DataStore): string {
        const channel = dataStore.getChannelById(channelLikeID);
        if(channel) { return channel.name; }

        const group = dataStore.getGroupById(channelLikeID);
        if(group) { return group.name; }

        const dm = dataStore.getDMById(channelLikeID);
        if(dm) {
            const user = dataStore.getUserById(dm.user);
            if(user) { return `DM_to_${user.name}`; }
            const bot = dataStore.getBotById(dm.user);
            if(bot) { return `DM_to_${bot.name}`; }
        }

        return '???';
    }
}
