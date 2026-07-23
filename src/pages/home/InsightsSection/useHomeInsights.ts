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
 * Decides which insight to display, the widget's state, and the switchable options, in precedence
 * order: while anything loads keep the selected insight in view, then prefer insights with enough
 * data, then surface a fetch problem (error/offline), otherwise hide.
 */
function resolveInsights<T extends {config: SearchTypeMenuItem | undefined; state: ValueOf<typeof INSIGHT_STATE>}>(candidates: T[], selectedKey: SearchKey) {
    const pickSelected = (insights: T[]) => insights.find((insight) => insight.config?.key === selectedKey) ?? insights.at(0);
    const getInsightConfigs = (insights: Array<T | undefined>) => insights.map((insight) => insight?.config).filter((config): config is SearchTypeMenuItem => !!config);

    // While anything loads, keep the selected insight in view and wait before revealing options.
    if (candidates.some((insight) => insight.state === INSIGHT_STATE.LOADING)) {
        const displayed = pickSelected(candidates);
        return {displayed, state: INSIGHT_STATE.LOADING, dropdownConfigs: getInsightConfigs([displayed])};
    }

    // Show insights with enough data only, if there are any.
    const ready = candidates.filter((insight) => insight.state === INSIGHT_STATE.READY);
    if (ready.length > 0) {
        const displayed = pickSelected(ready);
        return {displayed, state: displayed?.state ?? INSIGHT_STATE.HIDDEN, dropdownConfigs: getInsightConfigs(ready)};
    }

    // No data anywhere: surface a fetch problem if one exists.
    const problems = candidates.filter((insight) => insight.state === INSIGHT_STATE.ERROR || insight.state === INSIGHT_STATE.OFFLINE);
    if (problems.length > 0) {
        const displayed = pickSelected(problems);
        return {displayed, state: displayed?.state ?? INSIGHT_STATE.HIDDEN, dropdownConfigs: getInsightConfigs([displayed])};
    }

    // Nothing to show.
    return {displayed: undefined, state: INSIGHT_STATE.HIDDEN, dropdownConfigs: []};
}

/**
 * Drives the Home insights widget: fetches every visible insight up front, then resolves which one
 * to display, the widget state and the switchable options.
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
