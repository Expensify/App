import useDocumentTitle from '@hooks/useDocumentTitle';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';

import type {TabNavigatorParamList} from '@libs/Navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

import React from 'react';

import InsightsDashboard from './InsightsDashboard';

type InsightsPageProps = BottomTabScreenProps<TabNavigatorParamList, typeof SCREENS.INSIGHTS>;

function InsightsPage({route}: InsightsPageProps) {
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    useDocumentTitle(translate('common.insights'));

    const dashboardID = Object.values(CONST.INSIGHTS.DASHBOARD).find((id) => id === route.params?.dashboardID);

    if (!isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE) || !dashboardID) {
        return <NotFoundPage />;
    }

    return <InsightsDashboard dashboardID={dashboardID} />;
}

export default InsightsPage;
