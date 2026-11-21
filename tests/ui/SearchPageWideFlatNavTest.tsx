import {render} from '@testing-library/react-native';

import type {SearchQueryJSON} from '@components/Search/types';

import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import SearchPageWide from '@pages/Search/SearchPageWide';

import type SCREENS from '@src/SCREENS';

import type {ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet} from 'react-native';

import createMock from '../utils/createMock';

const mockSpendColumnOffset = 240;
let mockShouldUseFlatNavigationBar = false;

jest.mock('@components/Navigation/FlatNavigationBar/useShouldUseFlatNavigationBar', () => () => mockShouldUseFlatNavigationBar);
jest.mock('@components/Navigation/SearchSidebarCollapseStore', () => ({
    useSearchSidebarContentOffsetStyle: () => ({marginLeft: mockSpendColumnOffset}),
}));
jest.mock(
    '@components/ReceiptScanDropZone',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/BlockingViews/FullPageNotFoundView',
    () =>
        ({children, shouldShow}: {children: React.ReactNode; shouldShow: boolean}) =>
            shouldShow ? null : children,
);
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({currentSearchKey: undefined}),
    useSearchSelectionContext: () => ({hasSelectedTransactions: false}),
}));
jest.mock('@components/Search/SearchLoadingSkeleton', () => () => null);
jest.mock('@components/Search/SearchPageHeader/SearchActionsBarWide', () => () => null);
jest.mock('@components/Search/SearchPageHeader/SearchPageHeaderWide', () => () => null);
jest.mock('@components/Search/SearchSelectionFooter', () => () => null);
jest.mock('@components/Search/SearchWithNavigationDeferredMount', () => () => null);
jest.mock('@components/Search/SearchBulkActionsBarWide', () => () => null);
jest.mock('@hooks/useEndSubmitNavigationSpans', () => () => () => {});
jest.mock('@hooks/useSearchLoadingState', () => () => false);
jest.mock('@hooks/useSearchShouldCalculateTotals', () => () => false);
jest.mock('@navigation/Navigation', () => ({goBack: jest.fn()}));

const ROUTE = createMock<PlatformStackRouteProp<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>>({
    key: 'search-root',
    name: 'Search_Root',
    params: {q: 'type:expense'},
});

function renderSearchPageWide(queryJSON: SearchQueryJSON | undefined) {
    return render(
        <SearchPageWide
            queryJSON={queryJSON}
            searchResults={undefined}
            contentQueryJSON={queryJSON}
            contentSearchResults={undefined}
            isMobileSelectionModeEnabled={false}
            handleSearchAction={() => {}}
            onSortPressedCallback={() => {}}
            route={ROUTE}
            searchOverlayContent={null}
            onSearchContentReady={() => {}}
        />,
    );
}

function isViewStyle(value: unknown): value is ViewStyle {
    return !!value && typeof value === 'object';
}

function getRootMarginLeft(tree: ReturnType<typeof renderSearchPageWide>) {
    const root = tree.toJSON();
    const rootNode = Array.isArray(root) ? root.at(0) : root;
    const style: unknown = StyleSheet.flatten(rootNode?.props.style);
    return isViewStyle(style) ? style.marginLeft : undefined;
}

describe('SearchPageWide', () => {
    const queryJSON = buildSearchQueryJSON('type:expense');

    beforeEach(() => {
        mockShouldUseFlatNavigationBar = false;
    });

    it('offsets the page by the Spend column for users outside the flat nav beta', () => {
        // Given a user outside the flat nav beta, who still has the Spend column beside the page
        mockShouldUseFlatNavigationBar = false;

        // When the page renders a search
        const tree = renderSearchPageWide(queryJSON);

        // Then the page makes room for the column, so nothing changes for them
        expect(getRootMarginLeft(tree)).toBe(mockSpendColumnOffset);
    });

    it('takes the full width beside the flat navigation bar', () => {
        // Given a user in the flat nav beta, whose bar lists the Spend searches instead of the column
        mockShouldUseFlatNavigationBar = true;

        // When the page renders a search
        const tree = renderSearchPageWide(queryJSON);

        // Then there is no gap where the column was
        expect(getRootMarginLeft(tree)).toBeUndefined();
    });
});
