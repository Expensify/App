import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useDocumentTitle from '@hooks/useDocumentTitle';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';

import type {TabNavigatorParamList} from '@libs/Navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

import React from 'react';

type InsightsPageProps = BottomTabScreenProps<TabNavigatorParamList, typeof SCREENS.INSIGHTS>;

function InsightsPage({route}: InsightsPageProps) {
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    useDocumentTitle(translate('common.insights'));

    // A blurred tab slot is a bare `{name}` entry (see `buildTabNavigatorNestedState`), so this still-mounted screen
    // re-renders without params when the browser back button resets the root state onto another tab. Defaulting keeps
    // it off `NotFoundPage`, which would report a bogus not-found span; only an unknown dashboard ID is a real 404.
    const dashboardID = route.params?.dashboardID ?? CONST.INSIGHTS.DASHBOARD.SPEND;
    const isKnownDashboard = dashboardID === CONST.INSIGHTS.DASHBOARD.SPEND;

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
