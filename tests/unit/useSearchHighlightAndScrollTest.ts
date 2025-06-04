/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import useSearchHighlightAndScroll from '@hooks/useSearchHighlightAndScroll';
import type {UseSearchHighlightAndScroll} from '@hooks/useSearchHighlightAndScroll';
import {search} from '@libs/actions/Search';

jest.mock('@libs/actions/Search');
jest.mock('@react-navigation/native', () => ({
    useIsFocused: jest.fn(() => true),
    createNavigationContainerRef: () => ({}),
}));
jest.mock('@rnmapbox/maps', () => ({
    __esModule: true,
    default: {},
    MarkerView: {},
    setAccessToken: jest.fn(),
}));
jest.mock('@react-native-community/geolocation', () => ({
    setRNConfiguration: jest.fn(),
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
}));

const mockUseIsFocused = jest.fn().mockReturnValue(true);

afterEach(() => {
    jest.clearAllMocks();
});

describe('useSearchHighlightAndScroll', () => {
    const baseProps: UseSearchHighlightAndScroll = {
        searchResults: {
            data: {
                personalDetailsList: {},
            },
            search: {
                columnsToShow: {shouldShowCategoryColumn: true, shouldShowTagColumn: true, shouldShowTaxColumn: true},
                hasMoreResults: false,
                hasResults: true,
                offset: 0,
                status: 'all',
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
            status: 'all',
            sortBy: 'date',
            sortOrder: 'desc',
            filters: {operator: 'and', left: 'tag', right: ''},
            inputQuery: 'type:expense status:all',
            flatFilters: [],
            hash: 123,
            recentSearchHash: 456,
        },
        offset: 0,
    };

    it('should not trigger search when collections are empty', () => {
        renderHook(() => useSearchHighlightAndScroll(baseProps));
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search when new transaction added and focused', () => {
        const initialProps = {
            ...baseProps,
            transactions: {'1': {transactionID: '1'}},
            previousTransactions: {'1': {transactionID: '1'}},
        };

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
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
        expect(search).toHaveBeenCalledWith({queryJSON: baseProps.queryJSON, offset: 0});
    });

    it('should not trigger search when not focused', () => {
        mockUseIsFocused.mockReturnValue(false);

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
            initialProps: baseProps,
        });

        const updatedProps = {
            ...baseProps,
            transactions: {'1': {transactionID: '1'}},
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        rerender(updatedProps);
        expect(search).not.toHaveBeenCalled();
    });

    it('should trigger search for chat when report actions change', () => {
        mockUseIsFocused.mockReturnValue(true);

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

        const {rerender} = renderHook((props: UseSearchHighlightAndScroll) => useSearchHighlightAndScroll(props), {
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
        expect(search).toHaveBeenCalledWith({queryJSON: chatProps.queryJSON, offset: 0});
    });
});
