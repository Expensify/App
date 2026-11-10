import useDocumentTitle from '@hooks/useDocumentTitle';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';
import type {TabNavigatorParamList} from '@libs/Navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
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
    const [accessibleDashboards = getEmptyArray<InsightsDashboardID>(), accessibleDashboardsMetadata] = useAccessibleDashboards();
    useDocumentTitle(translate('common.insights'));

    const dashboardID = Object.values(CONST.INSIGHTS.DASHBOARD).find((id) => id === route.params?.dashboardID);

    if (!dashboardID || (!isLoadingOnyxValue(accessibleDashboardsMetadata) && !accessibleDashboards.includes(dashboardID))) {
        return <NotFoundPage onBackButtonPress={() => Navigation.goBack(ROUTES.HOME)} />;
    }

    return (
        <InsightsDashboard
            dashboardID={dashboardID}
            accessibleDashboards={accessibleDashboards}
        />
    );
}

export default InsightsPage;
