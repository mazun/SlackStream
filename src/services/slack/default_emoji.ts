import { emojioneList } from 'emojione';

export const defaultEmojis = Object.keys(emojioneList).map(s => {
    return s.substr(1, s.length - 2);
});
