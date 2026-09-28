import {render} from '@testing-library/react-native';

import CardSelector from '@components/Search/FilterComponents/CardSelector';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';

import CONST from '@src/CONST';

import React from 'react';

// The number of individual cards `buildCardsData` returns. Tests mutate this to switch between a long list
// (pinning enabled) and a short list (pinning disabled). `mockMatcher` optionally decides which cards' labels
// contain the search term so the search test can target them.
let mockCardCount = 0;
let mockSearchTerm = '';
let mockMatcher: ((key: string) => boolean) | undefined;

jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/CardListItem', () => jest.fn(() => null));
jest.mock('@components/OnyxListItemProvider', () => ({usePersonalDetails: jest.fn(() => ({}))}));
jest.mock('@components/Search/FilterComponents/ListFilterViewWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));
jest.mock('@hooks/useDebouncedState', () => jest.fn(() => [mockSearchTerm, mockSearchTerm, jest.fn()]));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: true})));
jest.mock('@hooks/useCompanyCardIcons', () => ({useCompanyCardFeedIcons: jest.fn(() => ({}))}));
jest.mock('@hooks/useTheme', () => jest.fn(() => ({})));
jest.mock('@hooks/useThemeIllustrations', () => jest.fn(() => ({})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({})));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@src/types/utils/isLoadingOnyxValue', () => jest.fn(() => false));
jest.mock('@libs/actions/Search', () => ({openSearchCardFiltersPage: jest.fn()}));
jest.mock('@libs/CardFeedUtils', () => ({
    // Build the individual-card section from `mockCardCount`; the closed-card section is always empty here.
    // `isSelected` mirrors the real helper, which derives it from the passed-in `value`.
    buildCardsData: jest.fn((workspaceCardFeeds, userCardList, personalDetails, value: string[], illustrations, icons, isClosed: boolean) => {
        if (isClosed) {
            return [];
        }
        return Array.from({length: mockCardCount}, (_, index) => {
            const keyForList = `c${index}`;
            return {
                keyForList,
                text: mockMatcher?.(keyForList) ? `match ${keyForList}` : `Card ${keyForList}`,
                isSelected: (value ?? []).includes(keyForList),
                lastFourPAN: '',
                cardName: '',
            };
        });
    }),
}));

describe('CardSelector', () => {
    const mockedSelectionList = jest.mocked(SelectionListWithSections);

    const getSections = () => mockedSelectionList.mock.lastCall?.[0].sections ?? [];

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockSearchTerm = '';
        mockMatcher = undefined;
        // A long list so the "move selected to top" behavior is enabled.
        mockCardCount = CONST.STANDARD_LIST_ITEM_LIMIT + 2;
    });

    it('floats the initially-selected card to the top of a long list', () => {
        render(
            <CardSelector
                value={['c10']}
                onChange={jest.fn()}
            />,
        );

        const sections = getSections();
        // Top section holds only the pre-selected card.
        expect(sections.at(0)?.data.map((item) => item.keyForList)).toEqual(['c10']);
        // Main section keeps every other card, with the pinned one removed.
        expect(sections.at(1)?.data.map((item) => item.keyForList)).not.toContain('c10');
        expect(sections.at(1)?.data).toHaveLength(CONST.STANDARD_LIST_ITEM_LIMIT + 1);
    });

    it('keeps a card in place when it is toggled after first render (does not jump to the top)', () => {
        const {rerender} = render(
            <CardSelector
                value={['c10']}
                onChange={jest.fn()}
            />,
        );

        // Simulate the user toggling another card on: the parent re-renders the filter with the updated value.
        rerender(
            <CardSelector
                value={['c10', 'c3']}
                onChange={jest.fn()}
            />,
        );

        const sections = getSections();
        // Only the originally pre-selected card stays pinned at the top.
        expect(sections.at(0)?.data.map((item) => item.keyForList)).toEqual(['c10']);

        // The newly toggled card is marked selected but stays in its natural position (index 3) instead of jumping up.
        const mainSection = sections.at(1)?.data ?? [];
        expect(mainSection.findIndex((item) => item.keyForList === 'c3')).toBe(3);
        expect(mainSection.find((item) => item.keyForList === 'c3')?.isSelected).toBe(true);
    });

    it('keeps the initially-selected card pinned at the top while searching, and drops non-matching pinned cards', () => {
        // Only cards "c3", "c10", and "c11" have labels containing the search term. "c10" is pinned and matches -> it
        // stays at the top; "c5" is pinned but does not match -> it is dropped.
        mockSearchTerm = 'match';
        mockMatcher = (key) => key === 'c3' || key === 'c10' || key === 'c11';

        render(
            <CardSelector
                value={['c10', 'c5']}
                onChange={jest.fn()}
            />,
        );

        const sections = getSections();
        // The pinned card that still matches the search stays at the top; the non-matching pinned card is dropped.
        expect(sections.at(0)?.data.map((item) => item.keyForList)).toEqual(['c10']);
        // The main section shows the remaining matches with the pinned one removed (no duplicate).
        expect(sections.at(1)?.data.map((item) => item.keyForList)).toEqual(['c3', 'c11']);
    });

    it('does not pin selected cards to the top of a short list', () => {
        mockCardCount = 5;

        render(
            <CardSelector
                value={['c2']}
                onChange={jest.fn()}
            />,
        );

        const sections = getSections();
        // No pinned section for a short list.
        expect(sections.at(0)?.data).toHaveLength(0);
        // Every card stays in place; the selected one is simply marked in position.
        const mainSection = sections.at(1)?.data ?? [];
        expect(mainSection.map((item) => item.keyForList)).toEqual(['c0', 'c1', 'c2', 'c3', 'c4']);
        expect(mainSection.find((item) => item.keyForList === 'c2')?.isSelected).toBe(true);
    });

    it('passes the expected selection behavior props to the list so a selected row does not clear the search, lose focus, or auto-scroll', () => {
        render(
            <CardSelector
                value={[]}
                onChange={jest.fn()}
            />,
        );

        const props = mockedSelectionList.mock.lastCall?.[0];
        expect(props?.shouldClearInputOnSelect).toBe(false);
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
        expect(props?.shouldPreventAutoScrollOnSelect).toBe(true);
    });
});
