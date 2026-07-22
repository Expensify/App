import useOnyx from '@hooks/useOnyx';

import {setNameValuePair} from '@libs/actions/User';
import type {SearchKey, SearchTypeMenuItem} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useHomeInsightConfigs from './useHomeInsightConfigs';
import useInsightData, {INSIGHT_STATE} from './useInsightData';

type InsightData = ReturnType<typeof useInsightData>;

const {SPEND_OVER_TIME, TOP_SPENDERS, TOP_CATEGORIES, TOP_MERCHANTS} = CONST.SEARCH.SEARCH_KEYS;

/**
 * Drives the Home insights widget. Fetches every visible insight up front, keeps only the ones
 * with enough data as switchable options, and returns the currently displayed insight's chart data.
 */
function useHomeInsights() {
    const insightConfigs = useHomeInsightConfigs();
    const [selectedKey = SPEND_OVER_TIME] = useOnyx(ONYXKEYS.NVP_HOME_SELECTED_INSIGHT);

    const getConfig = (key: SearchKey) => insightConfigs.find((config) => config.key === key);

    const spendOverTime = useInsightData(getConfig(SPEND_OVER_TIME));
    const topSpenders = useInsightData(getConfig(TOP_SPENDERS));
    const topCategories = useInsightData(getConfig(TOP_CATEGORIES));
    const topMerchants = useInsightData(getConfig(TOP_MERCHANTS));

    const candidates = [spendOverTime, topSpenders, topCategories, topMerchants].filter((insight) => !!insight.config);
    const isAnyLoading = candidates.some((insight) => insight.state === INSIGHT_STATE.LOADING);
    const ready = candidates.filter((insight) => insight.state === INSIGHT_STATE.READY);
    const hasReadyInsights = !isAnyLoading && ready.length > 0;

    const pickSelected = (insights: InsightData[]) => insights.find((insight) => insight.config?.key === selectedKey) ?? insights.at(0);

    const displayed = pickSelected(hasReadyInsights ? ready : candidates);

    // Stay in a loading state until everything settles rather than revealing an insight early.
    const state = isAnyLoading ? INSIGHT_STATE.LOADING : (displayed?.state ?? INSIGHT_STATE.HIDDEN);
    const dropdownConfigs = (hasReadyInsights ? ready : [displayed]).map((insight) => insight?.config).filter((config): config is SearchTypeMenuItem => !!config);

    const onSelectInsight = (key: SearchKey) => {
        if (key === selectedKey) {
            return;
        }
        setNameValuePair(ONYXKEYS.NVP_HOME_SELECTED_INSIGHT, key, selectedKey);
    };

    return {
        displayed,
        state,
        dropdownConfigs,
        onSelectInsight,
    };
}

export default useHomeInsights;
