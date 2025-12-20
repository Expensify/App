import ONYXKEYS from '@src/ONYXKEYS';
import useEnvironment from './useEnvironment';
import useOnyx from './useOnyx';
import useResponsiveLayout from './useResponsiveLayout';

/**
 * Hook to get the display status of the Side Panel
 */
function useSidePanelDisplayStatus() {
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const [sidePanelNVP] = useOnyx(ONYXKEYS.NVP_SIDE_PANEL, {canBeMissing: true});
    const {isProduction} = useEnvironment();

    const isSidePanelVisible = isExtraLargeScreenWidth ? sidePanelNVP?.open : sidePanelNVP?.openNarrowScreen;

    // The Side Panel is hidden when:
    // - NVP is not set or it is false
    // - Production environment (will be removed in the future once it's tested on staging)
    const shouldHideSidePanel = !isSidePanelVisible || !sidePanelNVP || isProduction;
    const isSidePanelHiddenOrLargeScreen = !isSidePanelVisible || isExtraLargeScreenWidth || isProduction || !sidePanelNVP;

    // The help button is hidden when:
    // - Side Panel is displayed currently
    // - Production environment (will be removed in the future once it's tested on staging)
    const shouldHideHelpButton = !shouldHideSidePanel || isProduction;
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
