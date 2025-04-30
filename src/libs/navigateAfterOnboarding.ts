import {InteractionManager} from 'react-native';
import ROUTES from '@src/ROUTES';
import shouldOpenOnAdminRoom from './Navigation/helpers/shouldOpenOnAdminRoom';
import Navigation from './Navigation/Navigation';
import {findLastAccessedReport, isConciergeChatReport} from './ReportUtils';

const navigateAfterOnboarding = (
    isSmallScreenWidth: boolean,
    canUseDefaultRooms: boolean | undefined,
    onboardingPolicyID?: string,
    activeWorkspaceID?: string,
    onboardingAdminsChatReportID?: string,
    shouldPreventOpenAdminRoom = false,
) => {
    Navigation.dismissModal();

    let reportID: string | undefined;

    // When hasCompletedGuidedSetupFlow is true, OnboardingModalNavigator in AuthScreen is removed from the navigation stack.
    // On small screens, this removal redirects navigation to HOME. Dismissing the modal doesn't work properly,
    // so we need to specifically navigate to the last accessed report.
    if (!isSmallScreenWidth) {
        if (onboardingAdminsChatReportID && !shouldPreventOpenAdminRoom) {
            reportID = onboardingAdminsChatReportID;
        }
    } else {
        const lastAccessedReport = findLastAccessedReport(!canUseDefaultRooms, shouldOpenOnAdminRoom() && !shouldPreventOpenAdminRoom, activeWorkspaceID);
        const lastAccessedReportID = lastAccessedReport?.reportID;
        // we don't want to navigate to newly created workspaces after onboarding is completed.
        if (lastAccessedReportID && lastAccessedReport.policyID !== onboardingPolicyID && !isConciergeChatReport(lastAccessedReport)) {
            reportID = lastAccessedReportID;
        }
    }

    if (reportID) {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
    }

    InteractionManager.runAfterInteractions(() => {
        Navigation.navigate(ROUTES.TEST_DRIVE_MODAL_ROOT);
    });
};

export default navigateAfterOnboarding;
