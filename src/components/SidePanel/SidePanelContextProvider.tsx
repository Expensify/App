import type {PropsWithChildren, RefObject} from 'react';
import React, {createContext, useEffect, useRef, useState} from 'react';
// Import Animated directly from 'react-native' as animations are used with navigation.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelDisplayStatus from '@hooks/useSidePanelDisplayStatus';
import useWindowDimensions from '@hooks/useWindowDimensions';
import SidePanelActions from '@libs/actions/SidePanel';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import {isPolicyAdmin, shouldShowPolicy} from '@libs/PolicyUtils';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {emailSelector} from '@src/selectors/Session';
import type {SidePanel} from '@src/types/onyx';

type SidePanelStateContextProps = {
    isSidePanelTransitionEnded: boolean;
    isSidePanelHiddenOrLargeScreen: boolean;
    shouldHideSidePanel: boolean;
    shouldHideSidePanelBackdrop: boolean;
    shouldHideHelpButton: boolean;
    shouldHideToolTip: boolean;
    sidePanelOffset: RefObject<Animated.Value>;
    sidePanelTranslateX: RefObject<Animated.Value>;
    sidePanelNVP?: SidePanel;
    reportID?: string;
};

type SidePanelActionsContextProps = {
    openSidePanel: () => void;
    closeSidePanel: () => void;
};

const SidePanelStateContext = createContext<SidePanelStateContextProps>({
    isSidePanelTransitionEnded: true,
    isSidePanelHiddenOrLargeScreen: true,
    shouldHideSidePanel: true,
    shouldHideSidePanelBackdrop: true,
    shouldHideHelpButton: true,
    shouldHideToolTip: false,
    sidePanelOffset: {current: new Animated.Value(0)},
    sidePanelTranslateX: {current: new Animated.Value(0)},
});

const SidePanelActionsContext = createContext<SidePanelActionsContextProps>({
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
    const sidePanelWidthRef = useRef(sidePanelWidth);

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});
    const [onboardingRHPVariant] = useOnyx(ONYXKEYS.NVP_ONBOARDING_RHP_VARIANT, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {
        canBeMissing: true,
        selector: emailSelector,
    });

    const isRHPAdminsRoom = onboardingRHPVariant === CONST.ONBOARDING_RHP_VARIANT.RHP_ADMINS_ROOM;
    const isUserAdmin = isPolicyAdmin(activePolicy, sessionEmail);
    const isPolicyActive = shouldShowPolicy(activePolicy, false, sessionEmail ?? '');
    const adminsChatReportID = activePolicy?.chatReportIDAdmins?.toString();

    const reportID = isRHPAdminsRoom && isUserAdmin && isPolicyActive && adminsChatReportID ? adminsChatReportID : conciergeReportID;

    useEffect(() => {
        sidePanelWidthRef.current = sidePanelWidth;
    }, [sidePanelWidth]);

    // sidePanelWidth dependency in useEffect below caused the help panel content to slide in on window resize
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsSidePanelTransitionEnded(false);
        Animated.parallel([
            Animated.timing(sidePanelOffset.current, {
                toValue: shouldApplySidePanelOffset ? variables.sidePanelWidth : 0,
                duration: CONST.SIDE_PANEL_ANIMATED_TRANSITION,
                useNativeDriver: true,
            }),
            Animated.timing(sidePanelTranslateX.current, {
                toValue: shouldHideSidePanel ? sidePanelWidthRef.current : 0,
                duration: CONST.SIDE_PANEL_ANIMATED_TRANSITION,
                useNativeDriver: true,
            }),
        ]).start(() => setIsSidePanelTransitionEnded(true));
    }, [shouldHideSidePanel, shouldApplySidePanelOffset]);

    const closeSidePanel = (shouldUpdateNarrow = false) => {
        // User shouldn't be able to close side panel if side panel NVP is undefined
        if (!sidePanelNVP) {
            return;
        }

        setIsSidePanelTransitionEnded(false);
        SidePanelActions.closeSidePanel(!isExtraLargeScreenWidth || shouldUpdateNarrow);

        // Focus the composer after closing the Side Panel
        focusComposerWithDelay(ReportActionComposeFocusManager.composerRef.current, CONST.SIDE_PANEL_ANIMATED_TRANSITION + CONST.COMPOSER_FOCUS_DELAY)(true);
    };

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const stateValue = {
        isSidePanelTransitionEnded,
        isSidePanelHiddenOrLargeScreen,
        shouldHideSidePanel,
        shouldHideSidePanelBackdrop,
        shouldHideHelpButton,
        shouldHideToolTip,
        sidePanelOffset,
        sidePanelTranslateX,
        sidePanelNVP,
        reportID,
    };

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsValue = {
        openSidePanel: () => SidePanelActions.openSidePanel(!isExtraLargeScreenWidth),
        closeSidePanel,
    };

    return (
        <SidePanelStateContext.Provider value={stateValue}>
            <SidePanelActionsContext.Provider value={actionsValue}>{children}</SidePanelActionsContext.Provider>
        </SidePanelStateContext.Provider>
    );
}

export default SidePanelContextProvider;
export {SidePanelStateContext, SidePanelActionsContext};
