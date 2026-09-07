import SidePanelActions from '@libs/actions/SidePanel';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OnboardingRHPVariant} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import type {HandleRHPVariantNavigation, ShouldOpenRHPVariant} from './types';

let onboardingRHPVariant: OnyxEntry<OnboardingRHPVariant>;

// We use Onyx.connectWithoutView because we do not use this in React components and this logic is not tied directly to the UI.
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ONBOARDING_RHP_VARIANT,
    callback: (value) => {
        onboardingRHPVariant = value;
    },
});

/**
 * Determines if the user should be navigated to the RHP variant side panel after onboarding.
 * The rhpHomePage variant is the live experiment arm and applies at every company size.
 * The trackExpensesWithConcierge variant is controlled entirely by the backend and also applies regardless of company size.
 * The retired micro-only arms (rhpConciergeDm, rhpAdminsRoom) are no longer assigned, so they no longer open the side panel here.
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

    return variant === CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE;
};

/**
 * Handles navigation for the RHP experiment variants that open the side panel.
 * rhpHomePage and trackExpensesWithConcierge navigate to home; any other variant falls back to the
 * workspace overview. All of them open the side panel without overlay.
 * Variants that do not open the side panel are handled separately in navigateAfterOnboarding.
 */
const handleRHPVariantNavigation: HandleRHPVariantNavigation = (onboardingPolicyID, variantOverride, navigationOptions) => {
    const variant = variantOverride ?? onboardingRHPVariant;
    if (variant === CONST.ONBOARDING_RHP_VARIANT.TRACK_EXPENSES_WITH_CONCIERGE) {
        const shouldPreserveRevealedReport = isReportTopmostSplitNavigator();
        if (!shouldPreserveRevealedReport) {
            Navigation.navigate(ROUTES.HOME, navigationOptions);
        }
        SidePanelActions.openSidePanel(true);
        return;
    }

    const isRHPHomePage = variant === CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE;

    if (isRHPHomePage) {
        const shouldPreserveRevealedReport = isReportTopmostSplitNavigator();
        if (!shouldPreserveRevealedReport) {
            Navigation.navigate(ROUTES.HOME, navigationOptions);
        }
    } else {
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW.getRoute(onboardingPolicyID), navigationOptions);
    }
    SidePanelActions.openSidePanel(true);
};

export {shouldOpenRHPVariant, handleRHPVariantNavigation};
