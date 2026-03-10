import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';

type SearchDateValues = Record<SearchDateModifier, string | undefined>;

/** Returns a fresh object where all four date modifiers are undefined. */
function getEmptyDateValues(): SearchDateValues {
    return {
        [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
        [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
        [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
        [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
    };
}

/**
 * Returns the display title for the date modifier sub-screen header.
 * Falls back to `fallbackTitle` when no modifier is selected.
 */
function getDateModifierTitle(modifier: SearchDateModifier | null, fallbackTitle: string, translate: LocalizedTranslate): string {
    if (modifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
        return translate('search.filters.date.customRange');
    }
    if (modifier) {
        return translate('search.filters.date.customDate');
    }
    return fallbackTitle;
}

export type {SearchDateValues};
export {getEmptyDateValues, getDateModifierTitle};
