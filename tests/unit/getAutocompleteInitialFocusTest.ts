import type {InitialFocusSection} from '@components/Search/getAutocompleteInitialFocus';
import getAutocompleteInitialFocus from '@components/Search/getAutocompleteInitialFocus';

import CONST from '@src/CONST';

const contextualSuggestion = {keyForList: 'contextualSearch', searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION, text: 'Search in #admins'};
const recentSearchesSection = (data: InitialFocusSection['data']): InitialFocusSection => ({title: 'Recent searches', data});
const recentChatsSection = (data: InitialFocusSection['data']): InitialFocusSection => ({title: 'Recent chats', data});

describe('getAutocompleteInitialFocus', () => {
    it('focuses the first recent report when there is no contextual suggestion', () => {
        const sections: InitialFocusSection[] = [
            recentChatsSection([
                {keyForList: '101', text: 'Alice'},
                {keyForList: '102', text: 'Bob'},
            ]),
        ];

        const result = getAutocompleteInitialFocus(sections, new Set(['101', '102']));

        // Header occupies flat index 0, so the first report is at 1.
        expect(result.defaultFocusedKey).toBe('101');
        expect(result.defaultFocusedFlatIndex).toBe(1);
        expect(result.firstRecentReportFlatIndex).toBe(1);
        expect(result.firstRecentReportText).toBe('Alice');
    });

    it('prefers the contextual suggestion over the first recent report', () => {
        const sections: InitialFocusSection[] = [
            {data: [contextualSuggestion]},
            recentSearchesSection([{keyForList: 's1', text: 'type:expense'}]),
            recentChatsSection([{keyForList: '101', text: 'Alice'}]),
        ];

        const result = getAutocompleteInitialFocus(sections, new Set(['101']));

        // The suggestion is the very first row, and it wins over the recent report below it.
        expect(result.defaultFocusedKey).toBe('contextualSearch');
        expect(result.defaultFocusedFlatIndex).toBe(0);
        expect(result.defaultFocusedFlatIndex).not.toBe(result.firstRecentReportFlatIndex);
        // The first recent report is still located, since it drives the type-to-highlight behaviour.
        expect(result.firstRecentReportText).toBe('Alice');
    });

    it('counts section headers so the flat index lands on the row, not a header', () => {
        const sections: InitialFocusSection[] = [
            {data: [contextualSuggestion]},
            recentSearchesSection([
                {keyForList: 's1', text: 'type:expense'},
                {keyForList: 's2', text: 'type:chat'},
            ]),
            recentChatsSection([{keyForList: '101', text: 'Alice'}]),
        ];

        const result = getAutocompleteInitialFocus(sections, new Set(['101']));

        // Flat rows: 0 suggestion, 1 "Recent searches" header, 2-3 searches, 4 "Recent chats" header, 5 Alice.
        expect(result.firstRecentReportFlatIndex).toBe(5);
    });

    it('does not count a header for an empty section', () => {
        const sections: InitialFocusSection[] = [{title: 'Recent searches', data: []}, recentChatsSection([{keyForList: '101', text: 'Alice'}])];

        const result = getAutocompleteInitialFocus(sections, new Set(['101']));

        expect(result.firstRecentReportFlatIndex).toBe(1);
    });

    it('returns no focus target when nothing is focusable', () => {
        const result = getAutocompleteInitialFocus([], new Set());

        expect(result.defaultFocusedKey).toBeUndefined();
        expect(result.defaultFocusedFlatIndex).toBe(-1);
        expect(result.firstRecentReportFlatIndex).toBe(-1);
    });
});
