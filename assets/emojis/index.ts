import getOperatingSystem from '@libs/getOperatingSystem';
import CONST from '@src/CONST';
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

// On windows, flag emojis are not supported
const emojisForOperatingSystem =
    getOperatingSystem() === CONST.OS.WINDOWS
        ? emojis.slice(
              0,
              emojis.findIndex((emoji) => {
                  if (!('header' in emoji)) {
                      return;
                  }

                  return emoji.header && emoji.code === 'flags';
              }),
          )
        : emojis;

export default emojisForOperatingSystem;
export {emojiNameTable, emojiCodeTableWithSkinTones, localeEmojis, emojisForOperatingSystem};
export {skinTones, categoryFrequentlyUsed} from './common';
