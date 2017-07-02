import { SlackUtil } from './slack-util';
import { EmojiService } from './emoji.service';
import { DataStore } from './slack.types';

export interface SlackParser {
    parse(text: string, dataStore: DataStore): string;
}

export class EmojiParser implements SlackParser {
    constructor(private emojiService: EmojiService) {
    }

    parse(text: string, dataStore: DataStore): string {
        return text.replace(/(:[a-zA-Z0-9_+\-]+:)+/g, (value) => {
            let emoji: string;
            let withTitle: boolean;
            let skinTone: number;
            let ret = '';
            const str = value.substr(1, value.length - 2);

            for (const s of str.split('::')) {
                if (s === 'notitle') { // notitle modifier
                    withTitle = false;
                } else if (s.match('skin-tone-([1-9])')) { // skin-tone modifier
                    skinTone = Number(s.match('skin-tone-([1-9])')[1]);
                } else { // An emoji appears. Print the previous emoji with the found modifiers.
                    if (!!emoji) {
                        ret += this.emojiService.convertEmoji(emoji, withTitle, skinTone);
                    }
                    // Reset modifiers for the next emoji.
                    emoji = ':' + s + ':';
                    withTitle = true;
                    skinTone = 0;
                }
            }

            if (!!emoji) {
                ret += this.emojiService.convertEmoji(emoji, withTitle, skinTone);
            }

            if (ret === '') {
                // something matched but no emoji found (e.g. value == ':notitle:')
                return value;
            } else {
                return ret;
            }
        });
    }
}

export class MarkDownParser implements SlackParser {
    parse(text: string, dataStore: DataStore): string {
        let translated_text = text.replace(/(\B|[_\`>]+)\*([^*]*)\*(\B|[<_\`]+)/g, '$1<span class="md-bold">$2</span>$3');
        translated_text = translated_text.replace(/(\b|[*\`>]+)_([^_]*)_(\b|[<*\`]+)/g, '$1<span class="md-italic">$2</span>$3');
        translated_text = translated_text.replace(/(\B|[*\`>]+)```(?:<br>)?(.*?)```(\B|[<*\`]+)/g, '$1<pre class="md-pre">$2</pre>$3');
        translated_text = translated_text.replace(/(\B|[*\`>]+)`([^`]*)`(\B|[<*\`]+)/g, '$1<code class="md-code">$2</code>$3');
        return translated_text;
    }
}

export class LinkParser implements SlackParser {
    parse(text: string, dataStore: DataStore): string {
        return text.replace(/<([^>]+)>/g, (value: string) => {
            return SlackUtil.parseLink(value, dataStore).withLink;
        });
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
