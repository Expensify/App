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
 * The RHP variant is only shown to micro companies that are part of the RHP experiment.
 *
 * Accepts an optional variantOverride to bypass the module-level Onyx variable, avoiding a race
 * condition where the Onyx callback hasn't fired yet when this is called immediately after the
 * CompleteGuidedSetup API response.
 */
const shouldOpenRHPVariant: ShouldOpenRHPVariant = (variantOverride) => {
    const variant = variantOverride ?? onboardingRHPVariant;
    const isMicroCompany = onboardingCompanySize === CONST.ONBOARDING_COMPANY_SIZE.MICRO;
    const isRHPConciergeDM = variant === CONST.ONBOARDING_RHP_VARIANT.RHP_CONCIERGE_DM;
    const isRHPAdminsRoom = variant === CONST.ONBOARDING_RHP_VARIANT.RHP_ADMINS_ROOM;
    const isRHPHomePage = variant === CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE;

    return isMicroCompany && (isRHPConciergeDM || isRHPAdminsRoom || isRHPHomePage);
};

/**
 * Handles navigation for RHP experiment:
 * - Control: navigate to the last accessed report on small screens, do not open side panel
 * - RHP Concierge DM: navigate to the workspace overview and open the side panel with the Concierge DM
 * - RHP Admins Room: navigate to the workspace overview and open the side panel with the Admins Room
 * - RHP Home Page: navigate to the Home page without opening the side panel or test drive modal
 *
 * Accepts an optional variantOverride for the same race-condition reason as shouldOpenRHPVariant.
 */
const handleRHPVariantNavigation: HandleRHPVariantNavigation = (onboardingPolicyID, variantOverride) => {
    const variant = variantOverride ?? onboardingRHPVariant;
    if (variant === CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE) {
        Navigation.navigate(ROUTES.HOME);
        return;
    }

    Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW.getRoute(onboardingPolicyID));
    SidePanelActions.openSidePanel(true);
};

export {shouldOpenRHPVariant, handleRHPVariantNavigation};
