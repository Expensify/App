import {renderHook} from '@testing-library/react-native';

import {useSearchQueryContext} from '@components/Search/SearchContext';

import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import type {FlatNavSection} from '@libs/Navigation/FlatNav/types';
import useActiveFlatNavItem from '@libs/Navigation/FlatNav/useActiveFlatNavItem';

import CONST from '@src/CONST';

import createMockSearchContext from '../../../utils/createMockSearchContext';

jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: jest.fn(),
}));

const sections: FlatNavSection[] = [
    {
        id: FLAT_NAV.SECTION.REPORTS,
        translationPath: 'common.reports',
        iconName: 'Document',
        items: [
            {
                type: FLAT_NAV.ITEM_TYPE.CANNED_SEARCH,
                key: CONST.SEARCH.SEARCH_KEYS.SUBMIT,
                sectionID: FLAT_NAV.SECTION.REPORTS,
                translationPath: 'search.tabs.submit',
                iconName: 'Pencil',
                searchQuery: 'type:expense-report',
            },
        ],
    },
];

function mockCurrentSearchKey(currentSearchKey: ReturnType<typeof useSearchQueryContext>['currentSearchKey']) {
    jest.mocked(useSearchQueryContext).mockReturnValue({...createMockSearchContext().state, currentSearchKey});
}

describe('useActiveFlatNavItem', () => {
    it('should return undefined when the Search page is not the one on screen, even if a search key is left over', () => {
        // Given a search key left over from the last search, and another tab on screen
        mockCurrentSearchKey(CONST.SEARCH.SEARCH_KEYS.SUBMIT);

        // When we render the hook with the Search page unfocused
        const {result} = renderHook(() => useActiveFlatNavItem(sections, false));

        // Then no section is active, otherwise Reports would stay highlighted on the Home tab
        expect(result.current).toBeUndefined();
    });

    it('should follow the current search key when the Search page is focused', () => {
        // Given the Search page on screen with the Drafts search open
        mockCurrentSearchKey(CONST.SEARCH.SEARCH_KEYS.SUBMIT);
        const {result, rerender} = renderHook(() => useActiveFlatNavItem(sections, true));
        expect(result.current).toEqual({sectionID: FLAT_NAV.SECTION.REPORTS, itemKey: CONST.SEARCH.SEARCH_KEYS.SUBMIT});

        // When the user opens a search that Reports does not list
        mockCurrentSearchKey(CONST.SEARCH.SEARCH_KEYS.APPROVE);
        rerender({});

        // Then Reports stays active with no item
        expect(result.current).toEqual({sectionID: FLAT_NAV.SECTION.REPORTS, itemKey: undefined});
    });
});
