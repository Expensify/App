import _ from 'underscore';
import INTERFACE_TYPES from './INTERFACE_TYPES';

const userAgent = window.navigator.userAgent;
const hasTouchStartInWindow = _.has(window, 'ontouchstart');
const supportsTouchEvents = hasTouchStartInWindow
    || (_.has(window, 'TouchEvent') && window.matchMedia('(any-pointer: coarse)').matches);
const hasTouch = (window.navigator.maxTouchPoints || 0) > 0 || supportsTouchEvents;

// iPads now support a mouse that can hover, however the media query interaction
// feature results always say iPads only have a coarse pointer that can't hover
// even when a mouse is connected
const isIPad = window.matchMedia('(pointer: coarse)').matches && /Ipad/.test(userAgent);

// Assume we're dealing with a mouse-only interface
let interfaceType = INTERFACE_TYPES.MOUSE_ONLY;
if (hasTouch) {
    if (!hasTouchStartInWindow
        || !window.matchMedia('(pointer: coarse)').matches
        || window.matchMedia('(any-pointer: fine)').matches
        || window.matchMedia('(any-hover: hover)').matches
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
