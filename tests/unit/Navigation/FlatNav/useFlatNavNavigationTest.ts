import {renderHook} from '@testing-library/react-native';

import {useSearchSelectionActions} from '@components/Search/SearchContext';

import useOnyx from '@hooks/useOnyx';

import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import type {FlatNavCannedSearchItem, FlatNavSection} from '@libs/Navigation/FlatNav/types';
import useFlatNavNavigation from '@libs/Navigation/FlatNav/useFlatNavNavigation';
import {navigateToFlatNavItem, navigateToFlatNavSection} from '@libs/SearchNavigationUtils';

import CONST from '@src/CONST';

import createMock from '../../../utils/createMock';

jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionActions: jest.fn(),
}));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@libs/SearchNavigationUtils', () => ({
    navigateToFlatNavItem: jest.fn(),
    navigateToFlatNavSection: jest.fn(),
}));

const mockClearSelectedTransactions = jest.fn();

const item: FlatNavCannedSearchItem = {
    type: FLAT_NAV.ITEM_TYPE.CANNED_SEARCH,
    key: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
    sectionID: FLAT_NAV.SECTION.EXPENSES,
    translationPath: 'search.tabs.expenses',
    iconName: 'Receipt',
    searchQuery: 'type:expense',
};

const section: FlatNavSection = {
    id: FLAT_NAV.SECTION.EXPENSES,
    translationPath: 'search.tabs.expenses',
    iconName: 'Receipt',
    items: [item],
};

describe('useFlatNavNavigation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useSearchSelectionActions).mockReturnValue(
            createMock<ReturnType<typeof useSearchSelectionActions>>({
                clearSelectedTransactions: mockClearSelectedTransactions,
            }),
        );
        jest.mocked(useOnyx).mockReturnValue([undefined, {status: 'loaded'}]);
    });

    it('should delegate navigateToItem to navigateToFlatNavItem', () => {
        // Given the hook rendered
        const {result} = renderHook(() => useFlatNavNavigation());

        // When navigateToItem is called
        result.current.navigateToItem(item);

        // Then it passes the item, search filters, and clearSelectedTransactions
        expect(navigateToFlatNavItem).toHaveBeenCalledWith(item, undefined, mockClearSelectedTransactions);
    });

    it('should delegate navigateToSection to navigateToFlatNavSection', () => {
        // Given the hook rendered
        const {result} = renderHook(() => useFlatNavNavigation());

        // When navigateToSection is called
        result.current.navigateToSection(section);

        // Then it passes the section, search filters, and clearSelectedTransactions
        expect(navigateToFlatNavSection).toHaveBeenCalledWith(section, undefined, mockClearSelectedTransactions);
    });
});
