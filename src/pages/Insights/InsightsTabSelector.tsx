import TabSelectorBase from '@components/TabSelector/TabSelectorBase';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {InsightsDashboardID} from '@src/types/onyx';

import React from 'react';

import INSIGHTS_DASHBOARD_SPECS from './dashboardSpecs';

type InsightsTabSelectorProps = {
    /** Dashboard the route currently displays */
    activeDashboardID: InsightsDashboardID;

    /** Dashboards the user can switch between, in the order their tabs are shown */
    dashboardIDs: InsightsDashboardID[];
};

function InsightsTabSelector({activeDashboardID, dashboardIDs}: InsightsTabSelectorProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const tabs = dashboardIDs.map((dashboardID) => ({
        key: dashboardID,
        title: translate(INSIGHTS_DASHBOARD_SPECS[dashboardID].labelKey),
        sentryLabel: CONST.SENTRY_LABEL.INSIGHTS.DASHBOARD_TAB,
        testID: `InsightsTab-${dashboardID}`,
    }));

    return (
        <TabSelectorBase
            contentContainerStyles={[styles.ph0, styles.pb0, styles.flexGrow0]}
            tabButtonStyles={styles.ph6}
            tabs={tabs}
            activeTabKey={activeDashboardID}
            onTabPress={(dashboardID) => Navigation.navigate(ROUTES.INSIGHTS.getRoute(dashboardID))}
        />
    );
}

export default InsightsTabSelector;
