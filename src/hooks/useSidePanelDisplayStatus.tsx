import ONYXKEYS from '@src/ONYXKEYS';
import {hasCompletedGuidedSetupFlowSelector} from '@src/selectors/Onboarding';
import useIsAnonymousUser from './useIsAnonymousUser';
import useOnyx from './useOnyx';
import useResponsiveLayout from './useResponsiveLayout';

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

    // The Side Panel is hidden when:
    // - NVP is not set or it is false
    // - Onboarding is not completed
    const shouldHideSidePanel = !isSidePanelVisible || !sidePanelNVP || !isOnboardingCompleted;
    const isSidePanelHiddenOrLargeScreen = !isSidePanelVisible || isExtraLargeScreenWidth || !sidePanelNVP;

    // The help button is hidden when:
    // - Side Panel is displayed currently
    // - Onboarding is not completed
    // - User is anonymous (not signed in)
    const shouldHideHelpButton = !shouldHideSidePanel || !isOnboardingCompleted || isAnonymousUser;
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
