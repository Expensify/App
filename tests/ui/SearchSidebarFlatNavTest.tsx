import {render, screen} from '@testing-library/react-native';

import SearchSidebar from '@components/Navigation/SearchSidebar';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

let mockShouldUseFlatNavigationBar = false;
let mockShouldUseNarrowLayout = false;
let mockSearchType: string | undefined;
const mockSetLastSearchType = jest.fn();

jest.mock('@components/Search/SearchContext', () => ({
    useSearchResultsContext: () => ({currentSearchResults: mockSearchType ? {search: {type: mockSearchType}} : undefined}),
    useSearchResultsActions: () => ({setLastSearchType: mockSetLastSearchType}),
}));

jest.mock('@components/Navigation/FlatNavigationBar/useShouldUseFlatNavigationBar', () => () => mockShouldUseFlatNavigationBar);
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@pages/Search/SearchTypeMenuWide', () => {
    // The factory is hoisted above the imports, so it loads what it renders itself.
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const {Text: MockText} = require('react-native');
    return () => <MockText>Spend menu</MockText>;
});
jest.mock(
    '@components/Navigation/TopBar',
    () =>
        ({children}: {children: ReactNode}) =>
            children,
);

describe('SearchSidebar', () => {
    beforeEach(() => {
        mockShouldUseFlatNavigationBar = false;
        mockShouldUseNarrowLayout = false;
        mockSearchType = undefined;
        mockSetLastSearchType.mockClear();
    });

    it('draws the Spend menu for users outside the flat nav beta', () => {
        // Given a wide layout without the flat navigation bar
        // When the Search navigator draws its extra content
        render(<SearchSidebar />);

        // Then the Spend column is there as before, so users outside the beta see no change
        expect(screen.getByText('Spend menu')).toBeOnTheScreen();
    });

    it('draws nothing when the flat navigation bar lists the Spend searches itself', () => {
        // Given a wide layout with the flat navigation bar
        mockShouldUseFlatNavigationBar = true;

        // When the Search navigator draws its extra content
        render(<SearchSidebar />);

        // Then there is no second column, so the Search page can take the whole width beside the bar
        expect(screen.queryByText('Spend menu')).toBeNull();
    });

    it('draws nothing on a narrow layout', () => {
        // Given a narrow layout, which has its own Spend menu inside the page
        mockShouldUseNarrowLayout = true;

        // When the Search navigator draws its extra content
        render(<SearchSidebar />);

        // Then the sidebar stays out of the way
        expect(screen.queryByText('Spend menu')).toBeNull();
    });

    it.each([
        {layout: 'wide layout that draws the Spend column', isFlatNav: false, isNarrow: false},
        {layout: 'wide layout where the flat navigation bar replaces the Spend column', isFlatNav: true, isNarrow: false},
        {layout: 'narrow layout', isFlatNav: false, isNarrow: true},
    ])('keeps the last search type up to date on a $layout', ({isFlatNav, isNarrow}) => {
        // Given search results that have a type, on a layout that may or may not draw the sidebar
        mockShouldUseFlatNavigationBar = isFlatNav;
        mockShouldUseNarrowLayout = isNarrow;
        mockSearchType = CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

        // When the Search navigator draws its extra content
        render(<SearchSidebar />);

        // Then the last search type is saved whatever is drawn, because the Search page and its results read it
        expect(mockSetLastSearchType).toHaveBeenCalledWith(CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT);
    });

    it('does not save a last search type when the search results have none', () => {
        // Given the flat navigation bar is on and the search results have not loaded a type yet
        mockShouldUseFlatNavigationBar = true;

        // When the Search navigator draws its extra content
        render(<SearchSidebar />);

        // Then the previous last search type is left alone instead of being cleared
        expect(mockSetLastSearchType).not.toHaveBeenCalled();
    });
});
