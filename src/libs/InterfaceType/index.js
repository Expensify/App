import _ from 'underscore';
import INTERFACE_TYPES from './INTERFACE_TYPES';

/**
 * Does a window media query.
 *
 * @param {String} query
 * @returns {boolean}
 */
function matchMedia(query) {
    return window.matchMedia(query).matches;
}

const userAgent = window.navigator.userAgent;
const hasTouchStartInWindow = _.has(window, 'ontouchstart');
const supportsTouchEvents = hasTouchStartInWindow
    || (_.has(window, 'TouchEvent') && matchMedia('(any-pointer: coarse)'));
const hasTouch = (window.navigator.maxTouchPoints || 0) > 0 || supportsTouchEvents;

// iPads now support a mouse that can hover, however the media query interaction
// feature results always say iPads only have a coarse pointer that can't hover
// even when a mouse is connected
const isIPad = matchMedia('(pointer: coarse)') && /ipad/i.test(userAgent);

// Assume we're dealing with a mouse-only interface
let interfaceType = INTERFACE_TYPES.MOUSE_ONLY;
if (hasTouch) {
    if (!hasTouchStartInWindow
        || !matchMedia('(pointer: coarse)')
        || matchMedia('(any-pointer: fine)')
        || matchMedia('(any-hover: hover)')
        || isIPad) {
        interfaceType = INTERFACE_TYPES.HYBRID;
    } else {
        interfaceType = INTERFACE_TYPES.TOUCH_ONLY;
    }
}

export default {
    getInterfaceType: () => interfaceType,
    interfaceTypes: INTERFACE_TYPES,
};
