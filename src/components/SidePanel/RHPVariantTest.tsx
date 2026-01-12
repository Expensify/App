import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import SidePanelActions from '@libs/actions/SidePanel';
import getPlatform from '@libs/getPlatform';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OnboardingRHPVariant} from '@src/types/onyx';

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
function shouldOpenRHPVariant(): boolean {
    const isMicroCompany = onboardingCompanySize === CONST.ONBOARDING_COMPANY_SIZE.MICRO;
    const isRHPConciergeDM = onboardingRHPVariant === CONST.ONBOARDING_RHP_VARIANT.RHP_CONCIERGE_DM;
    const isRHPAdminsRoom = onboardingRHPVariant === CONST.ONBOARDING_RHP_VARIANT.RHP_ADMINS_ROOM;
    // Side Panel is only supported on web, so we don't navigate to the RHP variant on other platforms
    const isWeb = getPlatform() === CONST.PLATFORM.WEB;

    return isMicroCompany && (isRHPConciergeDM || isRHPAdminsRoom) && isWeb;
}

/**
 * Handles navigation for RHP experiment:
 * - Control: navigate to the last accessed report on small screens, do not open side panel
 * - RHP Concierge DM: navigate to the workspace overview and open the side panel with the Concierge DM
 * - RHP Admins Room: navigate to the workspace overview and open the side panel with the Admins Room
 */
function handleRHPVariantNavigation(onboardingPolicyID?: string) {
    Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW.getRoute(onboardingPolicyID));
    SidePanelActions.openSidePanel(true);
    Navigation.isNavigationReady().then(() => {
        Navigation.navigate(ROUTES.TEST_DRIVE_MODAL_ROOT.route);
    });
}

export {shouldOpenRHPVariant, handleRHPVariantNavigation};
