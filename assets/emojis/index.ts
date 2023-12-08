import emojis from './common';
import enEmojis from './en';
import esEmojis from './es';
import {Emoji} from './types';

type EmojiTable = Record<string, Emoji>;

const emojiNameTable = emojis.reduce<EmojiTable>((prev, cur) => {
    const newValue = prev;
    if (!('header' in cur) && cur.name) {
        newValue[cur.name] = cur;
    }
    return newValue;
}, {});

const emojiCodeTableWithSkinTones = emojis.reduce<EmojiTable>((prev, cur) => {
    const newValue = prev;
    if (!('header' in cur)) {
        newValue[cur.code] = cur;
    }
    if ('types' in cur && cur.types) {
        cur.types.forEach((type) => {
            newValue[type] = cur;
        });
    }
    return newValue;
}, {});

const localeEmojis = {
    en: enEmojis,
    es: esEmojis,
} as const;

export {emojiNameTable, emojiCodeTableWithSkinTones, localeEmojis};
export {skinTones, categoryFrequentlyUsed, default} from './common';
