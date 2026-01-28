import React, {useState} from 'react';
import usePermissions from '@hooks/usePermissions';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import FreezeWrapper from '@libs/Navigation/AppNavigator/FreezeWrapper';
import usePreloadFullScreenNavigators from '@libs/Navigation/AppNavigator/usePreloadFullScreenNavigators';
import useSplitNavigatorScreenOptions from '@libs/Navigation/AppNavigator/useSplitNavigatorScreenOptions';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import shouldOpenOnAdminRoom from '@libs/Navigation/helpers/shouldOpenOnAdminRoom';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList, ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const loadReportScreen = () => require<ReactComponentModule>('@pages/home/ReportScreen').default;
const loadSidebarScreen = () => require<ReactComponentModule>('@pages/home/sidebar/BaseSidebarScreen').default;
const Split = createSplitNavigator<ReportsSplitNavigatorParamList>();

/**
 * This SplitNavigator includes the HOME screen (<BaseSidebarScreen /> component) with a list of reports as a sidebar screen and the REPORT screen displayed as a central one.
 * There can be multiple report screens in the stack with different report IDs.
 */
function ReportsSplitNavigator({route}: PlatformStackScreenProps<AuthScreensParamList, typeof NAVIGATORS.REPORTS_SPLIT_NAVIGATOR>) {
    const {isBetaEnabled} = usePermissions();
    const splitNavigatorScreenOptions = useSplitNavigatorScreenOptions();

    const [initialReportID] = useState(() => {
        const currentURL = getCurrentUrl();
        // Determine if the current URL indicates a transition.
        const isTransitioning = currentURL.includes(ROUTES.TRANSITION_BETWEEN_APPS);

        const reportIdFromPath = currentURL && new URL(currentURL).pathname.match(CONST.REGEX.REPORT_ID_FROM_PATH)?.at(1);
        if (reportIdFromPath) {
            return reportIdFromPath;
        }

        // If we are in a transition, we explicitly do NOT want to load the last accessed report.
        // Returning an empty string here will cause ReportScreen to skip the `openReport` call initially.
        if (isTransitioning) {
            return '';
        }

        const initialReport = ReportUtils.findLastAccessedReport(!isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS), shouldOpenOnAdminRoom());
        // eslint-disable-next-line rulesdir/no-default-id-values
        return initialReport?.reportID ?? '';
    });

    // This hook preloads the screens of adjacent tabs to make changing tabs faster.
    usePreloadFullScreenNavigators();

    const isOpenOnAdminRoom = shouldOpenOnAdminRoom();

    const reportScreenInitialParams = {
        reportID: initialReportID,
        openOnAdminRoom: isOpenOnAdminRoom ? true : undefined,
    };

    return (
        <FreezeWrapper>
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
                    getComponent={loadReportScreen}
                />
            </Split.Navigator>
        </FreezeWrapper>
    );
}

export default ReportsSplitNavigator;
