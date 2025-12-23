import {NavigationRouteContext} from '@react-navigation/native';
import React from 'react';
import useOnyx from '@hooks/useOnyx';
import type {ExtraContentProps, PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import ReportScreen from '@pages/home/ReportScreen';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

const CONCIERGE_REPORT_KEY = 'Report-Concierge-Key';

function Concierge({navigation}: Pick<ExtraContentProps, 'navigation'>) {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const route = !!conciergeReportID && ({name: SCREENS.REPORT, params: {reportID: conciergeReportID}, key: CONCIERGE_REPORT_KEY} as const);

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

export default Concierge;
