import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const COLLATOR_OPTIONS: Intl.CollatorOptions = {usage: 'sort', sensitivity: 'base'};

let collator = new Intl.Collator(CONST.LOCALES.DEFAULT, COLLATOR_OPTIONS);

Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: (locale) => {
        collator = new Intl.Collator(locale ?? CONST.LOCALES.DEFAULT, COLLATOR_OPTIONS);
    },
});

/**
 * This is a wrapper around the localeCompare function that uses the preferred locale from the user's settings.
 *
 * It re-uses Intl.Collator with static options for performance reasons. See https://github.com/facebook/hermes/issues/867 for more details.
 * @param a
 * @param b
 * @returns -1 if a < b, 1 if a > b, 0 if a === b
 */
function localeCompare(a: string, b: string) {
    return collator.compare(a, b);
}

export default localeCompare;
