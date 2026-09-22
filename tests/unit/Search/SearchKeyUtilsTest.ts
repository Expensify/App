import CONST from '@src/CONST';
import {getSearchKeyForDataType, isExistingSearchKey, savedSearchIDToSearchKey, searchKeyToSavedSearchID} from '@src/libs/SearchKeyUtils';

describe('SearchKeyUtils', () => {
    describe('isExistingSearchKey', () => {
        const suggestedSearchKeys = [CONST.SEARCH.SEARCH_KEYS.EXPENSES, CONST.SEARCH.SEARCH_KEYS.REPORTS];
        const savedSearchIDs = ['12345'];

        it('accepts a suggested search key that is currently visible', () => {
            expect(isExistingSearchKey(CONST.SEARCH.SEARCH_KEYS.EXPENSES, suggestedSearchKeys, savedSearchIDs)).toBe(true);
        });

        it('rejects a valid search key that is not among the visible suggested searches', () => {
            expect(isExistingSearchKey(CONST.SEARCH.SEARCH_KEYS.STATEMENTS, suggestedSearchKeys, savedSearchIDs)).toBe(false);
        });

        it('accepts a saved search key whose ID exists', () => {
            expect(isExistingSearchKey(`${CONST.SEARCH.SAVED_SEARCH_PREFIX}12345`, suggestedSearchKeys, savedSearchIDs)).toBe(true);
        });

        it('rejects a saved search key whose ID no longer exists', () => {
            expect(isExistingSearchKey(`${CONST.SEARCH.SAVED_SEARCH_PREFIX}99999`, suggestedSearchKeys, savedSearchIDs)).toBe(false);
        });

        it('rejects a saved search key when the user has no saved searches', () => {
            expect(isExistingSearchKey(`${CONST.SEARCH.SAVED_SEARCH_PREFIX}12345`, suggestedSearchKeys, [])).toBe(false);
        });

        it('rejects the bare saved search prefix', () => {
            expect(isExistingSearchKey(CONST.SEARCH.SAVED_SEARCH_PREFIX, suggestedSearchKeys, savedSearchIDs)).toBe(false);
        });

        it.each([undefined, ''])('rejects %p', (value) => {
            expect(isExistingSearchKey(value, suggestedSearchKeys, savedSearchIDs)).toBe(false);
        });

        it('rejects an unknown string', () => {
            expect(isExistingSearchKey('someUnknownKey', suggestedSearchKeys, savedSearchIDs)).toBe(false);
        });
    });

    describe('searchKeyToSavedSearchID', () => {
        it('strips the prefix to recover the saved search ID', () => {
            expect(searchKeyToSavedSearchID(`${CONST.SEARCH.SAVED_SEARCH_PREFIX}12345`)).toBe('12345');
        });

        it('returns undefined for a non saved-search key', () => {
            expect(searchKeyToSavedSearchID(CONST.SEARCH.SEARCH_KEYS.EXPENSES)).toBeUndefined();
        });

        it('returns undefined when the key is undefined', () => {
            expect(searchKeyToSavedSearchID(undefined)).toBeUndefined();
        });
    });

    describe('savedSearchIDToSearchKey', () => {
        it('prefixes a saved search ID to build a search key', () => {
            expect(savedSearchIDToSearchKey('12345')).toBe(`${CONST.SEARCH.SAVED_SEARCH_PREFIX}12345`);
        });
    });

    describe('getSearchKeyForDataType', () => {
        it('maps the expense type to the Expenses search', () => {
            expect(getSearchKeyForDataType(CONST.SEARCH.DATA_TYPES.EXPENSE)).toBe(CONST.SEARCH.SEARCH_KEYS.EXPENSES);
        });

        it('maps the expense report type to the Reports search', () => {
            expect(getSearchKeyForDataType(CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT)).toBe(CONST.SEARCH.SEARCH_KEYS.REPORTS);
        });

        it.each([CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TASK, CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.DATA_TYPES.CHAT])(
            'returns undefined for the "%s" type',
            (type) => {
                expect(getSearchKeyForDataType(type)).toBeUndefined();
            },
        );

        it('returns undefined when the type is undefined', () => {
            expect(getSearchKeyForDataType(undefined)).toBeUndefined();
        });
    });
});
