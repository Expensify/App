import {useCallback, useEffect, useRef, useState} from 'react';
// Import Animated directly from 'react-native' as animations are used with navigation.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {triggerSidePane} from '@libs/actions/SidePane';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useResponsiveLayout from './useResponsiveLayout';
import useWindowDimensions from './useWindowDimensions';

/**
 * Hook to get the display status of the side pane
 */
function useSidePaneDisplayStatus() {
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const [sidePaneNVP] = useOnyx(ONYXKEYS.NVP_SIDE_PANE);
    const [language] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE);
    const [isModalCenteredVisible = false] = useOnyx(ONYXKEYS.MODAL, {
        selector: (modal) =>
            modal?.type === CONST.MODAL.MODAL_TYPE.CENTERED_SWIPABLE_TO_RIGHT ||
            modal?.type === CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE ||
            modal?.type === CONST.MODAL.MODAL_TYPE.CENTERED_SMALL,
    });

    const isLanguageUnsupported = language !== CONST.LOCALES.EN;
    const isSidePaneVisible = isExtraLargeScreenWidth ? sidePaneNVP?.open : sidePaneNVP?.openNarrowScreen;

    // The side pane is completely hidden when:
    // - NVP is not set or it is false
    // - language is unsupported
    const isSidePaneFullyHidden = !isSidePaneVisible || isLanguageUnsupported;

    // The side pane is collapsed when:
    // - side pane is completely hidden
    // - centered modal is visible
    const shouldHideSidePane = isSidePaneFullyHidden || isModalCenteredVisible;

    // The help button is hidden when:
    // - side pane nvp is not set
    // - side pane is displayed currently
    // - language is unsupported
    const shouldHideHelpButton = !sidePaneNVP || !isSidePaneFullyHidden || isLanguageUnsupported;
    const shouldHideSidePaneBackdrop = isSidePaneFullyHidden || isExtraLargeScreenWidth || shouldUseNarrowLayout;

    return {shouldHideSidePane, isSidePaneFullyHidden, shouldHideHelpButton, shouldHideSidePaneBackdrop, sidePaneNVP};
}

/**
 * Hook to get the animated position of the side pane and the margin of the navigator
 */
function useSidePane() {
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowWidth} = useWindowDimensions();
    const sidePaneWidth = shouldUseNarrowLayout ? windowWidth : variables.sideBarWidth;

    const [isSidePaneTransitionEnded, setIsSidePaneTransitionEnded] = useState(true);
    const {shouldHideSidePane, shouldHideSidePaneBackdrop, shouldHideHelpButton, sidePaneNVP} = useSidePaneDisplayStatus();
    const shouldHideToolTip = isExtraLargeScreenWidth ? !shouldHideSidePane && isSidePaneTransitionEnded : !shouldHideSidePane;

    const shouldApplySidePaneOffset = isExtraLargeScreenWidth && !shouldHideSidePane;
    const sidePaneOffset = useRef(new Animated.Value(shouldApplySidePaneOffset ? variables.sideBarWidth : 0));
    const sidePaneTranslateX = useRef(new Animated.Value(shouldHideSidePane ? sidePaneWidth : 0));

    useEffect(() => {
        if (!shouldHideSidePane) {
            setIsSidePaneTransitionEnded(false);
        }

        Animated.parallel([
            Animated.timing(sidePaneOffset.current, {
                toValue: shouldApplySidePaneOffset ? variables.sideBarWidth : 0,
                duration: CONST.ANIMATED_TRANSITION,
                useNativeDriver: true,
            }),
            Animated.timing(sidePaneTranslateX.current, {
                toValue: shouldHideSidePane ? sidePaneWidth : 0,
                duration: CONST.ANIMATED_TRANSITION,
                useNativeDriver: true,
            }),
        ]).start(() => setIsSidePaneTransitionEnded(shouldHideSidePane));
    }, [shouldHideSidePane, shouldApplySidePaneOffset, shouldUseNarrowLayout, sidePaneWidth, isExtraLargeScreenWidth]);

    const closeSidePane = useCallback(
        (shouldUpdateNarrow = false) => {
            if (!sidePaneNVP) {
                return;
            }

            const shouldOnlyUpdateNarrowLayout = !isExtraLargeScreenWidth || shouldUpdateNarrow;
            triggerSidePane({
                isOpen: shouldOnlyUpdateNarrowLayout ? undefined : false,
                isOpenNarrowScreen: shouldOnlyUpdateNarrowLayout ? false : undefined,
            });

            // Focus the composer after closing the side pane
            focusComposerWithDelay(ReportActionComposeFocusManager.composerRef.current, CONST.ANIMATED_TRANSITION + CONST.COMPOSER_FOCUS_DELAY)(true);
        },
        [isExtraLargeScreenWidth, sidePaneNVP],
    );

    return {
        sidePane: sidePaneNVP,
        isSidePaneTransitionEnded,
        shouldHideSidePane,
        shouldHideSidePaneBackdrop,
        shouldHideHelpButton,
        shouldHideToolTip,
        sidePaneOffset,
        sidePaneTranslateX,
        closeSidePane,
    };
}

export default useSidePane;
export {useSidePaneDisplayStatus};
