import type {FullySupportedLocale} from '@src/CONST/LOCALES';

import type {Emoji, EmojisList} from './types';

import emojis from './common';

type EmojiTable = Record<string, Emoji>;

type LocaleEmojis = Partial<Record<FullySupportedLocale, EmojisList>>;

const emojiNameTable: EmojiTable = {};
const emojiCodeTableWithSkinTones: EmojiTable = {};
const emojiHexcodeTable: EmojiTable = {};

for (const emoji of emojis) {
    if ('header' in emoji) {
        continue;
    }
    if (emoji.name) {
        emojiNameTable[emoji.name] = emoji;
    }
    emojiCodeTableWithSkinTones[emoji.code] = emoji;
    if (emoji.types) {
        for (const type of emoji.types) {
            emojiCodeTableWithSkinTones[type] = emoji;
        }
    }
    if (emoji.hexcode) {
        emojiHexcodeTable[emoji.hexcode] = emoji;
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
