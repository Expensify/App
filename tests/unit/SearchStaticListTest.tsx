import {render, screen} from '@testing-library/react-native';

import SearchStaticList from '@components/Search/SearchStaticList';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import * as SearchUIUtils from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';

const mockConciergeReportID = jest.fn((): string | undefined => undefined);

jest.mock('@components/OnyxListItemProvider', () => ({
    useSession: jest.fn(() => ({accountID: 999, email: 'me@expensify.com'})),
    usePersonalDetails: jest.fn(() => ({})),
}));
jest.mock('@hooks/useOnyx', () =>
    jest.fn((key: string) => {
        // ONYXKEYS.CONCIERGE_REPORT_ID — the key cannot be imported inside a jest.mock factory
        if (key === 'conciergeReportID') {
            return [mockConciergeReportID()];
        }
        return [undefined];
    }),
);
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: jest.fn(() => ({convertToDisplayString: (amount?: number) => String(amount ?? 0)})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (...args: unknown[]) => JSON.stringify(args),
        localeCompare: (a: string, b: string) => a.localeCompare(b),
        formatPhoneNumber: (phone: string) => phone,
    })),
);
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: () => true,
        createNavigationContainerRef: () => ({
            addListener: () => jest.fn(),
            removeListener: () => jest.fn(),
            isReady: () => jest.fn(),
            getCurrentRoute: () => jest.fn(),
            getState: () => jest.fn(),
        }),
    };
});
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getIsFullscreenPreInsertedUnderRHP: jest.fn(() => false),
}));
jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        getRootState: jest.fn(() => ({routes: []})),
        isReady: jest.fn(() => false),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        getCurrentRoute: jest.fn(),
    },
}));
jest.mock('@components/TransactionItemRow', () => jest.fn(() => null));
jest.mock('@components/Skeletons/SearchRowSkeleton', () => jest.fn(() => null));
jest.mock('@components/StatusBadge', () => jest.fn(() => null));

// getSections consumes conciergeReportID (via createOption/getReportName) — keep SearchUIUtils real so the
// threading through SearchStaticList's getSections call is actually executed by this test.
const getSectionsSpy = jest.spyOn(SearchUIUtils, 'getSections');

const EMPTY_SEARCH_RESULTS: SearchResults = {
    search: {
        offset: 0,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        hash: 1,
        hasMoreResults: false,
        hasResults: false,
        isLoading: false,
        sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
        sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    },
    data: {
        personalDetailsList: {},
    },
};

describe('SearchStaticList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders and threads the conciergeReportID from Onyx into getSections', () => {
        mockConciergeReportID.mockReturnValue('concierge-static-list-1');
        const queryJSON = buildSearchQueryJSON('type:expense');
        if (!queryJSON) {
            throw new Error('failed to build queryJSON');
        }

        render(
            <SearchStaticList
                searchResults={EMPTY_SEARCH_RESULTS}
                queryJSON={queryJSON}
            />,
        );

        // Then the component renders without crashing and passes the threaded conciergeReportID to getSections
        expect(screen.toJSON()).toBeTruthy();
        expect(getSectionsSpy).toHaveBeenCalledWith(expect.objectContaining({conciergeReportID: 'concierge-static-list-1'}));
    });

    it('passes undefined to getSections while the Onyx value has not loaded yet', () => {
        mockConciergeReportID.mockReturnValue(undefined);
        const queryJSON = buildSearchQueryJSON('type:expense');
        if (!queryJSON) {
            throw new Error('failed to build queryJSON');
        }

        render(
            <SearchStaticList
                searchResults={EMPTY_SEARCH_RESULTS}
                queryJSON={queryJSON}
            />,
        );

        expect(getSectionsSpy).toHaveBeenCalledWith(expect.objectContaining({conciergeReportID: undefined}));
    });
});
