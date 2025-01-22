import {useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import usePermissions from '@hooks/usePermissions';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import FreezeWrapper from '@libs/Navigation/AppNavigator/FreezeWrapper';
import useSplitNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import shouldOpenOnAdminRoom from '@libs/Navigation/helpers/shouldOpenOnAdminRoom';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadReportScreen = () => require<ReactComponentModule>('@pages/home/ReportScreen').default;
const loadSidebarScreen = () => require<ReactComponentModule>('@pages/home/sidebar/SidebarScreen').default;

const Split = createSplitNavigator<ReportsSplitNavigatorParamList>();

function ReportsSplitNavigator() {
    const {canUseDefaultRooms} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();
    const route = useRoute();
    const splitNavigatorScreenOptions = useSplitNavigatorScreenOptions();

    const [initialReportID] = useState(() => {
        const currentURL = getCurrentUrl();
        const reportIdFromPath = currentURL && new URL(currentURL).pathname.match(CONST.REGEX.REPORT_ID_FROM_PATH)?.at(1);
        if (reportIdFromPath) {
            return reportIdFromPath;
        }

        const initialReport = ReportUtils.findLastAccessedReport(!canUseDefaultRooms, shouldOpenOnAdminRoom(), activeWorkspaceID);
        return initialReport?.reportID;
    });

    return (
        <FreezeWrapper>
            <FocusTrapForScreens>
                <Split.Navigator
                    sidebarScreen={SCREENS.HOME}
                    defaultCentralScreen={SCREENS.REPORT}
                    parentRoute={route}
                    screenOptions={splitNavigatorScreenOptions.centralScreen}
                >
                    <Split.Screen
                        name={SCREENS.HOME}
                        getComponent={loadSidebarScreen}
                        options={splitNavigatorScreenOptions.sidebarScreen}
                    />
                    <Split.Screen
                        name={SCREENS.REPORT}
                        initialParams={{reportID: initialReportID, openOnAdminRoom: shouldOpenOnAdminRoom() ? true : undefined}}
                        getComponent={loadReportScreen}
                    />
                </Split.Navigator>
            </FocusTrapForScreens>
        </FreezeWrapper>
    );
}

ReportsSplitNavigator.displayName = 'ReportsSplitNavigator';

export default ReportsSplitNavigator;
