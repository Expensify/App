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

const emojiCodeTable = _.reduce(
    emojis,
    (prev, cur) => {
        const newValue = prev;
        if (!cur.header) {
            newValue[cur.code] = cur;
        }
        return newValue;
    },
    {},
);

const localeEmojis = {
    en: enEmojis,
    es: esEmojis,
};

export {emojiNameTable, emojiCodeTable, localeEmojis};
export {skinTones, categoryFrequentlyUsed, default} from './common';
