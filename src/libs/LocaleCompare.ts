import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

const DEFAULT_LOCALE = 'en';

const COLLATOR_OPTIONS: Intl.CollatorOptions = {usage: 'sort', sensitivity: 'base'};

let collator = new Intl.Collator(DEFAULT_LOCALE, COLLATOR_OPTIONS);

Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: (locale) => {
        collator = new Intl.Collator(locale ?? DEFAULT_LOCALE, COLLATOR_OPTIONS);
    },
});

function localeCompare(a: string, b: string) {
    return collator.compare(a, b);
}

export default localeCompare;
