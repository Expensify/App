import {useCallback, useEffect, useRef, useState} from 'react';
// Import Animated directly from 'react-native' as animations are used with navigation.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import SidePanelActions from '@libs/actions/SidePanel';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import KeyboardUtils from '@src/utils/keyboard';
import useResponsiveLayout from './useResponsiveLayout';
import useWindowDimensions from './useWindowDimensions';

/**
 * Hook to get the display status of the Side Panel
 */
function useSidePanelDisplayStatus() {
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const [sidePanelNVP] = useOnyx(ONYXKEYS.NVP_SIDE_PANEL, {canBeMissing: true});
    const [language] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE, {canBeMissing: true});
    const [isModalCenteredVisible = false] = useOnyx(ONYXKEYS.MODAL, {
        canBeMissing: true,
        selector: (modal) =>
            modal?.type === CONST.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT ||
            modal?.type === CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE ||
            modal?.type === CONST.MODAL.MODAL_TYPE.CENTERED_SMALL ||
            modal?.type === CONST.MODAL.MODAL_TYPE.CENTERED,
    });

    const isLanguageUnsupported = language !== CONST.LOCALES.EN;
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
        sidePanelNVP,
    };
}

/**
 * Hook to get the animated position of the Side Panel and the margin of the navigator
 */
function useSidePanel() {
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowWidth} = useWindowDimensions();
    const sidePanelWidth = shouldUseNarrowLayout ? windowWidth : variables.sideBarWidth;

    const [isSidePanelTransitionEnded, setIsSidePanelTransitionEnded] = useState(false);
    const {shouldHideSidePanel, shouldHideSidePanelBackdrop, shouldHideHelpButton, sidePanelNVP} = useSidePanelDisplayStatus();
    const shouldHideToolTip = isExtraLargeScreenWidth ? !isSidePanelTransitionEnded : !shouldHideSidePanel;

    const shouldApplySidePanelOffset = isExtraLargeScreenWidth && !shouldHideSidePanel;
    const sidePanelOffset = useRef(new Animated.Value(shouldApplySidePanelOffset ? variables.sideBarWidth : 0));
    const sidePanelTranslateX = useRef(new Animated.Value(shouldHideSidePanel ? sidePanelWidth : 0));

    useEffect(() => {
        setIsSidePanelTransitionEnded(false);

        Animated.parallel([
            Animated.timing(sidePanelOffset.current, {
                toValue: shouldApplySidePanelOffset ? variables.sideBarWidth : 0,
                duration: CONST.ANIMATED_TRANSITION,
                useNativeDriver: true,
            }),
            Animated.timing(sidePanelTranslateX.current, {
                toValue: shouldHideSidePanel ? sidePanelWidth : 0,
                duration: CONST.ANIMATED_TRANSITION,
                useNativeDriver: true,
            }),
        ]).start(() => setIsSidePanelTransitionEnded(true));
    }, [shouldHideSidePanel, shouldApplySidePanelOffset, sidePanelWidth]);

    const openSidePanel = useCallback(() => {
        setIsSidePanelTransitionEnded(false);
        KeyboardUtils.dismiss();
        SidePanelActions.openSidePanel(!isExtraLargeScreenWidth);
    }, [isExtraLargeScreenWidth]);

    const closeSidePanel = useCallback(
        (shouldUpdateNarrow = false) => {
            setIsSidePanelTransitionEnded(false);
            SidePanelActions.closeSidePanel(!isExtraLargeScreenWidth || shouldUpdateNarrow);

            // Focus the composer after closing the Side Panel
            focusComposerWithDelay(ReportActionComposeFocusManager.composerRef.current, CONST.ANIMATED_TRANSITION + CONST.COMPOSER_FOCUS_DELAY)(true);
        },
        [isExtraLargeScreenWidth],
    );

    return {
        sidePanelNVP,
        isSidePanelTransitionEnded,
        shouldHideSidePanel,
        shouldHideSidePanelBackdrop,
        shouldHideHelpButton,
        shouldHideToolTip,
        sidePanelOffset,
        sidePanelTranslateX,
        openSidePanel,
        closeSidePanel,
    };
}

export default useSidePanel;
export {useSidePanelDisplayStatus};
