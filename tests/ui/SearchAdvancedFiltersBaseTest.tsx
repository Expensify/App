import {render, screen, within} from '@testing-library/react-native';

import useShouldFooterBeInsideList from '@hooks/useShouldFooterBeInsideList';

import IntlStore from '@src/languages/IntlStore';
import SearchAdvancedFiltersBase from '@src/pages/Search/SearchAdvancedFiltersPage/SearchAdvancedFiltersBase';

import type {ReactNode} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

import type * as TestHelper from '../utils/TestHelper';

// jest.mock factories can't reference imported bindings, but `mock`-prefixed locals are allowed.
const MockView = View;

// Stand-in for the filter list that only renders what the page puts inside its scroll area.
jest.mock('@components/Search/FilterComponents/AdvancedFilters/FilterList', () => ({
    __esModule: true,
    default: ({children}: {children?: ReactNode}) => <MockView testID="filter-list">{children}</MockView>,
}));

jest.mock('@hooks/useShouldFooterBeInsideList', () => jest.fn(() => false));

jest.mock('@hooks/useAdvancedSearchFilters', () => jest.fn(() => []));

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: () => false}),
}));

// The default locale context translates every label to an empty string.
jest.mock('@hooks/useLocalize', () => {
    const {translateLocal, localeCompare} = jest.requireActual<typeof TestHelper>('../utils/TestHelper');
    return () => ({translate: translateLocal, localeCompare});
});

function renderFiltersPage() {
    render(
        <NavigationContainer>
            <SearchAdvancedFiltersBase />
        </NavigationContainer>,
    );
}

beforeAll(async () => {
    await IntlStore.load('en');
});

describe('SearchAdvancedFiltersBase', () => {
    it('pins Apply filters below the list by default', () => {
        // Given a layout with room for a fixed footer
        jest.mocked(useShouldFooterBeInsideList).mockReturnValue(false);

        // When the Filters page renders
        renderFiltersPage();

        // Then Apply filters is outside the scrolling list
        expect(screen.getByText('Apply filters')).toBeOnTheScreen();
        expect(within(screen.getByTestId('filter-list')).queryByText('Apply filters')).not.toBeOnTheScreen();
    });

    it('scrolls Apply filters with the list in landscape with the keyboard open', () => {
        // Given landscape mode with the keyboard open, where a fixed footer would push the search input out of view
        jest.mocked(useShouldFooterBeInsideList).mockReturnValue(true);

        // When the Filters page renders
        renderFiltersPage();

        // Then Apply filters is rendered once, inside the scrolling list
        expect(screen.getAllByText('Apply filters')).toHaveLength(1);
        expect(within(screen.getByTestId('filter-list')).getByText('Apply filters')).toBeOnTheScreen();
    });
});
