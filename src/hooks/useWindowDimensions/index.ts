import {useEffect, useMemo, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Dimensions, useWindowDimensions} from 'react-native';
import * as Browser from '@libs/Browser';
import variables from '@styles/variables';
import type WindowDimensions from './types';

const initalViewportHeight = window.visualViewport?.height ?? window.innerHeight;
const tagNamesOpenKeyboard = ['INPUT', 'TEXTAREA'];

/**
 * A convenience wrapper around React Native's useWindowDimensions hook that also provides booleans for our breakpoints.
 */
export default function (isCachedViewportHeight = false): WindowDimensions {
    const shouldAwareVitualViewportHeight = isCachedViewportHeight && Browser.isMobileSafari();
    const cachedViewportHeightWithKeyboardRef = useRef(initalViewportHeight);
    const {width: windowWidth, height: windowHeight} = useWindowDimensions();

    // When the soft keyboard opens on mWeb, the window height changes. Use static screen height instead to get real screenHeight.
    const screenHeight = Dimensions.get('screen').height;
    const isExtraSmallScreenHeight = screenHeight <= variables.extraSmallMobileResponsiveHeightBreakpoint;
    const isSmallScreenWidth = windowWidth <= variables.mobileResponsiveWidthBreakpoint;
    const isMediumScreenWidth = windowWidth > variables.mobileResponsiveWidthBreakpoint && windowWidth <= variables.tabletResponsiveWidthBreakpoint;
    const isLargeScreenWidth = windowWidth > variables.tabletResponsiveWidthBreakpoint;

    const [cachedViewportHeight, setCachedViewportHeight] = useState(windowHeight);

    const handleFocusIn = useRef((event: FocusEvent) => {
        const targetElement = event.target as HTMLElement;
        if (tagNamesOpenKeyboard.includes(targetElement.tagName)) {
            setCachedViewportHeight(cachedViewportHeightWithKeyboardRef.current);
        }
    });

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        if (shouldAwareVitualViewportHeight) {
            window.addEventListener('focusin', handleFocusIn.current);
            return () => {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                window.removeEventListener('focusin', handleFocusIn.current);
            };
        }
    }, [shouldAwareVitualViewportHeight]);

    const handleFocusOut = useRef((event: FocusEvent) => {
        const targetElement = event.target as HTMLElement;
        if (tagNamesOpenKeyboard.includes(targetElement.tagName)) {
            setCachedViewportHeight(initalViewportHeight);
        }
    });

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        if (shouldAwareVitualViewportHeight) {
            window.addEventListener('focusout', handleFocusOut.current);
            return () => {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                window.removeEventListener('focusout', handleFocusOut.current);
            };
        }
    }, [shouldAwareVitualViewportHeight]);

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        if (shouldAwareVitualViewportHeight && windowHeight < cachedViewportHeightWithKeyboardRef.current) {
            setCachedViewportHeight(windowHeight);
        }
    }, [windowHeight, shouldAwareVitualViewportHeight]);

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        if (shouldAwareVitualViewportHeight && window.matchMedia('(orientation: portrait)').matches) {
            if (windowHeight < initalViewportHeight) {
                cachedViewportHeightWithKeyboardRef.current = windowHeight;
            }
        }
    }, [shouldAwareVitualViewportHeight, windowHeight]);

    return useMemo(
        () => ({
            windowWidth,
            windowHeight: shouldAwareVitualViewportHeight ? cachedViewportHeight : windowHeight,
            isExtraSmallScreenHeight,
            isSmallScreenWidth,
            isMediumScreenWidth,
            isLargeScreenWidth,
        }),
        [windowWidth, shouldAwareVitualViewportHeight, cachedViewportHeight, windowHeight, isExtraSmallScreenHeight, isSmallScreenWidth, isMediumScreenWidth, isLargeScreenWidth],
    );
}
