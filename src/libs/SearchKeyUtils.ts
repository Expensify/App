import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import type {ValueOf} from 'type-fest';

type SearchKey = ValueOf<typeof CONST.SEARCH.SEARCH_KEYS> | `${typeof CONST.SEARCH.SAVED_SEARCH_PREFIX}${string}`;

type ReportKey = `${typeof ONYXKEYS.COLLECTION.REPORT}${string}`;

const TODO_SEARCH_KEYS: ReadonlySet<SearchKey> = new Set([CONST.SEARCH.SEARCH_KEYS.SUBMIT, CONST.SEARCH.SEARCH_KEYS.APPROVE, CONST.SEARCH.SEARCH_KEYS.PAY, CONST.SEARCH.SEARCH_KEYS.EXPORT]);

const DATA_TYPE_TO_SEARCH_KEY: Partial<Record<SearchDataTypes, SearchKey>> = {
    [CONST.SEARCH.DATA_TYPES.EXPENSE]: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
    [CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT]: CONST.SEARCH.SEARCH_KEYS.REPORTS,
    [CONST.SEARCH.DATA_TYPES.TRIP]: CONST.SEARCH.SEARCH_KEYS.TRIPS,
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

/**
 * One stored layout per search, kept across filter changes. Includes the data type, since a saved search can be edited
 * to another type with other columns. Queries matching no search share their data type's layout.
 */
function getSearchColumnResizingID(type: SearchDataTypes, searchKey: SearchKey | undefined): string {
    const dataTypeResizingID = `${CONST.TABLES.COLUMN_RESIZING_IDS.SEARCH_PREFIX}:${type}`;
    return searchKey ? `${dataTypeResizingID}:${searchKey}` : dataTypeResizingID;
}

function isReportEntry(key: string): key is ReportKey {
    return key.startsWith(ONYXKEYS.COLLECTION.REPORT);
}

export {getSearchColumnResizingID, getSearchKeyForDataType, isExistingSearchKey, isReportEntry, savedSearchIDToSearchKey, searchKeyToSavedSearchID, TODO_SEARCH_KEYS};
export type {ReportKey, SearchKey};
