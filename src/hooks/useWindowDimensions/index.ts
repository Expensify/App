import {useContext, useEffect, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Dimensions, useWindowDimensions} from 'react-native';
import type {ResponsiveLayoutProperties} from '@components/VideoPlayerContexts/FullScreenContext';
import {FullScreenContext} from '@components/VideoPlayerContexts/FullScreenContext';
import useDebouncedState from '@hooks/useDebouncedState';
import {isMobile as isMobileBrowser, isMobileWebKit} from '@libs/Browser';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type WindowDimensions from './types';

const initialViewportHeight = window.visualViewport?.height ?? window.innerHeight;
const tagNamesOpenKeyboard = [CONST.ELEMENT_NAME.INPUT, CONST.ELEMENT_NAME.TEXTAREA] as string[];
const isMobile = isMobileBrowser();

/**
 * A wrapper around React Native's useWindowDimensions hook.
 */
export default function (useCachedViewportHeight = false): WindowDimensions {
    const {isFullScreenRef, lockedWindowDimensionsRef, lockWindowDimensions, unlockWindowDimensions} = useContext(FullScreenContext) ?? {
        isFullScreenRef: useRef(false),
        lockedWindowDimensionsRef: useRef<ResponsiveLayoutProperties | null>(null),
        lockWindowDimensions: () => {},
        unlockWindowDimensions: () => {},
    };

    const isCachedViewportHeight = useCachedViewportHeight && isMobileWebKit();
    const cachedViewportHeightWithKeyboardRef = useRef(initialViewportHeight);
    const {width: windowWidth, height: windowHeight} = useWindowDimensions();

    // These are the same as the ones in useResponsiveLayout, but we need to redefine them here to avoid cyclic dependency.
    // When the soft keyboard opens on mWeb, the window height changes. Use static screen height instead to get real screenHeight.
    const screenHeight = Dimensions.get('screen').height;
    const isExtraSmallScreenHeight = screenHeight <= variables.extraSmallMobileResponsiveHeightBreakpoint;
    const isSmallScreenWidth = windowWidth <= variables.mobileResponsiveWidthBreakpoint;
    const isMediumScreenWidth = windowWidth > variables.mobileResponsiveWidthBreakpoint && windowWidth <= variables.tabletResponsiveWidthBreakpoint;
    const isLargeScreenWidth = windowWidth > variables.tabletResponsiveWidthBreakpoint;
    const isExtraSmallScreenWidth = windowWidth <= variables.extraSmallMobileResponsiveWidthBreakpoint;
    const lowerScreenDimension = Math.min(windowWidth, windowHeight);
    const isSmallScreen = lowerScreenDimension <= variables.mobileResponsiveWidthBreakpoint;

    const responsiveLayoutResults = {
        isSmallScreenWidth,
        isExtraSmallScreenHeight,
        isExtraSmallScreenWidth,
        isMediumScreenWidth,
        isLargeScreenWidth,
        isSmallScreen,
    };

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

        const handleFocusInValue = handleFocusIn.current;
        window.addEventListener('focusin', handleFocusInValue);
        return () => {
            window.removeEventListener('focusin', handleFocusInValue);
        };
    }, [isCachedViewportHeight]);

    const handleFocusOut = useRef((event: FocusEvent) => {
        const targetElement = event.target as HTMLElement;
        if (tagNamesOpenKeyboard.includes(targetElement.tagName)) {
            setCachedViewportHeight(initialViewportHeight);
        }
    });

    useEffect(() => {
        if (!isCachedViewportHeight) {
            return;
        }

        const handleFocusOutValue = handleFocusOut.current;
        window.addEventListener('focusout', handleFocusOutValue);
        return () => {
            window.removeEventListener('focusout', handleFocusOutValue);
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
        if (!isCachedViewportHeight || !window.matchMedia('(orientation: portrait)').matches || windowHeight >= initialViewportHeight) {
            return;
        }
        cachedViewportHeightWithKeyboardRef.current = windowHeight;
    }, [isCachedViewportHeight, windowHeight]);

    const windowDimensions = {
        windowWidth,
        windowHeight: isCachedViewportHeight ? cachedViewportHeight : windowHeight,
        responsiveLayoutResults,
    };

    if (!lockedWindowDimensionsRef.current && !isFullScreenRef.current) {
        return windowDimensions;
    }

    const didScreenChangeOrientation =
        isMobile &&
        lockedWindowDimensionsRef.current &&
        isExtraSmallScreenWidth === lockedWindowDimensionsRef.current.responsiveLayoutResults.isExtraSmallScreenHeight &&
        isSmallScreenWidth === lockedWindowDimensionsRef.current.responsiveLayoutResults.isSmallScreen &&
        isMediumScreenWidth === lockedWindowDimensionsRef.current.responsiveLayoutResults.isMediumScreenWidth &&
        isLargeScreenWidth === lockedWindowDimensionsRef.current.responsiveLayoutResults.isLargeScreenWidth &&
        lockedWindowDimensionsRef.current.windowWidth !== windowWidth &&
        lockedWindowDimensionsRef.current.windowHeight !== windowHeight;

    // if video is in fullscreen mode, lock the window dimensions since they can change and cause whole app to re-render
    if (!lockedWindowDimensionsRef.current || didScreenChangeOrientation) {
        lockWindowDimensions(windowDimensions);
        return windowDimensions;
    }

    // if video exits fullscreen mode, unlock the window dimensions
    if (lockedWindowDimensionsRef.current && !isFullScreenRef.current) {
        const lastLockedWindowDimensions = {...lockedWindowDimensionsRef.current};
        unlockWindowDimensions();
        return {windowWidth: lastLockedWindowDimensions.windowWidth, windowHeight: lastLockedWindowDimensions.windowHeight};
    }

    return {windowWidth: lockedWindowDimensionsRef.current.windowWidth, windowHeight: lockedWindowDimensionsRef.current.windowHeight};
}
