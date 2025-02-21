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
) => {
    Navigation.dismissModal();

    // When hasCompletedGuidedSetupFlow is true, OnboardingModalNavigator in AuthScreen is removed from the navigation stack.
    // On small screens, this removal redirects navigation to HOME. Dismissing the modal doesn't work properly,
    // so we need to specifically navigate to the last accessed report.
    if (!isSmallScreenWidth) {
        if (onboardingAdminsChatReportID) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(onboardingAdminsChatReportID));
        }
        return;
    }

    const lastAccessedReport = findLastAccessedReport(!canUseDefaultRooms, shouldOpenOnAdminRoom(), activeWorkspaceID);
    const lastAccessedReportID = lastAccessedReport?.reportID;
    // we don't want to navigate to newly created workspaces after onboarding is completed.
    if (!lastAccessedReportID || lastAccessedReport.policyID === onboardingPolicyID || isConciergeChatReport(lastAccessedReport)) {
        return;
    }

    const lastAccessedReportRoute = ROUTES.REPORT_WITH_ID.getRoute(lastAccessedReportID);
    Navigation.navigate(lastAccessedReportRoute);
};

export default navigateAfterOnboarding;
