import type {ListItem} from '@components/SelectionList/types';

import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import CONST from '@src/CONST';

import {useState} from 'react';

import useLocalize from './useLocalize';
import useSearchResults from './useSearchResults';

/**
 * @param noResultsMessage Shown above the list when a search matches nothing. Omit it to leave the list blank
 * instead, which is only appropriate when the caller renders its own message for that case.
 * @param shouldAlwaysShowSearch Show the search input whenever the list has data, matching on displayed text only.
 */
function useSelectionListSearch<T extends ListItem & {value: string}>(data: T[], noResultsMessage?: string, shouldAlwaysShowSearch = false) {
    const {translate} = useLocalize();
    // Snapshot the selected items on the first render that has data (handles async-loaded lists), then keep it frozen
    // so staged selections don't move the pin.
    const [initialSelectedValues, setInitialSelectedValues] = useState<string[] | undefined>(undefined);
    if (initialSelectedValues === undefined && data.length > 0) {
        setInitialSelectedValues(data.filter((item) => item.isSelected).map((item) => item.value));
    }
    const minLengthToShowSearch = shouldAlwaysShowSearch ? 1 : CONST.STANDARD_LIST_ITEM_LIMIT;
    // The values actually pinned to the top, so callers share one source of truth instead of re-deriving the pin.
    // SelectionScreen skips the mount-scroll for searchable lists, so the pin must follow search visibility.
    const pinnedValues = data.length >= minLengthToShowSearch ? (initialSelectedValues ?? []) : [];
    const orderedData = moveInitialSelectionToTop(data, pinnedValues, minLengthToShowSearch);
    const [searchValue, setSearchValue, filteredData] = useSearchResults(
        orderedData,
        (item, searchInput) => tokenizedSearch([item], searchInput, () => (shouldAlwaysShowSearch ? [item.text ?? ''] : [item.text ?? '', item.value])).length > 0,
        undefined,
        undefined,
        minLengthToShowSearch,
    );
    const shouldShowSearchInput = data.length >= minLengthToShowSearch;
    const textInputOptions = {
        label: shouldShowSearchInput ? translate('common.search') : undefined,
        value: searchValue,
        onChangeText: setSearchValue,
        headerMessage: noResultsMessage && searchValue && filteredData.length === 0 ? noResultsMessage : undefined,
    };
    return {filteredData, textInputOptions, pinnedValues};
}
export default useSelectionListSearch;
