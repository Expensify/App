import {useContext, useEffect, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Dimensions, useWindowDimensions} from 'react-native';
import {FullScreenContext} from '@components/VideoPlayerContexts/FullScreenContext';
import useDebouncedState from '@hooks/useDebouncedState';
import * as Browser from '@libs/Browser';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type WindowDimensions from './types';

const initalViewportHeight = window.visualViewport?.height ?? window.innerHeight;
const tagNamesOpenKeyboard = ['INPUT', 'TEXTAREA'];

/**
 * A convenience wrapper around React Native's useWindowDimensions hook that also provides booleans for our breakpoints.
 */
export default function (useCachedViewportHeight = false): WindowDimensions {
    const {isFullscreen, lockedWindowDimensions, lockWindowDimensions, unlockWindowDimensions} = useContext(FullScreenContext) ?? {
        isFullscreen: useRef(false),
        lockedWindowDimensions: useRef<WindowDimensions | null>(null),
        lockWindowDimensions: () => {},
        unlockWindowDimensions: () => {},
    };

    const isCachedViewportHeight = useCachedViewportHeight && Browser.isMobileSafari();
    const cachedViewportHeightWithKeyboardRef = useRef(initalViewportHeight);
    const {width: windowWidth, height: windowHeight} = useWindowDimensions();

    // When the soft keyboard opens on mWeb, the window height changes. Use static screen height instead to get real screenHeight.
    const screenHeight = Dimensions.get('screen').height;
    const isExtraSmallScreenHeight = screenHeight <= variables.extraSmallMobileResponsiveHeightBreakpoint;
    const isSmallScreenWidth = windowWidth <= variables.mobileResponsiveWidthBreakpoint;
    const isMediumScreenWidth = windowWidth > variables.mobileResponsiveWidthBreakpoint && windowWidth <= variables.tabletResponsiveWidthBreakpoint;
    const isLargeScreenWidth = windowWidth > variables.tabletResponsiveWidthBreakpoint;
    const isExtraSmallScreenWidth = windowWidth <= variables.extraSmallMobileResponsiveWidthBreakpoint;

    const [, cachedViewportHeight, setCachedViewportHeight] = useDebouncedState(windowHeight, CONST.TIMING.RESIZE_DEBOUNCE_TIME);

    const handleFocusIn = useRef((event: FocusEvent) => {
        const targetElement = event.target as HTMLElement;
        if (tagNamesOpenKeyboard.includes(targetElement.tagName)) {
            setCachedViewportHeight(cachedViewportHeightWithKeyboardRef.current);
        }
    });

    useEffect(() => {
        if (!isCachedViewportHeight) {
            return;
        }
        window.addEventListener('focusin', handleFocusIn.current);
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            window.removeEventListener('focusin', handleFocusIn.current);
        };
    }, [isCachedViewportHeight]);

    const handleFocusOut = useRef((event: FocusEvent) => {
        const targetElement = event.target as HTMLElement;
        if (tagNamesOpenKeyboard.includes(targetElement.tagName)) {
            setCachedViewportHeight(initalViewportHeight);
        }
    });

    useEffect(() => {
        if (!isCachedViewportHeight) {
            return;
        }
        window.addEventListener('focusout', handleFocusOut.current);
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            window.removeEventListener('focusout', handleFocusOut.current);
        };
    }, [isCachedViewportHeight]);

    useEffect(() => {
        if (!isCachedViewportHeight && windowHeight >= cachedViewportHeightWithKeyboardRef.current) {
            return;
        }
        setCachedViewportHeight(windowHeight);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowHeight, isCachedViewportHeight]);

    useEffect(() => {
        if (!isCachedViewportHeight || !window.matchMedia('(orientation: portrait)').matches || windowHeight >= initalViewportHeight) {
            return;
        }
        cachedViewportHeightWithKeyboardRef.current = windowHeight;
    }, [isCachedViewportHeight, windowHeight]);

    const returnObject = {
        windowWidth,
        windowHeight: isCachedViewportHeight ? cachedViewportHeight : windowHeight,
        isExtraSmallScreenHeight,
        isSmallScreenWidth,
        isMediumScreenWidth,
        isLargeScreenWidth,
        isExtraSmallScreenWidth,
    };

    if (!lockedWindowDimensions.current && !isFullscreen.current) {
        return returnObject;
    }

    if (!lockedWindowDimensions.current && isFullscreen.current) {
        lockWindowDimensions(returnObject);
    } else if (lockedWindowDimensions.current && !isFullscreen.current && lockedWindowDimensions.current.windowWidth === windowWidth) {
        const tmp = lockedWindowDimensions.current;
        unlockWindowDimensions();
        return tmp;
    }

    if (lockedWindowDimensions.current) {
        return lockedWindowDimensions.current;
    }
    return returnObject;
}
