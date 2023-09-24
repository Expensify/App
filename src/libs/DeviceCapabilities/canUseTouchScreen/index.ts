import {Merge} from 'type-fest';
import CanUseTouchScreen from './types';

type ExtendedNavigator = Merge<Navigator, {msMaxTouchPoints: number}>;

/**
 * Allows us to identify whether the platform has a touchscreen.
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
 */
const canUseTouchScreen: CanUseTouchScreen = () => {
    let hasTouchScreen = false;

    // TypeScript removed support for msMaxTouchPoints, this doesn't mean however that
    // this property doesn't exist - hence the use of ExtendedNavigator to ensure
    // that the functionality doesn't change
    // https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1029
    if ('maxTouchPoints' in navigator) {
        hasTouchScreen = navigator.maxTouchPoints > 0;
    } else if ('msMaxTouchPoints' in navigator) {
        hasTouchScreen = (navigator as ExtendedNavigator).msMaxTouchPoints > 0;
    } else {
        // Same case as for Navigator - TypeScript thinks that matchMedia is obligatory property of window although it may not be
        const mQ = window.matchMedia?.('(pointer:coarse)');
        if (mQ && mQ.media === '(pointer:coarse)') {
            hasTouchScreen = !!mQ.matches;
        } else if ('orientation' in window) {
            hasTouchScreen = true; // deprecated, but good fallback
        } else {
            // Only as a last resort, fall back to user agent sniffing
            const UA = (navigator as ExtendedNavigator).userAgent;
            hasTouchScreen = /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
        }
    }
    return hasTouchScreen;
};

export default canUseTouchScreen;
