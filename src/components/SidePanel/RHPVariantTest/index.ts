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
 * The rhpHomePage variant is assigned at every company size, so there is no size gate here.
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

    return variant === CONST.ONBOARDING_RHP_VARIANT.RHP_HOME_PAGE;
};

/**
 * Handles navigation for RHP experiment variants (B/C/D):
 * Variants B and C navigate to the workspace overview, Variant D navigates to home.
 * All variants open the side panel without overlay.
 * The control variant is handled separately in navigateAfterOnboarding.
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
