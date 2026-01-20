import type {PropsWithChildren, RefObject} from 'react';
import React, {createContext, useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
    reportID?: string;
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

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});
    const [onboardingRHPVariant] = useOnyx(ONYXKEYS.NVP_ONBOARDING_RHP_VARIANT, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [sessionEmail] = useOnyx(ONYXKEYS.SESSION, {
        canBeMissing: true,
        selector: emailSelector,
    });

    const reportID = useMemo(() => {
        const isRHPAdminsRoom = onboardingRHPVariant === CONST.ONBOARDING_RHP_VARIANT.RHP_ADMINS_ROOM;
        const isUserAdmin = isPolicyAdmin(activePolicy, sessionEmail);
        const isPolicyActive = shouldShowPolicy(activePolicy, false, sessionEmail ?? '');
        const adminsChatReportID = activePolicy?.chatReportIDAdmins?.toString();

        if (isRHPAdminsRoom && isUserAdmin && isPolicyActive && adminsChatReportID) {
            return adminsChatReportID;
        }

        return conciergeReportID;
    }, [onboardingRHPVariant, activePolicy, sessionEmail, conciergeReportID]);

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
            reportID,
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
            reportID,
        ],
    );

    return <SidePanelContext.Provider value={value}>{children}</SidePanelContext.Provider>;
}

export default SidePanelContextProvider;
export {SidePanelContext};
