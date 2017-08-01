import { DataStore } from './slack.types';
import * as seedrandom from 'seedrandom';

export class ParseLinkResult {
    get withLink(): string {
        return this._withLink ? this._withLink : this.text;
    }

    constructor(public text: string, public _withLink: string = undefined) {
    }
}

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
        // '@user'
        if (channelLikeID[0] === '@') { return `DM_to_${channelLikeID.substr(1)}`; }

        const channel = dataStore.getChannelById(channelLikeID);
        if (channel) { return channel.name; }

        const group = dataStore.getGroupById(channelLikeID);
        if (group) { return group.name; }

        const dm = dataStore.getDMById(channelLikeID);
        if (dm) {
            const user = dataStore.getUserById(dm.user);
            if (user) { return `DM_to_${user.name}`; }
            const bot = dataStore.getBotById(dm.user);
            if (bot) { return `DM_to_${bot.name}`; }
        }

        return '???';
    }

    static parseLink(text: string, dataStore: DataStore): ParseLinkResult {
        text = text.substr(1, text.length - 2);
        const bar = text.indexOf('|');
        if (bar >= 0) {
            const text1 = text.substr(0, bar);
            const text2 = text.substr(bar + 1);
            return this.parseLink2(text1, text2, dataStore);
        } else {
            return this.parseLink1(text, dataStore);
        }
    }

    static parseLink1(text: string, dataStore: DataStore): ParseLinkResult {
        if (text[0] === '@' || text[0] === '!') {
            const user = dataStore.getUserById(text.substr(1));
            if (user) {
                return new ParseLinkResult(`@${user.name}`);
            }
            const bot = dataStore.getBotById(text.substr(1));
            if (bot) {
                return new ParseLinkResult(`@${bot.name}`);
            }
            return new ParseLinkResult('@' + text.substr(1));
        } else if (text[0] === '#') {
            const team = dataStore.getTeamById (dataStore.teamID);
            const channel = dataStore.getChannelById(text.substr(1));
            const color = SlackUtil.channelColor(channel.name);
            const url = `slack://channel?team=${team.id}&id=${channel.id}`;
            // <ss-channelname> does not work...
            const withLink = `<a href = "${url}" class="channel-name" style="color: ${color};">#${channel.name}</a>`;
            return new ParseLinkResult('#' + channel.name, withLink);
        } else {
            return new ParseLinkResult(text, `<a href="${text}">${text}</a>`);
        }
    }

    static parseLink2(text1: string, text2: string, dataStore: DataStore): ParseLinkResult {
        if (text1[0] === '#') {
            const team = dataStore.getTeamById (dataStore.teamID);
            const channel = dataStore.getChannelById(text1.substr(1));
            const color = SlackUtil.channelColor(channel.name);
            const url = `slack://channel?team=${team.id}&id=${channel.id}`;
            // <ss-channelname> does not work...
            const withLink = `<a href = "${url}" class="channel-name" style="color: ${color};">#${channel.name}</a>`;
            return new ParseLinkResult('#' + text2, withLink);
        } else if (text1[0] === '@' || text1[0] === '!') {
            if (text2[0] === '@') {
                return new ParseLinkResult(text2);
            } else {
                return new ParseLinkResult(`@${text2}`);
            }
        } else {
            return new ParseLinkResult(text2, `<a href="${text1}">${text2}</a>`);
        }
    }
}
