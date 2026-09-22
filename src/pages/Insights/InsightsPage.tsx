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
import type {InsightsDashboardID} from '@src/types/onyx';

import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect} from 'react';

import InsightsPageControls from './controls/InsightsPageControls';
import buildInsightsJsonQuery from './insightsQueries';
import useInsightsFilters from './useInsightsFilters';

type InsightsPageProps = BottomTabScreenProps<TabNavigatorParamList, typeof SCREENS.INSIGHTS>;

function InsightsDashboard({dashboardID}: {dashboardID: InsightsDashboardID}) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const {filters, isResolved, setFilters} = useInsightsFilters(dashboardID);

    const query = isResolved ? buildInsightsJsonQuery(dashboardID, filters) : undefined;
    const jsonQuery = query?.jsonQuery;
    const hash = query?.hash;

    useEffect(() => {
        if (!jsonQuery || hash === undefined || !isFocused || isOffline) {
            return;
        }
        getInsights(dashboardID, hash, jsonQuery);
    }, [dashboardID, hash, jsonQuery, isFocused, isOffline]);

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
            <InsightsPageControls
                filters={filters}
                onChange={setFilters}
            />
            <ScrollView addBottomSafeAreaPadding />
        </ScreenWrapper>
    );
}

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
