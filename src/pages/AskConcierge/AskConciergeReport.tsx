import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, TabNavigatorParamList} from '@libs/Navigation/types';

import ReportScreen from '@pages/inbox/ReportScreen';

import SCREENS from '@src/SCREENS';

import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

import {NavigationRouteContext} from '@react-navigation/native';
import React from 'react';

type AskConciergeReportProps = {
    navigation: BottomTabScreenProps<TabNavigatorParamList, typeof SCREENS.ASK_CONCIERGE>['navigation'];
    reportID: string;
};

/**
 * Shows a Concierge chat or thread next to the Ask Concierge sidebar. ReportScreen reads its report from the
 * navigation route, so the route built here stands in for the one a split navigator supplies. The side panel
 * shows a report the same way.
 */
function AskConciergeReport({navigation, reportID}: AskConciergeReportProps) {
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const route = {name: SCREENS.REPORT, params: {reportID}, key: `Report-AskConcierge-${reportID}`} as const;

    return (
        <NavigationRouteContext.Provider value={route}>
            <ReportScreen
                route={route}
                // ReportScreen only uses navigation to push further screens, which every navigator in the tab can do.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                navigation={navigation as unknown as PlatformStackNavigationProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>}
            />
        </NavigationRouteContext.Provider>
    );
}

export default AskConciergeReport;
