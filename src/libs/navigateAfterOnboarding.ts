import {handleRHPVariantNavigation, shouldOpenRHPVariant} from '@components/SidePanel/RHPVariantTest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {OnboardingRHPVariant, ReportNameValuePairs} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import {setDisableDismissOnEscape} from './actions/Modal';
import SidePanelActions from './actions/SidePanel';
import {setOnboardingRHPVariant} from './actions/Welcome';
import shouldOpenOnAdminRoom from './Navigation/helpers/shouldOpenOnAdminRoom';
import Navigation from './Navigation/Navigation';
import {findLastAccessedReport, isConciergeChatReport, isSelfDM} from './ReportUtils';

let onboardingRHPVariant: OnyxEntry<OnboardingRHPVariant>;
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ONBOARDING_RHP_VARIANT,
    callback: (value) => {
        onboardingRHPVariant = value;
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
    conciergeReportID: string,
    reportNameValuePairs: OnyxCollection<ReportNameValuePairs>,
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

    // TODO: Pass guidesEmailsByReport map once callers are fully migrated — PR 33 (https://github.com/Expensify/App/issues/66413); findLastAccessedReport falls back to hasExpensifyGuidesEmails → allPersonalDetails
    const lastAccessedReport = findLastAccessedReport(!canUseDefaultRooms, undefined, shouldOpenOnAdminRoom() && !shouldPreventOpenAdminRoom, undefined, reportNameValuePairs);
    const lastAccessedReportID = lastAccessedReport?.reportID;

    // When the user goes through the onboarding flow, a workspace can be created if the user selects specific options. The user should be taken to the #admins room for that workspace because it is the most natural place for them to start their experience in the app.
    // The user should never go to the self DM or the Concierge chat if a workspace was created during the onboarding flow.
    if (lastAccessedReportID && lastAccessedReport.policyID !== onboardingPolicyID && !isConciergeChatReport(lastAccessedReport, conciergeReportID) && !isSelfDM(lastAccessedReport)) {
        return lastAccessedReportID;
    }

    return undefined;
}

function navigateAfterOnboarding(
    isSmallScreenWidth: boolean,
    canUseDefaultRooms: boolean | undefined,
    conciergeReportID: string,
    reportNameValuePairs: OnyxCollection<ReportNameValuePairs>,
    onboardingPolicyID?: string,
    onboardingAdminsChatReportID?: string,
    shouldPreventOpenAdminRoom = false,
    variantOverride?: OnboardingRHPVariant | null,
) {
    setDisableDismissOnEscape(false);

    // On mobile (small screen), Track workspace admins with the trackExpensesWithConcierge variant
    // should navigate directly to the Concierge DM (which contains onboarding tasks).
    // This check is outside shouldOpenRHPVariant because that function returns false on native
    // (Side Panel doesn't exist on native), but we still need to navigate to Concierge on mobile.
    const variant = variantOverride ?? onboardingRHPVariant;
    if (isSmallScreenWidth && variant === CONST.ONBOARDING_RHP_VARIANT.TRACK_EXPENSES_WITH_CONCIERGE) {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(conciergeReportID));
        return;
    }

    if (shouldOpenRHPVariant(variantOverride)) {
        handleRHPVariantNavigation(onboardingPolicyID, variantOverride);
        return;
    }

    const reportID = getReportIDAfterOnboarding(
        isSmallScreenWidth,
        canUseDefaultRooms,
        conciergeReportID,
        reportNameValuePairs,
        onboardingPolicyID,
        onboardingAdminsChatReportID,
        shouldPreventOpenAdminRoom,
    );
    if (reportID) {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
    } else {
        // Navigate to home to trigger guard evaluation
        Navigation.navigate(ROUTES.HOME);
    }
}

function navigateAfterOnboardingWithMicrotaskQueue(
    isSmallScreenWidth: boolean,
    canUseDefaultRooms: boolean | undefined,
    conciergeReportID: string,
    reportNameValuePairs: OnyxCollection<ReportNameValuePairs>,
    onboardingPolicyID?: string,
    onboardingAdminsChatReportID?: string,
    shouldPreventOpenAdminRoom = false,
    variantOverride?: OnboardingRHPVariant | null,
) {
    Navigation.dismissModal();
    Navigation.setNavigationActionToMicrotaskQueue(() => {
        navigateAfterOnboarding(
            isSmallScreenWidth,
            canUseDefaultRooms,
            conciergeReportID,
            reportNameValuePairs,
            onboardingPolicyID,
            onboardingAdminsChatReportID,
            shouldPreventOpenAdminRoom,
            variantOverride,
        );
    });
}

/**
 * After creating or joining a Submit workspace during onboarding,
 * navigate to Workspace > Categories with the side panel open so
 * the #admins room is visible in Concierge Anywhere.
 */
function navigateToSubmitWorkspaceAfterOnboarding(policyID?: string, shouldUseNarrowLayout = false) {
    setDisableDismissOnEscape(false);

    if (!policyID) {
        Navigation.navigate(ROUTES.HOME);
        return;
    }

    setOnboardingRHPVariant(CONST.ONBOARDING_RHP_VARIANT.RHP_ADMINS_ROOM);

    const categoriesRoute = ROUTES.WORKSPACE_CATEGORIES.getRoute(policyID);
    const backToRoute = shouldUseNarrowLayout ? ROUTES.WORKSPACE_INITIAL.getRoute(policyID) : ROUTES.WORKSPACES_LIST.route;
    Navigation.navigate(`${categoriesRoute}?backTo=${encodeURIComponent(backToRoute)}` as Route);

    SidePanelActions.openSidePanel(!shouldUseNarrowLayout);
}

function navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue(policyID?: string, shouldUseNarrowLayout = false) {
    Navigation.dismissModal();
    Navigation.setNavigationActionToMicrotaskQueue(() => {
        navigateToSubmitWorkspaceAfterOnboarding(policyID, shouldUseNarrowLayout);
    });
}

export {navigateAfterOnboarding, navigateAfterOnboardingWithMicrotaskQueue, navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue};
