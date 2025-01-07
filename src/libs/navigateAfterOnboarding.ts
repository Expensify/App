import ROUTES from '@src/ROUTES';
import {shouldOpenOnAdminRoom} from './Navigation/helpers';
import Navigation from './Navigation/Navigation';
import * as ReportUtils from './ReportUtils';

const navigateAfterOnboarding = (isSmallScreenWidth: boolean, canUseDefaultRooms: boolean | undefined, onboardingPolicyID?: string, activeWorkspaceID?: string) => {
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
    if (!lastAccessedReportID || lastAccessedReport.policyID === onboardingPolicyID || ReportUtils.isConciergeChatReport(lastAccessedReport)) {
        return;
    }

    const lastAccessedReportRoute = ROUTES.REPORT_WITH_ID.getRoute(lastAccessedReportID);
    Navigation.navigate(lastAccessedReportRoute);
};

export default navigateAfterOnboarding;
