import type {LocaleContextProps} from '@components/LocaleContextProvider';

import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

type SearchPageHeaderTitleDeps = {
    translate: LocaleContextProps['translate'];

    /** The `type` of the current search query, used for the data-type fallbacks */
    type: SearchDataTypes | undefined;

    /** The saved search the current query maps to, if any (from `useSearchTypeMenuSections`) */
    activeSavedSearch: SaveSearchItem | undefined;

    /** The matched suggested-search menu item, if any (only pass when `activeItemIndex >= 0`) */
    selectedItem: SearchTypeMenuItem | undefined;
};

/**
 * Resolves the Search page header title using a single priority chain shared by the wide and narrow headers so the two
 * can't diverge:
 *   a. the active saved search's display name,
 *   b. the matched suggested-search label, then the data-type fallbacks (task / trip / invoice / chat),
 *   c. the generic "Spend" fallback.
 */
function getSearchPageHeaderTitle({translate, type, activeSavedSearch, selectedItem}: SearchPageHeaderTitleDeps): string {
    // a. Active saved search display name. `name` is a display string, not a translation key, so it's used directly
    // (matching the LHN, which renders `item.name` for the `name !== query` case).
    if (activeSavedSearch?.name) {
        return activeSavedSearch.name;
    }

    // b. Matched suggested search.
    if (selectedItem) {
        return translate(selectedItem.translationPath);
    }

    // b (cont.). Data-type fallbacks.
    if (type === CONST.SEARCH.DATA_TYPES.TASK) {
        return translate('common.tasks');
    }
    if (type === CONST.SEARCH.DATA_TYPES.TRIP) {
        return translate('travel.trips');
    }
    if (type === CONST.SEARCH.DATA_TYPES.INVOICE) {
        return translate('workspace.common.invoices');
    }
    if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
        return translate('common.chats');
    }

    // c. Generic fallback.
    return translate('common.spend');
}

export default getSearchPageHeaderTitle;
