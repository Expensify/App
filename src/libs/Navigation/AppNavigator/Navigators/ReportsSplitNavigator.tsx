import React, {useState} from 'react';
import {View} from 'react-native';
import InboxSidebar from '@components/Navigation/InboxSidebar';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import {SidebarWidthContext} from '@libs/Navigation/AppNavigator/createSplitNavigator/SidebarSpacerWrapper';
import FreezeWrapper from '@libs/Navigation/AppNavigator/FreezeWrapper';
import useSplitNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import shouldOpenOnAdminRoom from '@libs/Navigation/helpers/shouldOpenOnAdminRoom';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, TabNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadReportScreen = () => require<ReactComponentModule>('@pages/inbox/ReportScreen').default;
const loadSidebarScreen = () => require<ReactComponentModule>('@pages/inbox/sidebar/BaseSidebarScreen').default;
const loadEmptyComponent = () => require<ReactComponentModule>('@components/EmptyComponent').default;
const Split = createSplitNavigator<ReportsSplitNavigatorParamList>();

/**
 * This SplitNavigator includes the HOME screen (<BaseSidebarScreen /> component) with a list of reports as a sidebar screen and the REPORT screen displayed as a central one.
 * There can be multiple report screens in the stack with different report IDs.
 */
function ReportsSplitNavigator({route}: PlatformStackScreenProps<TabNavigatorParamList, typeof NAVIGATORS.REPORTS_SPLIT_NAVIGATOR>) {
    const {isBetaEnabled} = usePermissions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    // On wide, the sidebar lives OUTSIDE the navigator (see InboxSidebar). Pass 0 so the
    // sidebar card doesn't reserve / collide with that space — the outside sidebar's
    // animated width is what shifts the central content.
    const splitNavigatorScreenOptions = useSplitNavigatorScreenOptions(shouldUseNarrowLayout ? variables.inboxSidebarWidth : 0);
    const archivedReportsIdSet = useArchivedReportsIdSet();
    const isOpenOnAdminRoom = shouldOpenOnAdminRoom();

    const [initialReportID] = useState(() => {
        // Deep links and REPORT_WITH_ID navigation pass the reportID in nested params,
        // which lets us skip the O(n) findLastAccessedReport scan over all reports.
        if (route.params?.screen === SCREENS.REPORT && route.params.params?.reportID) {
            return route.params.params.reportID;
        }

        const currentURL = getCurrentUrl();
        const isTransitioning = currentURL.includes(ROUTES.TRANSITION_BETWEEN_APPS);

        const reportIdFromPath = currentURL ? new URL(currentURL).pathname.match(CONST.REGEX.REPORT_ID_FROM_PATH)?.at(1) : undefined;
        if (reportIdFromPath) {
            return reportIdFromPath;
        }

        // If we are in a transition, we explicitly do NOT want to load the last accessed report.
        // Returning an empty string here will cause ReportScreen to skip the `openReport` call initially.
        if (isTransitioning) {
            return '';
        }

        const initialReport = ReportUtils.findLastAccessedReport(!isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS), isOpenOnAdminRoom, undefined, archivedReportsIdSet);
        // eslint-disable-next-line rulesdir/no-default-id-values
        return initialReport?.reportID ?? '';
    });

    const reportScreenInitialParams = {
        reportID: initialReportID,
        openOnAdminRoom: isOpenOnAdminRoom ? true : undefined,
    };

    return (
        <FreezeWrapper>
            <View style={shouldUseNarrowLayout ? styles.flex1 : [styles.flex1, styles.flexRow]}>
                {!shouldUseNarrowLayout && <InboxSidebar />}
                <View style={styles.flex1}>
                    <SidebarWidthContext.Provider value={shouldUseNarrowLayout ? variables.inboxSidebarWidth : 0}>
                        <Split.Navigator
                            persistentScreens={[SCREENS.INBOX]}
                            sidebarScreen={SCREENS.INBOX}
                            defaultCentralScreen={SCREENS.REPORT}
                            parentRoute={route}
                            screenOptions={splitNavigatorScreenOptions.centralScreen}
                        >
                            <Split.Screen
                                name={SCREENS.INBOX}
                                getComponent={shouldUseNarrowLayout ? loadSidebarScreen : loadEmptyComponent}
                                options={splitNavigatorScreenOptions.sidebarScreen}
                            />
                            <Split.Screen
                                name={SCREENS.REPORT}
                                initialParams={reportScreenInitialParams}
                                getComponent={loadReportScreen}
                            />
                        </Split.Navigator>
                    </SidebarWidthContext.Provider>
                </View>
            </View>
        </FreezeWrapper>
    );
}

export default ReportsSplitNavigator;
