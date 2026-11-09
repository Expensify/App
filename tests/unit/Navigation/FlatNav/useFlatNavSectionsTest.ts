import {renderHook} from '@testing-library/react-native';

import {useSearchTypeMenuSectionsForNavigation} from '@hooks/useSearchTypeMenuSections';
import useTodoCounts from '@hooks/useTodoCounts';

import FLAT_NAV from '@libs/Navigation/FlatNav/FLAT_NAV';
import type {FlatNavSavedSearchItem} from '@libs/Navigation/FlatNav/types';
import useFlatNavSavedSearchItems from '@libs/Navigation/FlatNav/useFlatNavSavedSearchItems';
import type {UseFlatNavSectionsParams} from '@libs/Navigation/FlatNav/useFlatNavSections';
import useFlatNavSections from '@libs/Navigation/FlatNav/useFlatNavSections';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import {getSuggestedSearches} from '@libs/SearchSuggestionUtils';
import type {SearchTypeMenuSection} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

jest.mock('@hooks/useSearchTypeMenuSections', () => ({
    __esModule: true,
    default: jest.fn(),
    useSearchTypeMenuSectionsForNavigation: jest.fn(),
}));
jest.mock('@hooks/useTodoCounts', () => jest.fn());
jest.mock('@libs/Navigation/FlatNav/useFlatNavSavedSearchItems', () => jest.fn());

const {SEARCH_KEYS} = CONST.SEARCH;
const suggestedSearches = getSuggestedSearches(1);

const typeMenuSections: SearchTypeMenuSection[] = [
    {
        translationPath: 'search.tabs.expenseReports',
        menuItems: [suggestedSearches[SEARCH_KEYS.EXPENSES], suggestedSearches[SEARCH_KEYS.REPORTS], suggestedSearches[SEARCH_KEYS.APPROVE]],
    },
    {translationPath: 'search.savedSearchesMenuItemTitle', menuItems: []},
];

const savedSearchItem: FlatNavSavedSearchItem = {
    type: FLAT_NAV.ITEM_TYPE.SAVED_SEARCH,
    key: savedSearchIDToSearchKey('1'),
    sectionID: FLAT_NAV.SECTION.SAVED,
    savedSearchID: '1',
    name: 'Coffee',
    title: 'Coffee',
    query: 'type:expense',
    iconName: 'Bookmark',
    isDisabled: false,
};

describe('useFlatNavSections', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useSearchTypeMenuSectionsForNavigation).mockReturnValue(typeMenuSections);
        jest.mocked(useTodoCounts).mockReturnValue({
            counts: {[SEARCH_KEYS.SUBMIT]: 0, [SEARCH_KEYS.APPROVE]: 4, [SEARCH_KEYS.PAY]: 0, [SEARCH_KEYS.EXPORT]: 0},
            singleReportIDs: {[SEARCH_KEYS.SUBMIT]: undefined, [SEARCH_KEYS.APPROVE]: undefined, [SEARCH_KEYS.PAY]: undefined, [SEARCH_KEYS.EXPORT]: undefined},
        });
        jest.mocked(useFlatNavSavedSearchItems).mockReturnValue([savedSearchItem]);
    });

    it('should build the sections from the Spend menu, the todo counts and the saved searches', () => {
        // Given an approver with one saved search
        // When we render the hook
        const {result} = renderHook(() => useFlatNavSections());

        // Then the sections list Expenses, Reports with its approve badge, and Saved
        expect(result.current.map((section) => section.id)).toEqual([FLAT_NAV.SECTION.EXPENSES, FLAT_NAV.SECTION.REPORTS, FLAT_NAV.SECTION.SAVED]);
        expect(result.current.find((section) => section.id === FLAT_NAV.SECTION.REPORTS)?.badgeText).toBe('4');
        expect(result.current.find((section) => section.id === FLAT_NAV.SECTION.SAVED)?.items).toEqual([savedSearchItem]);
    });

    it('should watch everything by default', () => {
        // Given no options
        // When we render the hook
        renderHook(() => useFlatNavSections());

        // Then each watch stays on by default so navigation data remains reactive
        expect(useSearchTypeMenuSectionsForNavigation).toHaveBeenCalledWith(true);
        expect(useTodoCounts).toHaveBeenCalledWith(true);
        expect(useFlatNavSavedSearchItems).toHaveBeenCalledWith(true);
    });

    it('should stop the watches while the consumer is not active', () => {
        // Given a consumer that is off screen, such as a closed More popover
        // When we render the hook with isActive false
        const params: UseFlatNavSectionsParams = {isActive: false};
        renderHook(() => useFlatNavSections(params));

        // Then each watch is told to stop
        expect(useSearchTypeMenuSectionsForNavigation).toHaveBeenCalledWith(false);
        expect(useTodoCounts).toHaveBeenCalledWith(false);
        expect(useFlatNavSavedSearchItems).toHaveBeenCalledWith(false);
    });
});
