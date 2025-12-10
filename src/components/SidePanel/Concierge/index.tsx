import {NavigationRouteContext} from '@react-navigation/native';
import React, {useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import type {ExtraContentProps, PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import ReportScreen from '@pages/home/ReportScreen';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

function Concierge({navigation}: Pick<ExtraContentProps, 'navigation'>) {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});
    const route = useMemo(() => !!conciergeReportID && ({name: SCREENS.REPORT, params: {reportID: conciergeReportID}, key: 'Report-Concierge-Key'} as const), [conciergeReportID]);

    if (!route) {
        return null;
    }

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

Concierge.displayName = 'ConciergeSidePanel';

export default Concierge;
