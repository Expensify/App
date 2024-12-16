import ROUTES from '@src/ROUTES';
import * as Report from './actions/Report';
import Navigation from './Navigation/Navigation';
import shouldOpenOnAdminRoom from './Navigation/shouldOpenOnAdminRoom';
import * as ReportUtils from './ReportUtils';

const navigateAfterOnboarding = (
    isSmallScreenWidth: boolean,
    shouldUseNarrowLayout: boolean,
    canUseDefaultRooms: boolean | undefined,
    onboardingPolicyID?: string,
    activeWorkspaceID?: string,
    backTo?: string,
) => {
    Navigation.dismissModal();

    // When hasCompletedGuidedSetupFlow is true, OnboardingModalNavigator in AuthScreen is removed from the navigation stack.
    // On small screens, this removal redirects navigation to HOME. Dismissing the modal doesn't work properly,
    // so we need to specifically navigate to the last accessed report.
    if (!isSmallScreenWidth) {
        return;
    }

    const lastAccessedReport = ReportUtils.findLastAccessedReport(!canUseDefaultRooms, shouldOpenOnAdminRoom(), activeWorkspaceID);
    const lastAccessedReportID = lastAccessedReport?.reportID;
    // we don't want to navigate to newly creaded workspace after onboarding completed.
    if (!lastAccessedReportID || lastAccessedReport.policyID === onboardingPolicyID) {
        // Only navigate to concierge chat when central pane is visible
        // Otherwise stay on the chats screen.
        if (!shouldUseNarrowLayout && !backTo) {
            Report.navigateToConciergeChat();
        }
        return;
    }

    const lastAccessedReportRoute = ROUTES.REPORT_WITH_ID.getRoute(lastAccessedReportID ?? '-1');
    Navigation.navigate(lastAccessedReportRoute);
};

export default navigateAfterOnboarding;
