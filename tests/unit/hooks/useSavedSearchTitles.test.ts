import {renderHook} from '@testing-library/react-native';

import useSavedSearchTitles from '@pages/Search/hooks/useSavedSearchTitles';

import type {ReportAttributesDerivedValue} from '@src/types/onyx';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';

import {formatPhoneNumber, translateLocal} from '../../utils/TestHelper';

type ReportAttributes = ReportAttributesDerivedValue['reports'];

const UNNAMED_QUERY = 'type:expense date:this-month';

const savedSearches: Record<string, SaveSearchItem> = {
    thisMonth: {name: UNNAMED_QUERY, query: UNNAMED_QUERY},
    travel: {name: 'Travel', query: 'type:expense category:travel'},
};

function useTitles({searches, reportAttributes}: {searches: Record<string, SaveSearchItem>; reportAttributes: ReportAttributes}) {
    return useSavedSearchTitles({
        savedSearches: searches,
        PersonalDetails: undefined,
        reports: undefined,
        taxRates: {},
        cardList: undefined,
        cardFeeds: undefined,
        policies: undefined,
        currentUserAccountID: 1,
        translate: translateLocal,
        formatPhoneNumber,
        reportAttributes,
    });
}

describe('useSavedSearchTitles', () => {
    it('returns the same map when an input is replaced but no title changes', () => {
        // Given the titles of saved searches that have no custom name
        const {result, rerender} = renderHook(useTitles, {initialProps: {searches: savedSearches, reportAttributes: {}}});
        const firstTitles = result.current;
        expect(firstTitles.has(UNNAMED_QUERY)).toBe(true);

        // When report attributes are replaced by an equal object, as every expense write does
        rerender({searches: savedSearches, reportAttributes: {}});

        // Then the map is the same object, so the menu tabs built from it do not render again
        expect(result.current).toBe(firstTitles);
    });

    it('returns a new map when a title is added', () => {
        // Given the titles of saved searches that have no custom name
        const {result, rerender} = renderHook(useTitles, {initialProps: {searches: savedSearches, reportAttributes: {}}});
        const firstTitles = result.current;

        // When another saved search without a custom name is added
        const query = 'type:expense merchant:Uber';
        rerender({searches: {...savedSearches, uber: {name: query, query}}, reportAttributes: {}});

        // Then the map is rebuilt and has a title for the new query
        expect(result.current).not.toBe(firstTitles);
        expect(result.current.has(query)).toBe(true);
    });
});
