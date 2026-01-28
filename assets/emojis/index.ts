import type {FullySupportedLocale} from '@src/CONST/LOCALES';
import emojis from './common';
import type {Emoji, EmojisList} from './types';

type EmojiTable = Record<string, Emoji>;

type LocaleEmojis = Partial<Record<FullySupportedLocale, EmojisList>>;

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
        for (const type of cur.types) {
            newValue[type] = cur;
        }
    }
    return newValue;
}, {});

const localeEmojis: LocaleEmojis = {
    en: undefined,
    es: undefined,
};

const importEmojiLocale = (locale: FullySupportedLocale) => {
    if (!localeEmojis[locale]) {
        const emojiImportPromise = locale === 'en' ? import('./en') : import('./es');
        return emojiImportPromise.then((esEmojiModule) => {
            // it is needed because in jest test the modules are imported in double nested default object
            localeEmojis[locale] = esEmojiModule.default.default ? (esEmojiModule.default.default as unknown as EmojisList) : esEmojiModule.default;
        });
    }
    return Promise.resolve();
};

export default emojis;
export {emojiNameTable, emojiCodeTableWithSkinTones, localeEmojis, importEmojiLocale};
export {skinTones, categoryFrequentlyUsed} from './common';
