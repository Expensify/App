import {useNavigationState, useRoute} from '@react-navigation/native';
import React, {useRef} from 'react';
import {Freeze} from 'react-freeze';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import usePermissions from '@hooks/usePermissions';
import memoize from '@libs/memoize';
import createSplitStackNavigator from '@libs/Navigation/AppNavigator/createSplitStackNavigator';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import shouldOpenOnAdminRoom from '@libs/Navigation/shouldOpenOnAdminRoom';
import type {NavigationPartialRoute, ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {isFullScreenRoute} from '@libs/NavigationUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

function FrozenScreen<TProps extends React.JSX.IntrinsicAttributes>(WrappedComponent: React.ComponentType<TProps>, freeze: boolean) {
    return (props: TProps) => (
        <Freeze freeze={freeze}>
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </Freeze>
    );
}

function freezeScreenWithLazyLoading(lazyComponent: () => React.ComponentType, freeze: boolean) {
    return memoize(
        () => {
            const Component = lazyComponent();
            return FrozenScreen(Component, freeze);
        },
        {monitoringName: 'freezeScreenWithLazyLoading'},
    );
}

const loadReportScreen = () => require<ReactComponentModule>('../../../../pages/home/ReportScreen').default;

const Stack = createSplitStackNavigator<ReportsSplitNavigatorParamList>();

function ReportsSplitNavigator() {
    const {canUseDefaultRooms} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();

    let initialReportID: string | undefined;
    const isInitialRender = useRef(true);

    const currentRoute = useRoute();

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

    const shouldFreeze = useNavigationState((state) => {
        const lastFullScreenRoute = state.routes.findLast((route) => isFullScreenRoute(route as NavigationPartialRoute));
        return lastFullScreenRoute?.key !== currentRoute.key;
    });

    const getSidebarScreen = freezeScreenWithLazyLoading(() => require<ReactComponentModule>('@pages/home/sidebar/SidebarScreen').default, shouldFreeze);

    return (
        <Freeze freeze={shouldFreeze}>
            <FocusTrapForScreens>
                <Stack.Navigator
                    sidebarScreen={SCREENS.HOME}
                    defaultCentralScreen={SCREENS.REPORT}
                >
                    <Stack.Screen
                        name={SCREENS.HOME}
                        getComponent={getSidebarScreen}
                    />
                    <Stack.Screen
                        name={SCREENS.REPORT}
                        initialParams={{reportID: initialReportID, openOnAdminRoom: shouldOpenOnAdminRoom() ? true : undefined}}
                        getComponent={loadReportScreen}
                    />
                </Stack.Navigator>
            </FocusTrapForScreens>
        </Freeze>
    );
}

ReportsSplitNavigator.displayName = 'ReportsSplitNavigator';

export default ReportsSplitNavigator;
