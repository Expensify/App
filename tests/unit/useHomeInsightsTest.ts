import type {SearchKey, SearchTypeMenuItem} from '@libs/SearchUIUtils';

import {resolveInsights} from '@pages/home/InsightsSection/useHomeInsights';
import {INSIGHT_STATE} from '@pages/home/InsightsSection/useInsightData';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

const {SPEND_OVER_TIME, TOP_SPENDERS, TOP_CATEGORIES} = CONST.SEARCH.SEARCH_KEYS;

const makeConfig = (key: SearchKey): SearchTypeMenuItem => ({
    key,
    translationPath: 'common.view',
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    icon: 'User',
    searchQuery: `query-${key}`,
    searchQueryJSON: undefined,
    hash: 0,
    similarSearchHash: 0,
    recentSearchHash: 0,
});

const makeInsight = (key: SearchKey, state: ValueOf<typeof INSIGHT_STATE>) => ({config: makeConfig(key), state});
const getDropdownKeys = (result: ReturnType<typeof resolveInsights>) => result.dropdownConfigs.map((config) => config.key);

describe('resolveInsights', () => {
    it('stays in the loading state until every insight has settled', () => {
        const result = resolveInsights(
            [makeInsight(SPEND_OVER_TIME, INSIGHT_STATE.READY), makeInsight(TOP_SPENDERS, INSIGHT_STATE.LOADING), makeInsight(TOP_CATEGORIES, INSIGHT_STATE.READY)],
            SPEND_OVER_TIME,
        );
        expect(result.state).toBe(INSIGHT_STATE.LOADING);
        expect(result.displayed?.config?.key).toBe(SPEND_OVER_TIME);
    });

    it('offers only insights with enough data and shows the selected one once loaded', () => {
        const result = resolveInsights(
            [makeInsight(SPEND_OVER_TIME, INSIGHT_STATE.READY), makeInsight(TOP_SPENDERS, INSIGHT_STATE.READY), makeInsight(TOP_CATEGORIES, INSIGHT_STATE.READY)],
            TOP_SPENDERS,
        );
        expect(result.state).toBe(INSIGHT_STATE.READY);
        expect(result.displayed?.config?.key).toBe(TOP_SPENDERS);
        expect(getDropdownKeys(result)).toEqual([SPEND_OVER_TIME, TOP_SPENDERS, TOP_CATEGORIES]);
    });

    it('falls back to the first ready insight when the selected one has too few data points', () => {
        const result = resolveInsights(
            [makeInsight(SPEND_OVER_TIME, INSIGHT_STATE.HIDDEN), makeInsight(TOP_SPENDERS, INSIGHT_STATE.READY), makeInsight(TOP_CATEGORIES, INSIGHT_STATE.READY)],
            SPEND_OVER_TIME,
        );
        expect(result.state).toBe(INSIGHT_STATE.READY);
        expect(result.displayed?.config?.key).toBe(TOP_SPENDERS);
        expect(getDropdownKeys(result)).toEqual([TOP_SPENDERS, TOP_CATEGORIES]);
    });

    it('hides the section (HIDDEN) when no insight has enough data', () => {
        const result = resolveInsights([makeInsight(SPEND_OVER_TIME, INSIGHT_STATE.HIDDEN), makeInsight(TOP_SPENDERS, INSIGHT_STATE.HIDDEN)], SPEND_OVER_TIME);
        expect(result.state).toBe(INSIGHT_STATE.HIDDEN);
    });
});
