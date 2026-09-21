import CONST from '@src/CONST';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import type {ValueOf} from 'type-fest';

type SearchKey = ValueOf<typeof CONST.SEARCH.SEARCH_KEYS> | `${typeof CONST.SEARCH.SAVED_SEARCH_PREFIX}${string}`;

const DATA_TYPE_TO_SEARCH_KEY: Partial<Record<SearchDataTypes, SearchKey>> = {
    [CONST.SEARCH.DATA_TYPES.EXPENSE]: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
    [CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT]: CONST.SEARCH.SEARCH_KEYS.REPORTS,
};

function savedSearchIDToSearchKey(id: string): SearchKey {
    return `${CONST.SEARCH.SAVED_SEARCH_PREFIX}${id}`;
}

function searchKeyToSavedSearchID(key: string | undefined) {
    return key?.startsWith(CONST.SEARCH.SAVED_SEARCH_PREFIX) ? key.replace(CONST.SEARCH.SAVED_SEARCH_PREFIX, '') : undefined;
}

function isExistingSearchKey(value: string | undefined, suggestedSearchKeys: SearchKey[], savedSearchIDs: string[]): value is SearchKey {
    if (!value) {
        return false;
    }

    const savedSearchID = searchKeyToSavedSearchID(value);
    if (savedSearchID) {
        return savedSearchIDs.includes(savedSearchID);
    }

    return suggestedSearchKeys.some((searchKey) => searchKey === value);
}

function getSearchKeyForDataType(type: SearchDataTypes | undefined): SearchKey | undefined {
    return type ? DATA_TYPE_TO_SEARCH_KEY[type] : undefined;
}

export {getSearchKeyForDataType, isExistingSearchKey, savedSearchIDToSearchKey, searchKeyToSavedSearchID};
export type {SearchKey};
