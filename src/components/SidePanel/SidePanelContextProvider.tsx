import type {PropsWithChildren, RefObject} from 'react';
import React, {createContext, useCallback, useEffect, useMemo, useRef, useState} from 'react';
// Import Animated directly from 'react-native' as animations are used with navigation.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelDisplayStatus from '@hooks/useSidePanelDisplayStatus';
import useWindowDimensions from '@hooks/useWindowDimensions';
import SidePanelActions from '@libs/actions/SidePanel';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {SidePanel} from '@src/types/onyx';

type SidePanelContextProps = {
    isSidePanelTransitionEnded: boolean;
    isSidePanelHiddenOrLargeScreen: boolean;
    shouldHideSidePanel: boolean;
    shouldHideSidePanelBackdrop: boolean;
    shouldHideHelpButton: boolean;
    shouldHideToolTip: boolean;
    sidePanelOffset: RefObject<Animated.Value>;
    sidePanelTranslateX: RefObject<Animated.Value>;
    openSidePanel: () => void;
    closeSidePanel: () => void;
    sidePanelNVP?: SidePanel;
};

const SidePanelContext = createContext<SidePanelContextProps>({
    isSidePanelTransitionEnded: true,
    isSidePanelHiddenOrLargeScreen: true,
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
    const sidePanelWidth = shouldUseNarrowLayout ? windowWidth : variables.sidePanelWidth;

    const [isSidePanelTransitionEnded, setIsSidePanelTransitionEnded] = useState(true);
    const {shouldHideSidePanel, shouldHideSidePanelBackdrop, shouldHideHelpButton, isSidePanelHiddenOrLargeScreen, sidePanelNVP} = useSidePanelDisplayStatus();
    const shouldHideToolTip = isExtraLargeScreenWidth ? !isSidePanelTransitionEnded : !shouldHideSidePanel;

    const shouldApplySidePanelOffset = isExtraLargeScreenWidth && !shouldHideSidePanel;
    const sidePanelOffset = useRef(new Animated.Value(shouldApplySidePanelOffset ? variables.sidePanelWidth : 0));
    const sidePanelTranslateX = useRef(new Animated.Value(shouldHideSidePanel ? sidePanelWidth : 0));

    useEffect(() => {
        setIsSidePanelTransitionEnded(false);
        Animated.parallel([
            Animated.timing(sidePanelOffset.current, {
                toValue: shouldApplySidePanelOffset ? variables.sidePanelWidth : 0,
                duration: CONST.SIDE_PANEL_ANIMATED_TRANSITION,
                useNativeDriver: true,
            }),
            Animated.timing(sidePanelTranslateX.current, {
                toValue: shouldHideSidePanel ? sidePanelWidth : 0,
                duration: CONST.SIDE_PANEL_ANIMATED_TRANSITION,
                useNativeDriver: true,
            }),
        ]).start(() => setIsSidePanelTransitionEnded(true));

        // eslint-disable-next-line react-hooks/exhaustive-deps -- sidePanelWidth dependency caused the help panel content to slide in on window resize
    }, [shouldHideSidePanel, shouldApplySidePanelOffset]);

    const closeSidePanel = useCallback(
        (shouldUpdateNarrow = false) => {
            // User shouldn't be able to close side panel if side panel NVP is undefined
            if (!sidePanelNVP) {
                return;
            }

            setIsSidePanelTransitionEnded(false);
            SidePanelActions.closeSidePanel(!isExtraLargeScreenWidth || shouldUpdateNarrow);

            // Focus the composer after closing the Side Panel
            focusComposerWithDelay(ReportActionComposeFocusManager.composerRef.current, CONST.SIDE_PANEL_ANIMATED_TRANSITION + CONST.COMPOSER_FOCUS_DELAY)(true);
        },
        [isExtraLargeScreenWidth, sidePanelNVP],
    );

    const value = useMemo(
        () => ({
            isSidePanelTransitionEnded,
            isSidePanelHiddenOrLargeScreen,
            shouldHideSidePanel,
            shouldHideSidePanelBackdrop,
            shouldHideHelpButton,
            shouldHideToolTip,
            sidePanelOffset,
            sidePanelTranslateX,
            openSidePanel: () => SidePanelActions.openSidePanel(!isExtraLargeScreenWidth),
            closeSidePanel,
            sidePanelNVP,
        }),
        [
            closeSidePanel,
            isExtraLargeScreenWidth,
            isSidePanelHiddenOrLargeScreen,
            isSidePanelTransitionEnded,
            shouldHideHelpButton,
            shouldHideSidePanel,
            shouldHideSidePanelBackdrop,
            shouldHideToolTip,
            sidePanelNVP,
        ],
    );

    return <SidePanelContext.Provider value={value}>{children}</SidePanelContext.Provider>;
}

export default SidePanelContextProvider;
export {SidePanelContext};
