import {useCallback, useEffect, useRef, useState} from 'react';
// Import Animated directly from 'react-native' as animations are used with navigation.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {triggerSidePanel} from '@libs/actions/SidePanel';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import Permissions from '@libs/Permissions';
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
    const [sidePanelNVP] = useOnyx(ONYXKEYS.NVP_SIDE_PANEL);
    const [language] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE);
    const [canUseHelpSidePanel = false] = useOnyx(ONYXKEYS.BETAS, {selector: Permissions.canUseHelpSidePanel});
    const [isModalCenteredVisible = false] = useOnyx(ONYXKEYS.MODAL, {
        selector: (modal) =>
            modal?.type === CONST.MODAL.MODAL_TYPE.CENTERED_SWIPABLE_TO_RIGHT ||
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
    const shouldHideSidePanel = !isSidePanelVisible || isLanguageUnsupported || isModalCenteredVisible || !canUseHelpSidePanel;
    const isSidePanelHiddenOrLargeScreen = !isSidePanelVisible || isLanguageUnsupported || isExtraLargeScreenWidth || !canUseHelpSidePanel;

    // The help button is hidden when:
    // - the user is not part of the corresponding beta
    // - Side Panel is displayed currently
    // - language is unsupported
    const shouldHideHelpButton = !canUseHelpSidePanel || !shouldHideSidePanel || isLanguageUnsupported;
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

        triggerSidePanel({
            isOpen: true,
            isOpenNarrowScreen: isExtraLargeScreenWidth ? undefined : true,
        });
    }, [isExtraLargeScreenWidth]);

    const closeSidePanel = useCallback(
        (shouldUpdateNarrow = false) => {
            setIsSidePanelTransitionEnded(false);
            const shouldOnlyUpdateNarrowLayout = !isExtraLargeScreenWidth || shouldUpdateNarrow;
            triggerSidePanel({
                isOpen: shouldOnlyUpdateNarrowLayout ? undefined : false,
                isOpenNarrowScreen: shouldOnlyUpdateNarrowLayout ? false : undefined,
            });

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
