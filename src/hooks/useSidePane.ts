import {useEffect, useRef, useState} from 'react';
// Import Animated directly from 'react-native' as animations are used with navigation.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
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

    const [sidePane] = useOnyx(ONYXKEYS.NVP_SIDE_PANE);
    const [language] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE);
    const isPaneHidden = isSidePaneHidden(sidePane, isExtraLargeScreenWidth) || language !== CONST.LOCALES.EN;

    const sidePaneWidth = shouldUseNarrowLayout ? windowWidth : variables.sideBarWidth;
    const shouldApplySidePaneOffset = isExtraLargeScreenWidth && !isPaneHidden;

    const [shouldHideSidePane, setShouldHideSidePane] = useState(true);
    const shouldHideSidePaneBackdrop = isPaneHidden || isExtraLargeScreenWidth || shouldUseNarrowLayout;
    const shouldHideTopLevelBottomBar = !shouldHideSidePaneBackdrop || (!isPaneHidden && shouldUseNarrowLayout);

    const sidePaneOffset = useRef(new Animated.Value(shouldApplySidePaneOffset ? variables.sideBarWidth : 0));
    const sidePaneTranslateX = useRef(new Animated.Value(isPaneHidden ? sidePaneWidth : 0));

    useEffect(() => {
        if (!isPaneHidden) {
            setShouldHideSidePane(false);
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
        });
    }, [isPaneHidden, shouldApplySidePaneOffset, shouldUseNarrowLayout, sidePaneWidth]);

    return {
        sidePane,
        shouldHideSidePane,
        shouldHideSidePaneBackdrop,
        shouldHideTopLevelBottomBar,
        sidePaneOffset,
        sidePaneTranslateX,
    };
}

export default useSidePane;
