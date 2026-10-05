import type {ListItem} from '@components/SelectionList/types';

import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import CONST from '@src/CONST';

import useInitialValue from './useInitialValue';
import useLocalize from './useLocalize';
import useSearchResults from './useSearchResults';

/**
 * @param noResultsMessage Shown above the list when a search matches nothing. Omit it to leave the list blank
 * instead, which is only appropriate when the caller renders its own message for that case.
 */
function useSelectionListSearch<T extends ListItem & {value: string}>(data: T[], noResultsMessage?: string) {
    const {translate} = useLocalize();
    // Freeze the items selected when the list opened so they stay pinned while staged selections change and the search
    // filters the list. All pre-selected values are kept so multi-select lists pin every one, not just the first.
    const initialSelectedValues = useInitialValue(() => data.filter((item) => item.isSelected).map((item) => item.value));
    const orderedData = moveInitialSelectionToTop(data, initialSelectedValues);
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
    return {filteredData, textInputOptions};
}
export default useSelectionListSearch;
