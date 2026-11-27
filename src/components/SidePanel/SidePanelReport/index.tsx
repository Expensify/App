import {IsInSidePanelContext} from '@hooks/useIsInSidePanel';
import useOnyx from '@hooks/useOnyx';

import type {ExtraContentProps, PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';

import ReportScreen from '@pages/inbox/ReportScreen';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {NavigationRouteContext} from '@react-navigation/native';
import React from 'react';

type SidePanelReportProps = Pick<ExtraContentProps, 'navigation'> & {
    reportID: string;
    reportActionID?: string;
};

function SidePanelReport({navigation, reportID, reportActionID}: SidePanelReportProps) {
    // A failed optimistic question removes its reply. Never leave this synthetic route anchored to that missing action.
    const [hasAnchor] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {selector: (actions) => !!reportActionID && !!actions?.[reportActionID]});
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const route = {name: SCREENS.REPORT, params: {reportID, reportActionID: hasAnchor ? reportActionID : undefined}, key: `Report-SidePanel-${reportID}`} as const;

    return (
        <IsInSidePanelContext.Provider value>
            <NavigationRouteContext.Provider value={route}>
                <ReportScreen
                    route={route}
                    navigation={navigation as unknown as PlatformStackNavigationProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>}
                />
            </NavigationRouteContext.Provider>
        </IsInSidePanelContext.Provider>
    );
}

export default SidePanelReport;
