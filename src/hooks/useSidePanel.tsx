import type {RefObject} from 'react';
import {createContext, useContext} from 'react';
// Import Animated directly from 'react-native' as animations are used with navigation.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
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
        selector: (modal) =>
            modal?.type === CONST.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT ||
            modal?.type === CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE ||
            modal?.type === CONST.MODAL.MODAL_TYPE.CENTERED_SMALL ||
            modal?.type === CONST.MODAL.MODAL_TYPE.CENTERED,
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
        shouldHideSidePanel,
        isSidePanelHiddenOrLargeScreen,
        shouldHideHelpButton,
        shouldHideSidePanelBackdrop,
    };
}

type SidePanelContextProps = {
    isSidePanelTransitionEnded: boolean;
    shouldHideSidePanel: boolean;
    shouldHideSidePanelBackdrop: boolean;
    shouldHideHelpButton: boolean;
    shouldHideToolTip: boolean;
    sidePanelOffset: RefObject<Animated.Value>;
    sidePanelTranslateX: RefObject<Animated.Value>;
    openSidePanel: () => void;
    closeSidePanel: () => void;
};

const SidePanelContext = createContext<SidePanelContextProps>({
    isSidePanelTransitionEnded: true,
    shouldHideSidePanel: true,
    shouldHideSidePanelBackdrop: true,
    shouldHideHelpButton: true,
    shouldHideToolTip: false,
    sidePanelOffset: {current: new Animated.Value(0)},
    sidePanelTranslateX: {current: new Animated.Value(0)},
    openSidePanel: () => {},
    closeSidePanel: () => {},
});

/**
 * Hook to get the animated position of the Side Panel and the margin of the navigator
 */
const useSidePanel = () => useContext(SidePanelContext);

export default useSidePanel;
export {useSidePanelDisplayStatus};
