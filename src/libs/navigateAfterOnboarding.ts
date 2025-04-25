import {InteractionManager} from 'react-native';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {OnboardingPurpose} from '@src/types/onyx';
import shouldOpenOnAdminRoom from './Navigation/helpers/shouldOpenOnAdminRoom';
import Navigation from './Navigation/Navigation';
import {findLastAccessedReport, isConciergeChatReport} from './ReportUtils';

const navigateAfterOnboarding = (
    onboardingPurposeSelected: OnboardingPurpose,
    isSmallScreenWidth: boolean,
    canUseDefaultRooms: boolean | undefined,
    onboardingPolicyID?: string,
    activeWorkspaceID?: string,
    onboardingAdminsChatReportID?: string,
    shouldPreventOpenAdminRoom = false,
) => {
    Navigation.dismissModal();

    if (onboardingPurposeSelected === CONST.ONBOARDING_CHOICES.MANAGE_TEAM) {
        InteractionManager.runAfterInteractions(() => Navigation.navigate(ROUTES.TEST_DRIVE_MODAL_ROOT));
        return;
    }

    // When hasCompletedGuidedSetupFlow is true, OnboardingModalNavigator in AuthScreen is removed from the navigation stack.
    // On small screens, this removal redirects navigation to HOME. Dismissing the modal doesn't work properly,
    // so we need to specifically navigate to the last accessed report.
    if (!isSmallScreenWidth) {
        if (onboardingAdminsChatReportID && !shouldPreventOpenAdminRoom) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(onboardingAdminsChatReportID));
        }
        return;
    }

    const lastAccessedReport = findLastAccessedReport(!canUseDefaultRooms, shouldOpenOnAdminRoom() && !shouldPreventOpenAdminRoom, activeWorkspaceID);
    const lastAccessedReportID = lastAccessedReport?.reportID;
    // we don't want to navigate to newly created workspaces after onboarding is completed.
    if (!lastAccessedReportID || lastAccessedReport.policyID === onboardingPolicyID || isConciergeChatReport(lastAccessedReport)) {
        return;
    }

    const lastAccessedReportRoute = ROUTES.REPORT_WITH_ID.getRoute(lastAccessedReportID);
    Navigation.navigate(lastAccessedReportRoute);
};

export default navigateAfterOnboarding;
