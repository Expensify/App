import useDocumentTitle from '@hooks/useDocumentTitle';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';

import type {TabNavigatorParamList} from '@libs/Navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {InsightsDashboardID} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

import React from 'react';

import InsightsDashboard from './InsightsDashboard';
import useAccessibleDashboards from './useAccessibleDashboards';

type InsightsPageProps = BottomTabScreenProps<TabNavigatorParamList, typeof SCREENS.INSIGHTS>;

function InsightsPage({route}: InsightsPageProps) {
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const [accessibleDashboards = getEmptyArray<InsightsDashboardID>(), accessibleDashboardsMetadata] = useAccessibleDashboards();
    useDocumentTitle(translate('common.insights'));

    const dashboardID = Object.values(CONST.INSIGHTS.DASHBOARD).find((id) => id === route.params?.dashboardID);

    if (!isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE) || !dashboardID || (!isLoadingOnyxValue(accessibleDashboardsMetadata) && !accessibleDashboards.includes(dashboardID))) {
        return <NotFoundPage />;
    }

    return (
        <InsightsDashboard
            dashboardID={dashboardID}
            accessibleDashboards={accessibleDashboards}
        />
    );
}

export default InsightsPage;
