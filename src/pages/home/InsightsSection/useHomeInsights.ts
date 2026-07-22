import useOnyx from '@hooks/useOnyx';

import {setNameValuePair} from '@libs/actions/User';
import type {SearchKey, SearchTypeMenuItem} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import useHomeInsightConfigs from './useHomeInsightConfigs';
import useInsightData, {INSIGHT_STATE} from './useInsightData';

const {SPEND_OVER_TIME, TOP_SPENDERS, TOP_CATEGORIES, TOP_MERCHANTS} = CONST.SEARCH.SEARCH_KEYS;

/**
 * Decides which insight to display, the widget's state, and the switchable options. Waits for every
 * insight to finish loading before revealing options. Once settled, it prefers insights with enough
 * data, then surfaces a fetch problem (error/offline), and only hides when there is nothing to show.
 */
function resolveInsights<T extends {config: SearchTypeMenuItem | undefined; state: ValueOf<typeof INSIGHT_STATE>}>(candidates: T[], selectedKey: SearchKey) {
    const isAnyLoading = candidates.some((insight) => insight.state === INSIGHT_STATE.LOADING);
    const ready = candidates.filter((insight) => insight.state === INSIGHT_STATE.READY);
    const problems = candidates.filter((insight) => insight.state === INSIGHT_STATE.ERROR || insight.state === INSIGHT_STATE.OFFLINE);

    // Once settled, prefer the first non-empty group in priority order; fall back to all candidates.
    const settled = [ready, problems, candidates].find((group) => group.length > 0) ?? [];

    const pickSelected = (insights: T[]) => insights.find((insight) => insight.config?.key === selectedKey) ?? insights.at(0);
    // While loading, keep the selected insight in view; once settled, pick from the preferred group.
    const displayed = isAnyLoading ? pickSelected(candidates) : pickSelected(settled);

    const state = isAnyLoading ? INSIGHT_STATE.LOADING : (displayed?.state ?? INSIGHT_STATE.HIDDEN);
    const dropdownConfigs = (!isAnyLoading && ready.length > 0 ? ready : [displayed]).map((insight) => insight?.config).filter((config): config is SearchTypeMenuItem => !!config);

    return {displayed, state, dropdownConfigs};
}

/**
 * Drives the Home insights widget: fetches every visible insight up front, then resolves which one
 * to display, the widget state, and the switchable options.
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
    const {displayed, state, dropdownConfigs} = resolveInsights(candidates, selectedKey);

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

export {resolveInsights};
export default useHomeInsights;
