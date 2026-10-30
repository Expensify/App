import useOnyx from '@hooks/useOnyx';

import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';

import navigationRef from '@navigation/navigationRef';

import useAccessibleDashboards from '@pages/Insights/useAccessibleDashboards';

import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import getInsightsTabRoute from './getInsightsTabRoute';

/** Returns the handler that opens the Insights tab on the dashboard the user last had open there. */
function useInsightsTabNavigation(isInsightsSelected: boolean) {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [accessibleDashboards = getEmptyArray<InsightsDashboardID>()] = useAccessibleDashboards();

    return () => {
        if (isInsightsSelected) {
            return;
        }
        clearSelectedText();
        interceptAnonymousUser(() => {
            const rootState = navigationRef.isReady() ? navigationRef.getRootState() : undefined;
            Navigation.navigate(getInsightsTabRoute(rootState, accessibleDashboards));
        }, session);
    };
}

export default useInsightsTabNavigation;
