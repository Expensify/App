import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import SidePanelActions from '@libs/actions/SidePanel';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OnboardingRHPVariant} from '@src/types/onyx';
import type {HandleRHPVariantNavigation, ShouldOpenRHPVariant} from './types';

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
 * Determines if the user should be navigated to the RHP variant side panel after onboarding.
 * The existing micro-company RHP variants (rhpConciergeDm, rhpAdminsRoom) are only shown to micro companies.
 * The trackExpensesWithConcierge variant is controlled entirely by the backend and applies regardless of company size.
 *
 * Accepts an optional variantOverride to bypass the module-level Onyx variable, avoiding a race
 * condition where the Onyx callback hasn't fired yet when this is called immediately after the
 * CompleteGuidedSetup API response.
 */
const shouldOpenRHPVariant: ShouldOpenRHPVariant = (variantOverride) => {
    const variant = variantOverride ?? onboardingRHPVariant;

    if (variant === CONST.ONBOARDING_RHP_VARIANT.TRACK_EXPENSES_WITH_CONCIERGE) {
        return true;
    }

    const isMicroCompany = onboardingCompanySize === CONST.ONBOARDING_COMPANY_SIZE.MICRO_SMALL || onboardingCompanySize === CONST.ONBOARDING_COMPANY_SIZE.MICRO;
    const isRHPConciergeDM = variant === CONST.ONBOARDING_RHP_VARIANT.RHP_CONCIERGE_DM;
    const isRHPAdminsRoom = variant === CONST.ONBOARDING_RHP_VARIANT.RHP_ADMINS_ROOM;
    const isRHPHomePage = variant === CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE;

    return isMicroCompany && (isRHPConciergeDM || isRHPAdminsRoom || isRHPHomePage);
};

/**
 * Handles navigation for RHP experiment variants (B/C/D):
 * Variants B and C navigate to the workspace overview, Variant D navigates to home.
 * All variants open the side panel without overlay.
 * The control variant is handled separately in navigateAfterOnboarding.
 */
const handleRHPVariantNavigation: HandleRHPVariantNavigation = (onboardingPolicyID, variantOverride) => {
    const variant = variantOverride ?? onboardingRHPVariant;
    if (variant === CONST.ONBOARDING_RHP_VARIANT.TRACK_EXPENSES_WITH_CONCIERGE) {
        Navigation.navigate(ROUTES.HOME);
        SidePanelActions.openSidePanel(true);
        return;
    }

    const isRHPHomePage = variant === CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE;

    if (isRHPHomePage) {
        Navigation.navigate(ROUTES.HOME);
    } else {
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW.getRoute(onboardingPolicyID));
    }
    SidePanelActions.openSidePanel(true);
};

export {shouldOpenRHPVariant, handleRHPVariantNavigation};
