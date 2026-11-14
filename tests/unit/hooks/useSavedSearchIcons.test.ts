import {renderHook} from '@testing-library/react-native';

import useSavedSearchIcons from '@pages/Search/hooks/useSavedSearchIcons';

import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';

const savedSearches: Record<string, SaveSearchItem> = {
    travel: {name: 'Travel', query: 'type:expense category:travel'},
    drafts: {name: 'Drafts', query: 'type:expense-report status:drafts'},
};

describe('useSavedSearchIcons', () => {
    it('returns the same map while the saved searches do not change', () => {
        // Given the icon map for a set of saved searches
        const {result, rerender} = renderHook(({searches}: {searches: Record<string, SaveSearchItem>}) => useSavedSearchIcons(searches), {initialProps: {searches: savedSearches}});
        const firstIconNames = result.current;

        // When the consumer renders again with the same saved searches, as the type menu does on every expense write
        rerender({searches: savedSearches});

        // Then the map is the same object, so the menu tabs built from it do not render again
        expect(result.current).toBe(firstIconNames);
    });

    it('returns a new map with the added query when a saved search is added', () => {
        // Given the icon map for a set of saved searches
        const {result, rerender} = renderHook(({searches}: {searches: Record<string, SaveSearchItem>}) => useSavedSearchIcons(searches), {initialProps: {searches: savedSearches}});
        const firstIconNames = result.current;

        // When a saved search is added
        const query = 'type:expense merchant:Uber';
        rerender({searches: {...savedSearches, uber: {name: 'Uber', query}}});

        // Then the map is rebuilt and has an icon for the new query
        expect(result.current).not.toBe(firstIconNames);
        expect(result.current.has(query)).toBe(true);
    });
});
