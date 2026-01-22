import {getDeepestFocusedScreenName, isTwoFactorSetupScreen} from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasCompletedGuidedSetupFlowSelector} from '@src/selectors/Onboarding';
import useIsAnonymousUser from './useIsAnonymousUser';
import useOnyx from './useOnyx';
import useResponsiveLayout from './useResponsiveLayout';
import useRootNavigationState from './useRootNavigationState';

/**
 * Hook to get the display status of the Side Panel
 */
function useSidePanelDisplayStatus() {
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const [sidePanelNVP] = useOnyx(ONYXKEYS.NVP_SIDE_PANEL, {canBeMissing: true});
    const [isOnboardingCompleted = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasCompletedGuidedSetupFlowSelector,
        canBeMissing: true,
    });
    const isAnonymousUser = useIsAnonymousUser();
    const isSidePanelVisible = isExtraLargeScreenWidth ? sidePanelNVP?.open : sidePanelNVP?.openNarrowScreen;
    const isIn2FASetupFlow = useRootNavigationState((state) => {
        const focusedScreenName = getDeepestFocusedScreenName(state);
        return isTwoFactorSetupScreen(focusedScreenName);
    });

    // The Side Panel is hidden when:
    // - NVP is not set or it is false
    // - Onboarding is not completed
    const shouldHideSidePanel = !isSidePanelVisible || !sidePanelNVP || !isOnboardingCompleted;
    const isSidePanelHiddenOrLargeScreen = !isSidePanelVisible || isExtraLargeScreenWidth || !sidePanelNVP;

    // The help button is hidden when:
    // - Side Panel is displayed currently
    // - Onboarding is not completed
    // - User is anonymous (not signed in)
    // - User is setting up 2FA - if their current token is a TWO_FACTOR_SETUP token, any messages to concierge will fail to send
    const shouldHideHelpButton = !shouldHideSidePanel || !isOnboardingCompleted || isAnonymousUser || isIn2FASetupFlow;
    const shouldHideSidePanelBackdrop = shouldHideSidePanel || isExtraLargeScreenWidth || shouldUseNarrowLayout;

    return {
        sidePanelNVP,
        shouldHideSidePanel,
        isSidePanelHiddenOrLargeScreen,
        shouldHideHelpButton,
        shouldHideSidePanelBackdrop,
    };
}

export default useSidePanelDisplayStatus;
