import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {Freeze} from 'react-freeze';
import FocusTrapForScreens from '@components/FocusTrap/FocusTrapForScreen';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import usePermissions from '@hooks/usePermissions';
import memoize from '@libs/memoize';
import createSplitStackNavigator from '@libs/Navigation/AppNavigator/createSplitStackNavigator';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import shouldOpenOnAdminRoom from '@libs/Navigation/shouldOpenOnAdminRoom';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
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

    const [isScreenBlurred, setIsScreenBlurred] = useState(false);

    let initialReportID: string | undefined;
    const isInitialRender = useRef(true);

    const screenIndexRef = useRef<number | null>(null);
    const navigation = useNavigation();
    const currentRoute = useRoute();

    useEffect(() => {
        const index = navigation.getState()?.routes.findIndex((route) => route.key === currentRoute.key) ?? 0;
        screenIndexRef.current = index;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('state', () => {
            const navigationIndex = (navigation.getState()?.index ?? 0) - (screenIndexRef.current ?? 0);
            setIsScreenBlurred(navigationIndex >= 1);
        });
        return () => unsubscribe();
    }, [navigation]);

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

    const getSidebarScreen = freezeScreenWithLazyLoading(() => require<ReactComponentModule>('@pages/home/sidebar/SidebarScreen').default, isScreenBlurred);

    return (
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
    );
}

ReportsSplitNavigator.displayName = 'ReportsSplitNavigator';

export default ReportsSplitNavigator;
