import {handleRHPVariantNavigation, shouldOpenRHPVariant} from '@components/SidePanel/RHPVariantTest';
import type {ArchivedReportsIDSet} from './SearchUIUtils';
import ROUTES from '@src/ROUTES';
import {setDisableDismissOnEscape} from './actions/Modal';
import shouldOpenOnAdminRoom from './Navigation/helpers/shouldOpenOnAdminRoom';
import Navigation from './Navigation/Navigation';
import {findLastAccessedReport, isConciergeChatReport, isSelfDM} from './ReportUtils';

/**
 * Determines the report ID to navigate to after onboarding for control variant or ineligible users.
 * On large screens, navigates to the admins chat if available. On small screens, finds the last
 * accessed report while avoiding self DM, Concierge chat, and reports from the onboarding policy.
 */
function getReportIDAfterOnboarding(
    isSmallScreenWidth: boolean,
    canUseDefaultRooms: boolean | undefined,
    onboardingPolicyID?: string,
    onboardingAdminsChatReportID?: string,
    shouldPreventOpenAdminRoom = false,
    archivedReportsIdSet?: ArchivedReportsIDSet,
): string | undefined {
    // When hasCompletedGuidedSetupFlow is true, OnboardingModalNavigator in AuthScreen is removed from the navigation stack.
    // On small screens, this removal redirects navigation to HOME. Dismissing the modal doesn't work properly,
    // so we need to specifically navigate to the last accessed report.
    if (!isSmallScreenWidth) {
        if (onboardingAdminsChatReportID && !shouldPreventOpenAdminRoom) {
            return onboardingAdminsChatReportID;
        }
        return undefined;
    }

    const lastAccessedReport = findLastAccessedReport(!canUseDefaultRooms, shouldOpenOnAdminRoom() && !shouldPreventOpenAdminRoom, undefined, undefined, archivedReportsIdSet);
    const lastAccessedReportID = lastAccessedReport?.reportID;

    // When the user goes through the onboarding flow, a workspace can be created if the user selects specific options. The user should be taken to the #admins room for that workspace because it is the most natural place for them to start their experience in the app.
    // The user should never go to the self DM or the Concierge chat if a workspace was created during the onboarding flow.
    if (lastAccessedReportID && lastAccessedReport.policyID !== onboardingPolicyID && !isConciergeChatReport(lastAccessedReport) && !isSelfDM(lastAccessedReport)) {
        return lastAccessedReportID;
    }

    return undefined;
}

function navigateAfterOnboarding(
    isSmallScreenWidth: boolean,
    canUseDefaultRooms: boolean | undefined,
    onboardingPolicyID?: string,
    onboardingAdminsChatReportID?: string,
    shouldPreventOpenAdminRoom = false,
    archivedReportsIdSet?: ArchivedReportsIDSet,
) {
    setDisableDismissOnEscape(false);

    if (shouldOpenRHPVariant()) {
        handleRHPVariantNavigation(onboardingPolicyID);
        return;
    }

    const reportID = getReportIDAfterOnboarding(isSmallScreenWidth, canUseDefaultRooms, onboardingPolicyID, onboardingAdminsChatReportID, shouldPreventOpenAdminRoom, archivedReportsIdSet);
    if (reportID) {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
    }

    // In this case, we have joined an accessible policy. We would have an onboarding policy, but not an admins chat report.
    // We should skip the Test Drive modal in this case since we already have a policy to join.
    if (onboardingPolicyID && !onboardingAdminsChatReportID) {
        return;
    }

    // We're using Navigation.isNavigationReady here because without it, on iOS,
    // Navigation.dismissModal runs after Navigation.navigate(ROUTES.TEST_DRIVE_MODAL_ROOT.route)
    // And dismisses the modal before it even shows
    Navigation.isNavigationReady().then(() => {
        Navigation.navigate(ROUTES.TEST_DRIVE_MODAL_ROOT.route);
    });
}

function navigateAfterOnboardingWithMicrotaskQueue(
    isSmallScreenWidth: boolean,
    canUseDefaultRooms: boolean | undefined,
    onboardingPolicyID?: string,
    onboardingAdminsChatReportID?: string,
    shouldPreventOpenAdminRoom = false,
    archivedReportsIdSet?: ArchivedReportsIDSet,
) {
    Navigation.dismissModal();
    Navigation.setNavigationActionToMicrotaskQueue(() => {
        navigateAfterOnboarding(isSmallScreenWidth, canUseDefaultRooms, onboardingPolicyID, onboardingAdminsChatReportID, shouldPreventOpenAdminRoom, archivedReportsIdSet);
    });
}

export {navigateAfterOnboarding, navigateAfterOnboardingWithMicrotaskQueue};
