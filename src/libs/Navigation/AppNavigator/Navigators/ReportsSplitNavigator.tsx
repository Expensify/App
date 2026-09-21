import useFindLastAccessedReport from '@hooks/useFindLastAccessedReport';
import {IsInPreloadedTabContext} from '@hooks/useIsInPreloadedTab';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import FreezeWrapper from '@libs/Navigation/AppNavigator/FreezeWrapper';
import useSplitNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import shouldOpenOnAdminRoom from '@libs/Navigation/helpers/shouldOpenOnAdminRoom';
import {isTabRoutePreloaded} from '@libs/Navigation/helpers/tabNavigatorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NavigationStateRoute, ReportsSplitNavigatorParamList, TabNavigatorParamList} from '@libs/Navigation/types';

import type {ReportScreenProps} from '@pages/inbox/ReportScreen';

import CONST from '@src/CONST';
import type NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

import {useNavigationState} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';

const loadReportScreen = () => require<{default: React.ComponentType<ReportScreenProps>}>('@pages/inbox/ReportScreen').default;
const loadSidebarScreen = () => require<ReactComponentModule>('@pages/inbox/sidebar/BaseSidebarScreen').default;
const Split = createSplitNavigator<ReportsSplitNavigatorParamList>();

/**
 * This SplitNavigator includes the HOME screen (<BaseSidebarScreen /> component) with a list of reports as a sidebar screen and the REPORT screen displayed as a central one.
 * There can be multiple report screens in the stack with different report IDs.
 */
function ReportsSplitNavigator({navigation, route}: PlatformStackScreenProps<TabNavigatorParamList, typeof NAVIGATORS.REPORTS_SPLIT_NAVIGATOR>) {
    const splitNavigatorScreenOptions = useSplitNavigatorScreenOptions();
    const isOpenOnAdminRoom = shouldOpenOnAdminRoom();
    const shouldClearInitialReportActionsDefer = !!route.params && 'shouldDeferInitialReportActions' in route.params && route.params.shouldDeferInitialReportActions === true;
    const [shouldDeferInitialReportActions] = useState(() => shouldClearInitialReportActionsDefer);
    const isInPreloadedTab = useNavigationState((tabState) => isTabRoutePreloaded(tabState, route.key));

    const routeReportID = route.params && 'screen' in route.params && route.params.screen === SCREENS.REPORT ? route.params.params?.reportID : undefined;
    const currentURL = getCurrentUrl();
    const isTransitioning = currentURL.includes(ROUTES.TRANSITION_BETWEEN_APPS);
    const reportIdFromPath = currentURL ? new URL(currentURL).pathname.match(CONST.REGEX.REPORT_ID_FROM_PATH)?.at(1) : undefined;
    const shouldResolveReportID = !routeReportID && !reportIdFromPath && !isTransitioning;

    const {lastAccessedReportID} = useFindLastAccessedReport({
        openOnAdminRoom: isOpenOnAdminRoom,
        enabled: shouldResolveReportID,
    });

    const [initialReportID] = useState(() => {
        // Deep links and REPORT_WITH_ID navigation pass the reportID in nested params,
        // which lets us skip the scan over all reports.
        if (routeReportID) {
            return routeReportID;
        }

        if (reportIdFromPath) {
            return reportIdFromPath;
        }

        // If we are in a transition, we explicitly do NOT want to load the last accessed report.
        // Returning an empty string here will cause ReportScreen to skip the `openReport` call initially.
        if (isTransitioning) {
            return '';
        }

        // eslint-disable-next-line rulesdir/no-default-id-values
        return lastAccessedReportID ?? '';
    });

    useEffect(() => {
        if (!shouldClearInitialReportActionsDefer) {
            return;
        }
        navigation.setParams({shouldDeferInitialReportActions: undefined});
    }, [navigation, shouldClearInitialReportActionsDefer]);

    const reportScreenInitialParams = {
        reportID: initialReportID,
        openOnAdminRoom: isOpenOnAdminRoom ? true : undefined,
    };

    return (
        <FreezeWrapper>
            <IsInPreloadedTabContext.Provider value={isInPreloadedTab}>
                <Split.Navigator
                    persistentScreens={[SCREENS.INBOX]}
                    sidebarScreen={SCREENS.INBOX}
                    defaultCentralScreen={SCREENS.REPORT}
                    parentRoute={route}
                    screenOptions={splitNavigatorScreenOptions.centralScreen}
                >
                    <Split.Screen
                        name={SCREENS.INBOX}
                        getComponent={loadSidebarScreen}
                        options={splitNavigatorScreenOptions.sidebarScreen}
                    />
                    <Split.Screen
                        name={SCREENS.REPORT}
                        initialParams={reportScreenInitialParams}
                    >
                        {(screenProps: ReportScreenProps) => {
                            const ReportScreen = loadReportScreen();
                            // A split navigator can contain multiple report routes, but the Inbox defer should only apply to the route that mounted with the navigator.
                            const initialReportRouteKey = screenProps.navigation
                                .getState()
                                .routes.find((navigatorRoute: NavigationStateRoute) => navigatorRoute.name === SCREENS.REPORT)?.key;
                            return (
                                <ReportScreen
                                    {...screenProps}
                                    shouldDeferReportActions={shouldDeferInitialReportActions && initialReportRouteKey === screenProps.route.key}
                                />
                            );
                        }}
                    </Split.Screen>
                </Split.Navigator>
            </IsInPreloadedTabContext.Provider>
        </FreezeWrapper>
    );
}

export default ReportsSplitNavigator;
