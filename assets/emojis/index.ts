import type {Locale} from '@src/types/onyx';
import emojis from './common';
import type {Emoji, EmojisList} from './types';

type EmojiTable = Record<string, Emoji>;

type LocaleEmojis = Partial<Record<Locale, EmojisList>>;

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

const localeEmojis: LocaleEmojis = {
    en: undefined,
    es: undefined,
};

const importEmojiLocale = (locale: Locale) => {
    if (locale === 'en' && !localeEmojis.en) {
        return import('./en').then((esEmojiModule) => {
            localeEmojis.en = esEmojiModule.default;
        });
    }

    if (locale === 'es' && !localeEmojis.es) {
        return import('./es').then((enEmojiModule) => {
            localeEmojis.es = enEmojiModule.default;
        });
    }
    return Promise.resolve();
};

export default emojis;
export {emojiNameTable, emojiCodeTableWithSkinTones, localeEmojis, importEmojiLocale};
export {skinTones, categoryFrequentlyUsed} from './common';
