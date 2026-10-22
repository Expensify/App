import type {ListItem} from '@components/SelectionList/types';

import moveInitialSelectionToTop, {shouldMoveInitialSelectionToTop} from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import CONST from '@src/CONST';

import {useState} from 'react';

import useLocalize from './useLocalize';
import useSearchResults from './useSearchResults';

/**
 * @param noResultsMessage Shown above the list when a search matches nothing. Omit it to leave the list blank
 * instead, which is only appropriate when the caller renders its own message for that case.
 */
function useSelectionListSearch<T extends ListItem & {value: string}>(data: T[], noResultsMessage?: string) {
    const {translate} = useLocalize();
    // Snapshot the selected items on the first render that has data (handles async-loaded lists), then keep it frozen
    // so staged selections don't move the pin.
    const [initialSelectedValues, setInitialSelectedValues] = useState<string[] | undefined>(undefined);
    if (initialSelectedValues === undefined && data.length > 0) {
        setInitialSelectedValues(data.filter((item) => item.isSelected).map((item) => item.value));
    }
    // The values actually pinned to the top, so callers share one source of truth instead of re-deriving the pin.
    const pinnedValues = shouldMoveInitialSelectionToTop(data.length) ? (initialSelectedValues ?? []) : [];
    const orderedData = moveInitialSelectionToTop(data, pinnedValues);
    const [searchValue, setSearchValue, filteredData] = useSearchResults(
        orderedData,
        (item, searchInput) => tokenizedSearch([item], searchInput, () => [item.text ?? '', item.value]).length > 0,
    );
    const textInputOptions = {
        label: data.length >= CONST.STANDARD_LIST_ITEM_LIMIT ? translate('common.search') : undefined,
        value: searchValue,
        onChangeText: setSearchValue,
        headerMessage: noResultsMessage && searchValue && filteredData.length === 0 ? noResultsMessage : undefined,
    };
    return {filteredData, textInputOptions, pinnedValues};
}
export default useSelectionListSearch;
