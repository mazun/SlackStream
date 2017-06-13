import { DataStore } from 'services/slack/slack.types';
import { SlackUtil } from 'services/slack/slack-util';
import { SlackService, EmojiService } from 'services/slack/slack.service';

export interface SlackParser {
    parse(text: string, dataStore: DataStore): string;
}

export class EmojiParser implements SlackParser {
    constructor(private emojiService: EmojiService) {
    }

    parse(text: string, dataStore: DataStore): string {
        return text.replace(/:[a-zA-Z0-9_+\-]+:/g, (value: string) => {
            return this.emojiService.convertEmoji(value);
        });
    }
}

export class MarkDownParser implements SlackParser {
    parse(text: string, dataStore: DataStore): string {
        let translated_text = text.replace(/(\B|[_\`>]+)\*([^*]*)\*(\B|[<_\`]+)/g, '$1<span class="md-bold">$2</span>$3');
        translated_text = translated_text.replace(/(\b|[*\`>]+)_([^_]*)_(\b|[<*\`]+)/g, '$1<span class="md-italic">$2</span>$3');
        translated_text = translated_text.replace(/(\B|[*\`>]+)```(?:<br>)?(.*)```(\B|[<*\`]+)/g, '$1<pre class="md-pre">$2</pre>$3');
        translated_text = translated_text.replace(/(\B|[*\`>]+)`([^`]*)`(\B|[<*\`]+)/g, '$1<code class="md-code">$2</code>$3');
        return translated_text;
    }
}

export class LinkParser implements SlackParser {
    parse(text: string, dataStore: DataStore): string {
        return text.replace(/<([^>]+)>/g, (value: string) => {
            value = value.substr(1, value.length - 2);
            const bar = value.indexOf('|');
            if (bar >= 0) {
                const text1 = value.substr(0, bar);
                const text2 = value.substr(bar + 1);
                return this.parse2(text1, text2, dataStore);
            } else {
                return this.parse1(value, dataStore);
            }
        });
    }

    parse1(text: string, dataStore: DataStore): string {
        if (text[0] === '@' || text[0] === '!') {
            const user = dataStore.getUserById(text.substr(1));
            if (user) {
                return `@${user.name}`;
            }
            const bot = dataStore.getBotById(text.substr(1));
            if (bot) {
                return `@${bot.name}`;
            }
            return '@' + text.substr(1);
        } else {
            return `<a href="${text}">${text}</a>`;
        }
    }

    parse2(text1: string, text2: string, dataStore: DataStore): string {
        if (text1[0] === '#') {
            const channel = dataStore.getChannelById(text1.substr(1));
            const color = SlackUtil.channelColor(channel.name);
            // <ss-channelname> does not work...
            return `<span class="channel-name" style="color: ${color};">#${text2}</span>`;
        } else if (text1[0] === '@' || text1[0] === '!') {
            if (text2[0] === '@') {
                return text2;
            } else {
                return `@${text2}`;
            }
        } else {
            return `<a href="${text1}">${text2}</a>`;
        }
    }
}

export class NewLineParser implements SlackParser {
    parse(text: string, dataStore: DataStore): string {
        return text
            .replace(/(\r\n|\n|\r)$/, '')
            .replace(/\r\n|\n|\r/g, '<br>');
    }
}

export class ComposedParser implements SlackParser {
    constructor(private parsers: [SlackParser]) {
    }

    parse(text: string, dataStore: DataStore): string {
        if (!text) {
            return text;
        }
        return this.parsers.reduce((res, parser, index, arr) => {
            return parser.parse(res, dataStore);
        }, text);
    }
}
