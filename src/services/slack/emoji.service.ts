import { defaultEmojis } from './default_emoji';
import { SlackClient } from './slack-client';

import * as emojione from 'emojione';
import * as $ from 'jquery';

export class EmojiService {
    emojiList: { string: string };
    defaultEmojis = defaultEmojis;

    get allEmojis(): string[] {
        return defaultEmojis.concat(Object.keys(this.emojiList));
    }

    constructor(private client: SlackClient) {
        this.initExternalEmojis();
    }

    async initExternalEmojis(): Promise<void> {
        if (!this.emojiList) {
            this.emojiList = await this.client.getEmoji();
        }
    }

    convertEmoji(emoji: string, withTitle = true, skinTone = 0): string {
        if (this.emojiList && !!this.emojiList[emoji.substr(1, emoji.length - 2)]) {
            const image_url = this.emojiList[emoji.substr(1, emoji.length - 2)];
            if (image_url.substr(0, 6) === 'alias:') {
                return this.convertEmoji(`:${image_url.substr(6)}:`);
            } else {
                if (withTitle) {
                    return `<img class="emojione" title="${emoji.substr(1, emoji.length - 2)}" src="${image_url}" />`;
                } else {
                    return `<img class="emojione" src="${image_url}" />`;
                }
            }
        } else if (emoji !== emojione.shortnameToImage(emoji)) {
            if (skinTone != 0) {
                emoji = emoji.substr(0, emoji.length - 1) + '_tone' + skinTone + ':';
            }

            let $img = $(emojione.shortnameToImage(emoji));
            if (!withTitle) {
                $img.removeAttr('title');
            }
            return $img[0].outerHTML;
        } else {
            return emoji;
        }
    }
}
