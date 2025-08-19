import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

const COLLATOR_OPTIONS: Intl.CollatorOptions = {usage: 'sort', sensitivity: 'variant', numeric: true, caseFirst: 'upper'};

let collator = new Intl.Collator(CONST.LOCALES.DEFAULT, COLLATOR_OPTIONS);

Onyx.connect({
    key: ONYXKEYS.ARE_TRANSLATIONS_LOADING,
    initWithStoredValues: false,
    callback: (areTranslationsLoading) => {
        if (areTranslationsLoading ?? true) {
            return;
        }
        const locale = IntlStore.getCurrentLocale();
        if (!locale) {
            return;
        }
        collator = new Intl.Collator(locale, COLLATOR_OPTIONS);
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
