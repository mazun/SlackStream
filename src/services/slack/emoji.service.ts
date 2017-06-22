import { defaultEmojis } from './default_emoji';
import { SlackClient } from './slack-client';

import * as emojione from 'emojione';

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

    convertEmoji(emoji: string): string {
        if (this.emojiList && !!this.emojiList[emoji.substr(1, emoji.length - 2)]) {
            const image_url = this.emojiList[emoji.substr(1, emoji.length - 2)];
            if (image_url.substr(0, 6) === 'alias:') {
                return this.convertEmoji(`:${image_url.substr(6)}:`);
            } else {
                return `<img class="emojione" src="${image_url}" />`;
            }
        } else if (emoji !== emojione.shortnameToImage(emoji)) {
            return emojione.shortnameToImage(emoji);
        } else {
            return emoji;
        }
    }
}
