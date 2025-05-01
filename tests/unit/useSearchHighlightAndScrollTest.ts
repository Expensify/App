/* eslint-disable @typescript-eslint/naming-convention */
import {act, renderHook} from '@testing-library/react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {SearchQueryJSON} from '@components/Search/types';
import * as usePreviousModule from '@hooks/usePrevious';
import useSearchHighlightAndScroll from '@hooks/useSearchHighlightAndScroll';
import type {UseSearchHighlightAndScroll} from '@hooks/useSearchHighlightAndScroll';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

// Mock the usePrevious hook
jest.mock('@hooks/usePrevious', () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    default: jest.fn((value) => value),
}));

jest.mock('@src/components/ConfirmedRoute.tsx');

const mockUsePrevious = jest.mocked(usePreviousModule.default);

describe('useSearchHighlightAndScroll', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePrevious.mockImplementation(() => undefined);
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('Transaction search', () => {
        const transactionQueryJSON = {
            type: 'expense',
            status: 'all',
            sortBy: 'date',
            sortOrder: 'desc',
            filters: {operator: 'and', left: 'tag', right: ''},
            inputQuery: 'type:expense status:all sortBy:date sortOrder:desc',
            flatFilters: [],
            hash: 243428839,
            recentSearchHash: 422547233,
        } as SearchQueryJSON;

        it('should initialize with null newSearchResultKey when searchResults is empty', () => {
            const initialProps: UseSearchHighlightAndScroll = {
                searchResults: {
                    data: {personalDetailsList: {}},
                    search: {
                        columnsToShow: {
                            shouldShowCategoryColumn: true,
                            shouldShowTagColumn: true,
                            shouldShowTaxColumn: true,
                        },
                        hasMoreResults: false,
                        hasResults: true,
                        offset: 0,
                        status: 'all',
                        type: 'expense',
                        isLoading: false,
                    },
                },
                queryJSON: transactionQueryJSON,
            };

            const {result} = renderHook(() => useSearchHighlightAndScroll(initialProps));
            expect(result.current.newSearchResultKey).toBeNull();
        });

        it('should detect new transactions and set newSearchResultKey', () => {
            // Initial search results with transaction1
            const initialSearchResults = {
                data: {
                    transaction1: {transactionID: 'transaction1'},
                    personalDetailsList: {},
                },
                search: {
                    columnsToShow: {
                        shouldShowCategoryColumn: true,
                        shouldShowTagColumn: true,
                        shouldShowTaxColumn: true,
                    },
                    hasMoreResults: false,
                    hasResults: true,
                    offset: 0,
                    status: 'all',
                    type: 'expense',
                    isLoading: false,
                },
            };

            // Updated search results with transaction2 added
            const updatedSearchResults = {
                data: {
                    transaction1: {transactionID: 'transaction1'},
                    transaction2: {transactionID: 'transaction2'},
                    personalDetailsList: {},
                },
                search: {
                    columnsToShow: {
                        shouldShowCategoryColumn: true,
                        shouldShowTagColumn: true,
                        shouldShowTaxColumn: true,
                    },
                    hasMoreResults: false,
                    hasResults: true,
                    offset: 0,
                    status: 'all',
                    type: 'expense',
                    isLoading: false,
                },
            };

            // Mock usePrevious to return the initial search results data
            mockUsePrevious.mockImplementation(() => initialSearchResults.data);

            const initialProps: UseSearchHighlightAndScroll = {
                searchResults: initialSearchResults as OnyxEntry<SearchResults>,
                queryJSON: transactionQueryJSON,
            };

            const updatedProps: UseSearchHighlightAndScroll = {
                searchResults: updatedSearchResults as OnyxEntry<SearchResults>,
                queryJSON: transactionQueryJSON,
            };

            const {result, rerender} = renderHook((props) => useSearchHighlightAndScroll(props), {
                initialProps,
            });

            // Rerender with updated search results
            rerender(updatedProps);

            // Check if newSearchResultKey is set correctly
            expect(result.current.newSearchResultKey).toBe(`${ONYXKEYS.COLLECTION.TRANSACTION}transaction2`);

            // Reset timer to verify it clears newSearchResultKey
            act(() => {
                jest.runAllTimers();
            });

            expect(result.current.newSearchResultKey).toBeNull();
        });

        it('should not highlight already highlighted transactions', () => {
            // Initial search results
            const initialSearchResults = {
                data: {
                    transaction1: {transactionID: 'transaction1'},
                    personalDetailsList: {},
                },
                search: {
                    columnsToShow: {
                        shouldShowCategoryColumn: true,
                        shouldShowTagColumn: true,
                        shouldShowTaxColumn: true,
                    },
                    hasMoreResults: false,
                    hasResults: true,
                    offset: 0,
                    status: 'all',
                    type: 'expense',
                    isLoading: false,
                },
            };

            // Updated search results with transaction2 added
            const updatedSearchResults = {
                data: {
                    transaction1: {transactionID: 'transaction1'},
                    transaction2: {transactionID: 'transaction2'},
                    personalDetailsList: {},
                },
                search: {
                    columnsToShow: {
                        shouldShowCategoryColumn: true,
                        shouldShowTagColumn: true,
                        shouldShowTaxColumn: true,
                    },
                    hasMoreResults: false,
                    hasResults: true,
                    offset: 0,
                    status: 'all',
                    type: 'expense',
                    isLoading: false,
                },
            };

            // Another update adding transaction3
            const furtherUpdatedSearchResults = {
                data: {
                    transaction1: {transactionID: 'transaction1'},
                    transaction2: {transactionID: 'transaction2'},
                    transaction3: {transactionID: 'transaction3'},
                    personalDetailsList: {},
                },
                search: {
                    columnsToShow: {
                        shouldShowCategoryColumn: true,
                        shouldShowTagColumn: true,
                        shouldShowTaxColumn: true,
                    },
                    hasMoreResults: false,
                    hasResults: true,
                    offset: 0,
                    status: 'all',
                    type: 'expense',
                    isLoading: false,
                },
            };

            // Mock usePrevious to return the initial search results data
            mockUsePrevious.mockImplementation(() => initialSearchResults.data);

            const initialProps: UseSearchHighlightAndScroll = {
                searchResults: initialSearchResults as OnyxEntry<SearchResults>,
                queryJSON: transactionQueryJSON,
            };

            const {result, rerender} = renderHook((props) => useSearchHighlightAndScroll(props), {
                initialProps,
            });

            // Rerender with updated search results
            rerender({
                searchResults: updatedSearchResults as OnyxEntry<SearchResults>,
                queryJSON: transactionQueryJSON,
            });

            // Check if newSearchResultKey is set correctly for transaction2
            expect(result.current.newSearchResultKey).toBe(`${ONYXKEYS.COLLECTION.TRANSACTION}transaction2`);

            // Run timers to clear highlight
            act(() => {
                jest.runAllTimers();
            });

            // Update previous search results mock
            mockUsePrevious.mockImplementation(() => updatedSearchResults.data);

            // Rerender with further updated search results
            rerender({
                searchResults: furtherUpdatedSearchResults as OnyxEntry<SearchResults>,
                queryJSON: transactionQueryJSON,
            });

            // Check if newSearchResultKey is set correctly for transaction3
            expect(result.current.newSearchResultKey).toBe(`${ONYXKEYS.COLLECTION.TRANSACTION}transaction3`);
        });

        it('should handle nested transactions in report items', () => {
            // Initial search results with nested transactions
            const initialSearchResults = {
                data: {
                    report1: {
                        reportID: 'report1',
                        transactions: [{transactionID: 'transaction1'}],
                    },
                    personalDetailsList: {},
                },
                search: {
                    columnsToShow: {
                        shouldShowCategoryColumn: true,
                        shouldShowTagColumn: true,
                        shouldShowTaxColumn: true,
                    },
                    hasMoreResults: false,
                    hasResults: true,
                    offset: 0,
                    status: 'all',
                    type: 'expense',
                    isLoading: false,
                },
            };

            // Updated search results with a new nested transaction
            const updatedSearchResults = {
                data: {
                    report1: {
                        reportID: 'report1',
                        transactions: [{transactionID: 'transaction1'}, {transactionID: 'transaction2'}],
                    },
                    personalDetailsList: {},
                },
                search: {
                    columnsToShow: {
                        shouldShowCategoryColumn: true,
                        shouldShowTagColumn: true,
                        shouldShowTaxColumn: true,
                    },
                    hasMoreResults: false,
                    hasResults: true,
                    offset: 0,
                    status: 'all',
                    type: 'expense',
                    isLoading: false,
                },
            };

            // Mock usePrevious to return the initial search results data
            mockUsePrevious.mockImplementation(() => initialSearchResults.data);

            const initialProps: UseSearchHighlightAndScroll = {
                searchResults: initialSearchResults as OnyxEntry<SearchResults>,
                queryJSON: transactionQueryJSON,
            };

            const {result, rerender} = renderHook((props) => useSearchHighlightAndScroll(props), {
                initialProps,
            });

            // Rerender with updated search results
            rerender({
                searchResults: updatedSearchResults as OnyxEntry<SearchResults>,
                queryJSON: transactionQueryJSON,
            });

            // Check if newSearchResultKey is set correctly
            expect(result.current.newSearchResultKey).toBe(`${ONYXKEYS.COLLECTION.TRANSACTION}transaction2`);
        });
    });
});
