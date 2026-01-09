import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OnboardingRHPVariant} from '@src/types/onyx';
import {setDisableDismissOnEscape} from './actions/Modal';
import SidePanelActions from './actions/SidePanel';
import shouldOpenOnAdminRoom from './Navigation/helpers/shouldOpenOnAdminRoom';
import Navigation from './Navigation/Navigation';
import {findLastAccessedReport, isConciergeChatReport, isSelfDM} from './ReportUtils';

let onboardingRHPVariant: OnyxEntry<OnboardingRHPVariant>;
let onboardingCompanySize: OnyxEntry<string>;

// We use Onyx.connectWithoutView because we do not use this in React components and this logic is not tied directly to the UI.
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ONBOARDING_RHP_VARIANT,
    callback: (value) => {
        onboardingRHPVariant = value;
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.ONBOARDING_COMPANY_SIZE,
    callback: (value) => {
        onboardingCompanySize = value;
    },
});

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

    const lastAccessedReport = findLastAccessedReport(!canUseDefaultRooms, shouldOpenOnAdminRoom() && !shouldPreventOpenAdminRoom);
    const lastAccessedReportID = lastAccessedReport?.reportID;

    // When the user goes through the onboarding flow, a workspace can be created if the user selects specific options. The user should be taken to the #admins room for that workspace because it is the most natural place for them to start their experience in the app.
    // The user should never go to the self DM or the Concierge chat if a workspace was created during the onboarding flow.
    if (lastAccessedReportID && lastAccessedReport.policyID !== onboardingPolicyID && !isConciergeChatReport(lastAccessedReport) && !isSelfDM(lastAccessedReport)) {
        return lastAccessedReportID;
    }

    return undefined;
}

/**
 * Handles navigation for RHP experiment:
 * - Control: navigate to the last accessed report on small screens, do not open side panel
 * - RHP Concierge DM: navigate to the workspace overview and open the side panel with the Concierge DM
 * - RHP Admins Room: navigate to the workspace overview and open the side panel with the Admins Room
 */
function handleRHPVariantNavigation(isRHPAdminsRoom: boolean, onboardingPolicyID?: string, onboardingAdminsChatReportID?: string) {
    Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW.getRoute(onboardingPolicyID));
    SidePanelActions.openSidePanelWithContent(true, isRHPAdminsRoom ? onboardingAdminsChatReportID : undefined);
    Navigation.isNavigationReady().then(() => {
        Navigation.navigate(ROUTES.TEST_DRIVE_MODAL_ROOT.route);
    });
}

function navigateAfterOnboarding(
    isSmallScreenWidth: boolean,
    canUseDefaultRooms: boolean | undefined,
    onboardingPolicyID?: string,
    onboardingAdminsChatReportID?: string,
    shouldPreventOpenAdminRoom = false,
) {
    setDisableDismissOnEscape(false);

    const isMicroCompany = onboardingCompanySize === CONST.ONBOARDING_COMPANY_SIZE.MICRO;
    const isRHPConciergeDM = onboardingRHPVariant === CONST.ONBOARDING_RHP_VARIANT.RHP_CONCIERGE_DM;
    const isRHPAdminsRoom = onboardingRHPVariant === CONST.ONBOARDING_RHP_VARIANT.RHP_ADMINS_ROOM;
    if (isMicroCompany && (isRHPConciergeDM || isRHPAdminsRoom)) {
        handleRHPVariantNavigation(isRHPAdminsRoom, onboardingPolicyID, onboardingAdminsChatReportID);
        return;
    }

    const reportID = getReportIDAfterOnboarding(isSmallScreenWidth, canUseDefaultRooms, onboardingPolicyID, onboardingAdminsChatReportID, shouldPreventOpenAdminRoom);
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
) {
    Navigation.dismissModal();
    Navigation.setNavigationActionToMicrotaskQueue(() => {
        navigateAfterOnboarding(isSmallScreenWidth, canUseDefaultRooms, onboardingPolicyID, onboardingAdminsChatReportID, shouldPreventOpenAdminRoom);
    });
}

export {navigateAfterOnboarding, navigateAfterOnboardingWithMicrotaskQueue};
