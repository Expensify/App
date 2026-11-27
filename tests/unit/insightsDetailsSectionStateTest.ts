import {getInsightsDetailsSectionStates, INSIGHTS_DETAILS_SECTION_STATE} from '@pages/Insights/details/insightsDetailsSectionState';

import CONST from '@src/CONST';
import type {InsightsDetails} from '@src/types/onyx';

const SUMMARY = {total: 100, count: 1, shareOfTotal: 10, average: 50, averagePeriodCount: 4};

describe('getInsightsDetailsSectionStates', () => {
    it('loads each section once its own data has arrived', () => {
        // Given a panel cached with a Summary only, and Biggest changes fetched by category
        const details: InsightsDetails = {summary: SUMMARY, biggestChanges: {[CONST.SEARCH.GROUP_BY.CATEGORY]: []}};

        // When the states are resolved for categories, then for merchants
        const byCategory = getInsightsDetailsSectionStates(details, false, CONST.SEARCH.GROUP_BY.CATEGORY);
        const byMerchant = getInsightsDetailsSectionStates(details, false, CONST.SEARCH.GROUP_BY.MERCHANT);

        // Then the Summary is ready, Recent history still loads since a cached Summary doesn't mean it was fetched,
        // and Biggest changes is ready only for the grouping that came back, even when its list is empty
        expect(byCategory).toEqual({
            hasErrors: false,
            summary: INSIGHTS_DETAILS_SECTION_STATE.READY,
            recentHistory: INSIGHTS_DETAILS_SECTION_STATE.LOADING,
            biggestChanges: INSIGHTS_DETAILS_SECTION_STATE.READY,
        });
        expect(byMerchant.biggestChanges).toBe(INSIGHTS_DETAILS_SECTION_STATE.LOADING);
    });

    it('keeps loaded sections when offline and shows the offline state for the rest', () => {
        // Given a panel cached with a Summary only
        const details: InsightsDetails = {summary: SUMMARY};

        // When the device is offline
        const states = getInsightsDetailsSectionStates(details, true, CONST.SEARCH.GROUP_BY.CATEGORY);

        // Then the Summary stays on screen, while the sections without data show they can't load
        expect(states).toEqual({
            hasErrors: false,
            summary: INSIGHTS_DETAILS_SECTION_STATE.READY,
            recentHistory: INSIGHTS_DETAILS_SECTION_STATE.OFFLINE,
            biggestChanges: INSIGHTS_DETAILS_SECTION_STATE.OFFLINE,
        });
    });

    it('marks every section stale when the request got no response', () => {
        // Given a request that failed without reaching the server
        const details: InsightsDetails = {errors: {error: 'No response'}, responseJsonCode: CONST.JSON_CODE.NO_RESPONSE};

        // When the states are resolved
        const states = getInsightsDetailsSectionStates(details, false, CONST.SEARCH.GROUP_BY.CATEGORY);

        // Then every section shares the request's failure, so the panel can offer to refresh
        expect(states).toEqual({
            hasErrors: true,
            summary: INSIGHTS_DETAILS_SECTION_STATE.STALE,
            recentHistory: INSIGHTS_DETAILS_SECTION_STATE.STALE,
            biggestChanges: INSIGHTS_DETAILS_SECTION_STATE.STALE,
        });
    });
});
