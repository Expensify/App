import type Locale from '@src/types/onyx/Locale';

/**
 * Options shared by every collator in the app so that sorting stays consistent everywhere.
 */
const COLLATOR_OPTIONS: Intl.CollatorOptions = {usage: 'sort', sensitivity: 'variant', numeric: true, caseFirst: 'upper'};

const collators = new Map<string, Intl.Collator>();

/**
 * Returns a cached collator for the given locale. Collators are cached because constructing an Intl.Collator
 * loads locale data, which is far too expensive to repeat per comparison inside a sort.
 */
function getCollator(locale: Locale | undefined): Intl.Collator {
    const key = locale ?? '';
    const cachedCollator = collators.get(key);
    if (cachedCollator) {
        return cachedCollator;
    }
    const collator = new Intl.Collator(locale, COLLATOR_OPTIONS);
    collators.set(key, collator);
    return collator;
}

export default getCollator;
