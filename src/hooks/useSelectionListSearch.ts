import type {ListItem} from '@components/SelectionList/types';

import tokenizedSearch from '@libs/tokenizedSearch';

import CONST from '@src/CONST';

import useLocalize from './useLocalize';
import useSearchResults from './useSearchResults';

function useSelectionListSearch<T extends ListItem & {value: string}>(data: T[]) {
    const {translate} = useLocalize();
    const filterData = (item: T, searchInput: string) => tokenizedSearch([item], searchInput, () => [item.text ?? '', item.value]).length > 0;
    const [searchValue, setSearchValue, filteredData] = useSearchResults(data, filterData);
    const textInputOptions = {
        label: data.length >= CONST.STANDARD_LIST_ITEM_LIMIT ? translate('common.search') : undefined,
        value: searchValue,
        onChangeText: setSearchValue,
    };
    return {filteredData, textInputOptions};
}
export default useSelectionListSearch;
