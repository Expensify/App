import {useCallback, useEffect, useRef, useState} from 'react';
// Import Animated directly from 'react-native' as animations are used with navigation.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import {triggerSidePane} from '@libs/actions/SidePane';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import useResponsiveLayout from './useResponsiveLayout';
import useWindowDimensions from './useWindowDimensions';

function isSidePaneHidden(sidePane: OnyxEntry<OnyxTypes.SidePane>, isExtraLargeScreenWidth: boolean) {
    if (!isExtraLargeScreenWidth && !sidePane?.openNarrowScreen) {
        return true;
    }

    return isExtraLargeScreenWidth && !sidePane?.open;
}

/**
 * Hook to get the animated position of the side pane and the margin of the navigator
 */
function useSidePane() {
    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowWidth} = useWindowDimensions();

    const [sidePaneNVP] = useOnyx(ONYXKEYS.NVP_SIDE_PANE);
    const [language] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE);
    const isLanguageUnsupported = language !== CONST.LOCALES.EN;
    const isPaneHidden = isSidePaneHidden(sidePaneNVP, isExtraLargeScreenWidth) || isLanguageUnsupported;

    const sidePaneWidth = shouldUseNarrowLayout ? windowWidth : variables.sideBarWidth;
    const shouldApplySidePaneOffset = isExtraLargeScreenWidth && !isPaneHidden;

    const [shouldHideSidePane, setShouldHideSidePane] = useState(true);
    const [isAnimatingExtraLargeScree, setIsAnimatingExtraLargeScreen] = useState(false);

    const shouldHideSidePaneBackdrop = isPaneHidden || isExtraLargeScreenWidth || shouldUseNarrowLayout;
    const shouldHideToolTip = isExtraLargeScreenWidth ? isAnimatingExtraLargeScree : !shouldHideSidePane;

    // The help button is hidden when:
    // - side pane nvp is not set
    // - side pane is displayed currently
    // - language is unsupported
    const shouldHideHelpButton = !sidePaneNVP || !isPaneHidden || isLanguageUnsupported;

    const sidePaneOffset = useRef(new Animated.Value(shouldApplySidePaneOffset ? variables.sideBarWidth : 0));
    const sidePaneTranslateX = useRef(new Animated.Value(isPaneHidden ? sidePaneWidth : 0));

    useEffect(() => {
        if (!isPaneHidden) {
            setShouldHideSidePane(false);
        }
        if (isExtraLargeScreenWidth) {
            setIsAnimatingExtraLargeScreen(true);
        }

        Animated.parallel([
            Animated.timing(sidePaneOffset.current, {
                toValue: shouldApplySidePaneOffset ? variables.sideBarWidth : 0,
                duration: CONST.ANIMATED_TRANSITION,
                useNativeDriver: false,
            }),
            Animated.timing(sidePaneTranslateX.current, {
                toValue: isPaneHidden ? sidePaneWidth : 0,
                duration: CONST.ANIMATED_TRANSITION,
                useNativeDriver: false,
            }),
        ]).start(() => {
            setShouldHideSidePane(isPaneHidden);
            setIsAnimatingExtraLargeScreen(false);
        });
    }, [isPaneHidden, shouldApplySidePaneOffset, shouldUseNarrowLayout, sidePaneWidth, isExtraLargeScreenWidth]);

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
        },
        [isExtraLargeScreenWidth, sidePaneNVP],
    );

    return {
        sidePane: sidePaneNVP,
        shouldHideSidePane,
        shouldHideSidePaneBackdrop,
        shouldHideHelpButton,
        sidePaneOffset,
        sidePaneTranslateX,
        shouldHideToolTip,
        closeSidePane,
    };
}

export default useSidePane;
