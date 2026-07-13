/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';

import useSearchAutoRefetch from '@hooks/useSearchAutoRefetch';
import type {UseSearchAutoRefetchParams} from '@hooks/useSearchAutoRefetch';

import {search} from '@libs/actions/Search';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

const mockUseIsFocused = jest.fn((): boolean => true);
const mockUseNetwork = jest.fn((): {isOffline: boolean} => ({isOffline: false}));

jest.mock('@libs/actions/Search');
jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => mockUseNetwork(),
}));
jest.mock('@react-navigation/native', () => ({
    useIsFocused: () => mockUseIsFocused(),
    createNavigationContainerRef: () => ({}),
}));
// The unfocused path also consults isSearchTopmostFullScreenRoute (an RHP over Search keeps refetching);
// the stubbed navigationRef above can't answer that, so model "not on Search" explicitly.
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));
jest.mock('@rnmapbox/maps', () => ({
    __esModule: true,
    default: {},
    MarkerView: {},
    setAccessToken: jest.fn(),
}));

beforeEach(() => {
    mockUseIsFocused.mockReturnValue(true);
    mockUseNetwork.mockReturnValue({isOffline: false});
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('useSearchAutoRefetch', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    const baseProps: UseSearchAutoRefetchParams = {
        searchResults: {
            data: {
                personalDetailsList: {},
            },
            search: {
                hasMoreResults: false,
                hasResults: true,
                offset: 0,
                hash: 0,
                type: 'expense',
                isLoading: false,
            },
        },
        transactions: {},
        previousTransactions: {},
        reportActions: {},
        previousReportActions: {},
        queryJSON: {
            type: 'expense',
            sortBy: 'date',
            sortOrder: 'desc',
            filters: {operator: 'and', left: 'tag', right: ''},
            inputQuery: 'type:expense',
            flatFilters: [],
            hash: 123,
            recentSearchHash: 456,
            similarSearchHash: 789,
            view: 'table',
        },
        searchKey: undefined,
        shouldCalculateTotals: false,
        offset: 0,
    };

    it('should not trigger search when collections are empty', () => {
        renderHook(() => useSearchAutoRefetch(baseProps));
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search when new transaction added and focused', () => {
        const initialProps = {
            ...baseProps,
            transactions: {'1': {transactionID: '1'}},
            previousTransactions: {'1': {transactionID: '1'}},
        };

        const {rerender} = renderHook((props: UseSearchAutoRefetchParams) => useSearchAutoRefetch(props), {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            initialProps,
        });

        const updatedProps = {
            ...baseProps,
            transactions: {
                '1': {transactionID: '1'},
                '2': {transactionID: '2'},
            },
            previousTransactions: {'1': {transactionID: '1'}},
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(search).toHaveBeenCalledWith({queryJSON: baseProps.queryJSON, searchKey: undefined, offset: 0, shouldCalculateTotals: false, isLoading: false});
    });

    it('should not trigger search when not focused', () => {
        mockUseIsFocused.mockReturnValue(false);

        // Non-empty previous data so the hook gets past the initial-load early return and the focus
        // check is what actually suppresses the search.
        const initialProps = {
            ...baseProps,
            transactions: {'1': {transactionID: '1'}},
            previousTransactions: {'1': {transactionID: '1'}},
        };

        const {rerender} = renderHook((props: UseSearchAutoRefetchParams) => useSearchAutoRefetch(props), {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            initialProps,
        });

        const updatedProps = {
            ...initialProps,
            transactions: {
                '1': {transactionID: '1'},
                '2': {transactionID: '2'},
            },
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search for chat when report actions added and focused', () => {
        const chatProps = {
            ...baseProps,
            queryJSON: {...baseProps.queryJSON, type: 'chat' as const},
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'EXISTING', reportActionID: '1'},
                },
            },
            previousReportActions: {
                reportActions_1: {
                    '1': {actionName: 'EXISTING', reportActionID: '1'},
                },
            },
        };

        const {rerender} = renderHook((props: UseSearchAutoRefetchParams) => useSearchAutoRefetch(props), {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            initialProps: chatProps,
        });

        const updatedProps = {
            ...chatProps,
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'EXISTING', reportActionID: '1'},
                    '2': {actionName: 'ADDCOMMENT', reportActionID: '2'},
                },
            },
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(search).toHaveBeenCalledWith({queryJSON: chatProps.queryJSON, searchKey: undefined, offset: 0, shouldCalculateTotals: false, isLoading: false});
    });

    it('should not trigger search when new transaction removed and focused', () => {
        const initialProps = {
            ...baseProps,
            transactions: {
                '1': {transactionID: '1'},
                '2': {transactionID: '2'},
            },
            previousTransactions: {
                '1': {transactionID: '1'},
                '2': {transactionID: '2'},
            },
        };

        const {rerender} = renderHook((props: UseSearchAutoRefetchParams) => useSearchAutoRefetch(props), {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            initialProps,
        });

        const updatedProps = {
            ...baseProps,
            transactions: {
                '1': {transactionID: '1'},
            },
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should defer search while offline and fire it exactly once after reconnect', () => {
        mockUseNetwork.mockReturnValue({isOffline: true});

        const initialProps = {
            ...baseProps,
            transactions: {'1': {transactionID: '1'}},
            previousTransactions: {'1': {transactionID: '1'}},
        };

        const {rerender} = renderHook((props: UseSearchAutoRefetchParams) => useSearchAutoRefetch(props), {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            initialProps,
        });

        // A new transaction lands while offline: the search must be stashed, not fired.
        const offlineChangeProps = {
            ...baseProps,
            transactions: {
                '1': {transactionID: '1'},
                '2': {transactionID: '2'},
            },
            previousTransactions: {'1': {transactionID: '1'}},
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(offlineChangeProps);
        expect(search).not.toHaveBeenCalled();

        // Reconnect with the diff no longer detectable (previous caught up) - only the pending
        // flag stashed while offline can trigger the search now.
        mockUseNetwork.mockReturnValue({isOffline: false});
        const reconnectedProps = {
            ...baseProps,
            transactions: {
                '1': {transactionID: '1'},
                '2': {transactionID: '2'},
            },
            previousTransactions: {
                '1': {transactionID: '1'},
                '2': {transactionID: '2'},
            },
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(reconnectedProps);
        expect(search).toHaveBeenCalledTimes(1);

        // Further data-identical updates must not re-fire.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender({...reconnectedProps, transactions: {...reconnectedProps.transactions}});
        expect(search).toHaveBeenCalledTimes(1);
    });

    it('should not trigger search for chat when report actions removed and focused', () => {
        const chatProps = {
            ...baseProps,
            queryJSON: {...baseProps.queryJSON, type: 'chat' as const},
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'EXISTING', reportActionID: '1'},
                    '2': {actionName: 'ADDCOMMENT', reportActionID: '2'},
                },
            },
            previousReportActions: {
                reportActions_1: {
                    '1': {actionName: 'EXISTING', reportActionID: '1'},
                    '2': {actionName: 'ADDCOMMENT', reportActionID: '2'},
                },
            },
        };

        const {rerender} = renderHook((props: UseSearchAutoRefetchParams) => useSearchAutoRefetch(props), {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            initialProps: chatProps,
        });

        const updatedProps = {
            ...chatProps,
            reportActions: {
                reportActions_1: {
                    '1': {actionName: 'EXISTING', reportActionID: '1'},
                },
            },
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });
});
