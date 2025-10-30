import {isModalCenteredVisibleSelector} from '@selectors/Modal';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useResponsiveLayout from './useResponsiveLayout';

/**
 * Hook to get the display status of the Side Panel
 */
function useSidePanelDisplayStatus() {
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {preferredLocale} = useLocalize();
    const [sidePanelNVP] = useOnyx(ONYXKEYS.NVP_SIDE_PANEL, {canBeMissing: true});
    const [isModalCenteredVisible = false] = useOnyx(ONYXKEYS.MODAL, {
        canBeMissing: true,
        selector: isModalCenteredVisibleSelector,
    });

    const isLanguageUnsupported = preferredLocale !== CONST.LOCALES.EN;
    const isSidePanelVisible = isExtraLargeScreenWidth ? sidePanelNVP?.open : sidePanelNVP?.openNarrowScreen;

    // The Side Panel is hidden when:
    // - NVP is not set or it is false
    // - language is unsupported
    // - modal centered is visible
    const shouldHideSidePanel = !isSidePanelVisible || isLanguageUnsupported || isModalCenteredVisible || !sidePanelNVP;
    const isSidePanelHiddenOrLargeScreen = !isSidePanelVisible || isLanguageUnsupported || isExtraLargeScreenWidth || !sidePanelNVP;

    // The help button is hidden when:
    // - side pane nvp is not set
    // - Side Panel is displayed currently
    // - language is unsupported
    const shouldHideHelpButton = !sidePanelNVP || !shouldHideSidePanel || isLanguageUnsupported;
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
