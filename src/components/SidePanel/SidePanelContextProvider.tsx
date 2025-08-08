import type {PropsWithChildren, RefObject} from 'react';
import React, {createContext, useCallback, useEffect, useMemo, useRef, useState} from 'react';
// Import Animated directly from 'react-native' as animations are used with navigation.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {useSidePanelDisplayStatus} from '@hooks/useSidePanel';
import useWindowDimensions from '@hooks/useWindowDimensions';
import SidePanelActions from '@libs/actions/SidePanel';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';

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
function SidePanelContextProvider({children}: PropsWithChildren) {
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowWidth} = useWindowDimensions();
    const sidePanelWidth = shouldUseNarrowLayout ? windowWidth : variables.sideBarWidth;

    const [isSidePanelTransitionEnded, setIsSidePanelTransitionEnded] = useState(true);
    const {shouldHideSidePanel, shouldHideSidePanelBackdrop, shouldHideHelpButton} = useSidePanelDisplayStatus();
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

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- sidePanelWidth dependency caused the help panel content to slide in on window resize
    }, [shouldHideSidePanel, shouldApplySidePanelOffset]);

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

    const value = useMemo(
        () => ({
            isSidePanelTransitionEnded,
            shouldHideSidePanel,
            shouldHideSidePanelBackdrop,
            shouldHideHelpButton,
            shouldHideToolTip,
            sidePanelOffset,
            sidePanelTranslateX,
            openSidePanel,
            closeSidePanel,
        }),
        [closeSidePanel, isSidePanelTransitionEnded, openSidePanel, shouldHideHelpButton, shouldHideSidePanel, shouldHideSidePanelBackdrop, shouldHideToolTip],
    );

    return <SidePanelContext.Provider value={value}>{children}</SidePanelContext.Provider>;
}

export default SidePanelContextProvider;
