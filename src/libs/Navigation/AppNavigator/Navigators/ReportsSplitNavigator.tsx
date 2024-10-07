import React, {useRef} from 'react';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import withPrepareCentralPaneScreen from '@components/withPrepareCentralPaneScreen';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import usePermissions from '@hooks/usePermissions';
import createSplitStackNavigator from '@libs/Navigation/AppNavigator/createSplitStackNavigator';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import SidebarScreen from '@pages/home/sidebar/SidebarScreen';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadReportScreen = withPrepareCentralPaneScreen(() => require<ReactComponentModule>('../../../../pages/home/ReportScreen').default);

const Stack = createSplitStackNavigator<ReportsSplitNavigatorParamList>();

function shouldOpenOnAdminRoom() {
    const url = getCurrentUrl();
    return url ? new URL(url).searchParams.get('openOnAdminRoom') === 'true' : false;
}

function ReportsSplitNavigator() {
    const {canUseDefaultRooms} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();

    let initialReportID: string | undefined;
    const isInitialRender = useRef(true);

    if (isInitialRender.current) {
        const currentURL = getCurrentUrl();
        if (currentURL) {
            initialReportID = new URL(currentURL).pathname.match(CONST.REGEX.REPORT_ID_FROM_PATH)?.at(1);
        }

        if (!initialReportID) {
            const initialReport = ReportUtils.findLastAccessedReport(!canUseDefaultRooms, shouldOpenOnAdminRoom(), activeWorkspaceID);
            initialReportID = initialReport?.reportID ?? '';
        }

        isInitialRender.current = false;
    }

    return (
        <FocusTrapForScreens>
            <Stack.Navigator
                sidebarScreen={SCREENS.HOME}
                defaultCentralScreen={SCREENS.REPORT}
            >
                <Stack.Screen
                    name={SCREENS.HOME}
                    component={SidebarScreen}
                />
                <Stack.Screen
                    name={SCREENS.REPORT}
                    initialParams={{reportID: initialReportID, openOnAdminRoom: shouldOpenOnAdminRoom() ? true : undefined}}
                    getComponent={loadReportScreen}
                />
            </Stack.Navigator>
        </FocusTrapForScreens>
    );
}

ReportsSplitNavigator.displayName = 'ReportsSplitNavigator';

export default ReportsSplitNavigator;
