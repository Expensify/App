import type {FullySupportedLocale} from '@src/CONST/LOCALES';
import emojis from './common';
import type {Emoji, EmojisList} from './types';

type EmojiTable = Record<string, Emoji>;

type LocaleEmojis = Partial<Record<FullySupportedLocale, EmojisList>>;

const emojiNameTable: EmojiTable = {};
const emojiCodeTableWithSkinTones: EmojiTable = {};
const emojiHexcodeTable: EmojiTable = {};

for (const cur of emojis) {
    if ('header' in cur) {
        continue;
    }
    if (cur.name) {
        emojiNameTable[cur.name] = cur;
    }
    emojiCodeTableWithSkinTones[cur.code] = cur;
    if (cur.types) {
        for (const type of cur.types) {
            emojiCodeTableWithSkinTones[type] = cur;
        }
    }
    if (cur.hexcode) {
        emojiHexcodeTable[cur.hexcode] = cur;
    }
}

const findEmojiByHexCode = (hexcode: string): Emoji | undefined => emojiHexcodeTable[hexcode];

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
export {emojiNameTable, emojiCodeTableWithSkinTones, emojiHexcodeTable, findEmojiByHexCode, localeEmojis, importEmojiLocale};
export {skinTones, categoryFrequentlyUsed} from './common';
