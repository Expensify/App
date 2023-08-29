import _ from 'underscore';
import emojis from './common';
import enEmojis from './en';
import esEmojis from './es';

const emojiNameTable = _.reduce(
    emojis,
    (prev, cur) => {
        const newValue = prev;
        if (!cur.header) {
            newValue[cur.name] = cur;
        }
        return newValue;
    },
    {},
);

const emojiCodeTableWithSkinTones = _.reduce(
    emojis,
    (prev, cur) => {
        const newValue = prev;
        if (!cur.header) {
            newValue[cur.code] = cur;
        }
        if (cur.types) {
            cur.types.forEach((type) => {
                newValue[type] = cur;
            });
        }
        return newValue;
    },
    {},
);

const localeEmojis = {
    en: enEmojis,
    es: esEmojis,
};

export {emojiNameTable, emojiCodeTableWithSkinTones, localeEmojis};
export {skinTones, categoryFrequentlyUsed, default} from './common';
