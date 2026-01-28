import {NavigationRouteContext} from '@react-navigation/native';
import React from 'react';
import type {ExtraContentProps, PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import ReportScreen from '@pages/inbox/ReportScreen';
import SCREENS from '@src/SCREENS';

type SidePanelReportProps = Pick<ExtraContentProps, 'navigation'> & {
    reportID: string;
};

function SidePanelReport({navigation, reportID}: SidePanelReportProps) {
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const route = {name: SCREENS.REPORT, params: {reportID}, key: `Report-SidePanel-${reportID}`} as const;

    return (
        <NavigationRouteContext.Provider value={route}>
            <ReportScreen
                route={route}
                navigation={navigation as unknown as PlatformStackNavigationProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>}
                isInSidePanel
            />
        </NavigationRouteContext.Provider>
    );
}

export default SidePanelReport;
