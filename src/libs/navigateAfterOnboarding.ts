import shouldOpenOnAdminRoom from '@libs/Navigation/shouldOpenOnAdminRoom';
import * as ReportUtils from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import * as Report from '@userActions/Report';
import ROUTES from '@src/ROUTES';

const navigateAfterOnboarding = (isSmallScreenWidth: boolean, canUseDefaultRooms: boolean | undefined, onboardingPolicyID?: string, activeWorkspaceID?: string, backTo?: string) => {
    Navigation.dismissModal();

    // When hasCompletedGuidedSetupFlow is true, OnboardingModalNavigator in AuthScreen is removed from the navigation stack.
    // On small screens, this removal redirects navigation to HOME. Dismissing the modal doesn't work properly,
    // so we need to specifically navigate to the last accessed report.
    if (!isSmallScreenWidth) {
        return;
    }

    const lastAccessedReport = ReportUtils.findLastAccessedReport(!canUseDefaultRooms, shouldOpenOnAdminRoom(), activeWorkspaceID);
    const lastAccessedReportID = lastAccessedReport?.reportID;
    if (!lastAccessedReportID || lastAccessedReport.policyID === onboardingPolicyID) {
        if (!backTo) {
            Report.navigateToConciergeChat();
        }
        return;
    }

    const lastAccessedReportRoute = ROUTES.REPORT_WITH_ID.getRoute(lastAccessedReportID ?? '-1');
    Navigation.navigate(lastAccessedReportRoute);
};

export default navigateAfterOnboarding;
