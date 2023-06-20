import _ from 'underscore';
import emojis from './common';
import enEmojis from './en';
import esEmojis from './es';

const emojiNameCodeTable = _.reduce(
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

const localeEmojis = {
    en: enEmojis,
    es: esEmojis,
};

export {emojiNameCodeTable, localeEmojis};
export {skinTones, categoryFrequentlyUsed, default} from './common';
