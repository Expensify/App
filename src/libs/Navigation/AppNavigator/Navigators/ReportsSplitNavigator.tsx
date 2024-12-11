import {useRoute} from '@react-navigation/native';
import React, {useRef} from 'react';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import usePermissions from '@hooks/usePermissions';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import FreezeWrapper from '@libs/Navigation/AppNavigator/FreezeWrapper';
import useRootNavigatorOptions from '@libs/Navigation/AppNavigator/useRootNavigatorOptions';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import shouldOpenOnAdminRoom from '@libs/Navigation/helpers/shouldOpenOnAdminRoom';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadReportScreen = () => require<ReactComponentModule>('../../../../pages/home/ReportScreen').default;
const loadSidebarScreen = () => require<ReactComponentModule>('@pages/home/sidebar/SidebarScreen').default;

const Split = createSplitNavigator<ReportsSplitNavigatorParamList>();

function ReportsSplitNavigator() {
    const {canUseDefaultRooms} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();
    const rootNavigatorOptions = useRootNavigatorOptions();
    const route = useRoute();
    let initialReportID: string | undefined;
    const isInitialRender = useRef(true);

    // TODO: Figure out if compiler affects this code.
    // eslint-disable-next-line react-compiler/react-compiler
    if (isInitialRender.current) {
        const currentURL = getCurrentUrl();
        if (currentURL) {
            initialReportID = new URL(currentURL).pathname.match(CONST.REGEX.REPORT_ID_FROM_PATH)?.at(1);
        }

        if (!initialReportID) {
            const initialReport = ReportUtils.findLastAccessedReport(!canUseDefaultRooms, shouldOpenOnAdminRoom(), activeWorkspaceID);
            initialReportID = initialReport?.reportID ?? '';
        }

        // eslint-disable-next-line react-compiler/react-compiler
        isInitialRender.current = false;
    }

    return (
        <FreezeWrapper>
            <FocusTrapForScreens>
                <Split.Navigator
                    sidebarScreen={SCREENS.HOME}
                    defaultCentralScreen={SCREENS.REPORT}
                    parentRoute={route}
                    screenOptions={rootNavigatorOptions.centralPaneNavigator}
                >
                    <Split.Screen
                        name={SCREENS.HOME}
                        getComponent={loadSidebarScreen}
                        options={rootNavigatorOptions.homeScreen}
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
