import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useDocumentTitle from '@hooks/useDocumentTitle';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';

import {getInsights} from '@libs/actions/Insights';
import type {TabNavigatorParamList} from '@libs/Navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect} from 'react';

import buildInsightsJsonQuery from './insightsQueries';
import useInsightsFilters from './useInsightsFilters';

type InsightsPageProps = BottomTabScreenProps<TabNavigatorParamList, typeof SCREENS.INSIGHTS>;

function InsightsPage({route}: InsightsPageProps) {
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    useDocumentTitle(translate('common.insights'));

    const dashboardID = Object.values(CONST.INSIGHTS.DASHBOARD).find((id) => id === route.params.dashboardID) ?? CONST.INSIGHTS.DASHBOARD.SPEND;
    const isKnownDashboard = dashboardID === route.params.dashboardID;

    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const {filters, isResolved} = useInsightsFilters();

    const query = isResolved && isKnownDashboard ? buildInsightsJsonQuery(dashboardID, filters) : undefined;
    const jsonQuery = query?.jsonQuery;
    const queryString = query?.queryString;

    // Asks once per query, every time the tab is opened, so a dashboard returned to is refreshed and a request that
    // failed is retried.
    useEffect(() => {
        if (!jsonQuery || !queryString || !isFocused || isOffline) {
            return;
        }
        getInsights(dashboardID, {jsonQuery, queryString});
    }, [dashboardID, jsonQuery, queryString, isFocused, isOffline]);

    if (!isBetaEnabled(CONST.BETAS.INSIGHTS_PAGE) || !isKnownDashboard) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            shouldShowOfflineIndicatorInWideScreen
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            bottomContent={<TabBarBottomContent selectedTab={NAVIGATION_TABS.INSIGHTS} />}
            testID="InsightsPage"
        >
            <TopBar
                breadcrumbLabel={translate('common.insights')}
                shouldDisplayHelpButton
            />
            <ScrollView addBottomSafeAreaPadding />
        </ScreenWrapper>
    );
}

export default InsightsPage;
