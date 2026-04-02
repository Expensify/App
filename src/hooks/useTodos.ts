// We need direct access to useOnyx from react-native-onyx to avoid using snapshots for live to-do data
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults, TodosDerivedValue} from '@src/types/onyx';
import type {TodoCategorySearchData} from '@src/types/onyx/DerivedValues';

type TodoSearchResultsData = SearchResults['data'];

type TodoResult = {data: TodoSearchResultsData; metadata: TodoCategorySearchData['metadata']};

const emptyResult: TodoResult = {
    data: CONST.EMPTY_OBJECT as TodoSearchResultsData,
    metadata: {count: 0, total: 0, currency: undefined},
};

/**
 * Selector that extracts only the searchData from the derived TODOS value.
 * useOnyx uses deepEqual on selector output, so SearchContextProvider only
 * re-renders when the actual todo search data changes — not on every REPORT_ACTIONS update.
 */
const todosSearchDataSelector = (todos: TodosDerivedValue | undefined) => todos?.searchData;

export default function useTodos() {
    const [todosSearchData] = useOnyx(ONYXKEYS.DERIVED.TODOS, {selector: todosSearchDataSelector});

    const submitKey = CONST.SEARCH.SEARCH_KEYS.SUBMIT;
    const approveKey = CONST.SEARCH.SEARCH_KEYS.APPROVE;
    const payKey = CONST.SEARCH.SEARCH_KEYS.PAY;
    const exportKey = CONST.SEARCH.SEARCH_KEYS.EXPORT;

    return {
        [submitKey]: (todosSearchData?.submit as TodoResult | undefined) ?? emptyResult,
        [approveKey]: (todosSearchData?.approve as TodoResult | undefined) ?? emptyResult,
        [payKey]: (todosSearchData?.pay as TodoResult | undefined) ?? emptyResult,
        [exportKey]: (todosSearchData?.export as TodoResult | undefined) ?? emptyResult,
    };
}
