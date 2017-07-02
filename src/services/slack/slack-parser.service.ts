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
        return text.replace(/(:[a-zA-Z0-9_+\-]+:)(:[a-zA-Z0-9_+\-]+:)?/g, (whole, first, second) => {
            if (!!second) {
                if (second === ':notitle:') {
                    // notitle modifier
                    return this.emojiService.convertEmoji(first, false);
                } else if (second.match(':skin-tone-[1-9]')) {
                    // skin-tone modifier (TODO)
                    return this.emojiService.convertEmoji(first);
                } else {
                    // two consecutive emojies
                    return this.emojiService.convertEmoji(first) + this.emojiService.convertEmoji(second);
                }
            } else {
                return this.emojiService.convertEmoji(first);
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
