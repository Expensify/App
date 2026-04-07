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
 */
const shouldOpenRHPVariant: ShouldOpenRHPVariant = () => {
    const isMicroCompany = onboardingCompanySize === CONST.ONBOARDING_COMPANY_SIZE.MICRO;
    const isRHPConciergeDM = onboardingRHPVariant === CONST.ONBOARDING_RHP_VARIANT.RHP_CONCIERGE_DM;
    const isRHPAdminsRoom = onboardingRHPVariant === CONST.ONBOARDING_RHP_VARIANT.RHP_ADMINS_ROOM;
    const isRHPHomePage = onboardingRHPVariant === CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE;

    return isMicroCompany && (isRHPConciergeDM || isRHPAdminsRoom || isRHPHomePage);
};

/**
 * Handles navigation for RHP experiment variants (B/C/D):
 * Variants B and C navigate to the workspace overview, Variant D navigates to home.
 * All variants open the side panel without overlay.
 * The control variant is handled separately in navigateAfterOnboarding.
 */
const handleRHPVariantNavigation: HandleRHPVariantNavigation = (onboardingPolicyID) => {
    const isRHPHomePage = onboardingRHPVariant === CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE;

    if (isRHPHomePage) {
        Navigation.navigate(ROUTES.HOME);
    } else {
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW.getRoute(onboardingPolicyID));
    }
    SidePanelActions.openSidePanel(true);
};

export {shouldOpenRHPVariant, handleRHPVariantNavigation};
