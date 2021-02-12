import getContainerStyle from './getContainerStyle';

/**
 * This custom animation is an alteration of a standard "bounce" effect, except it's off-centered up and to the right.
 * The result is that the popover appears to grow along a diagonal from bottom-left to top-right,
 * ...with a fun bounce effect :)
 */
// eslint-disable-next-line no-unused-vars
const CUSTOM_ANIMATION_BOUNCE_IN_UP_RIGHT = {
    0: {
        opacity: 0,
        scale: 0.3,
        translateX: 0,
        translateY: 0,
    },
    0.01: {
        opacity: 0,
        scale: 0.3,
        translateX: 150,
        translateY: -250,
    },
    0.2: {
        scale: 1.1,
    },
    0.4: {
        scale: 0.9,
    },
    0.6: {
        opacity: 1,
        scale: 1.03,
    },
    0.8: {
        scale: 0.97,
    },
    1: {
        opacity: 1,
        scale: 1,
        translateX: 150,
        translateY: -250,
    },
};

/**
 * This custom animation is an alteration of a standard "zoom" effect, except it's off-centered down and to the left.
 * The result is that the popover appears to shrink along a diagonal from top-right to bottom-left.
 */
// eslint-disable-next-line no-unused-vars
const CUSTOM_ANIMATION_ZOOM_OUT_DOWN_LEFT = {
    0: {
        opacity: 1,
        scale: 1,
        translateX: 150,
        translateY: -250,
    },
    0.5: {
        opacity: 1,
        scale: 0.3,
    },
    0.99: {
        translateX: 150,
        translateY: -250,
    },
    1: {
        opacity: 0,
        scale: 0,
        translateX: 0,
        translateY: 0,
    },
};

/**
 * Generate the style overrides for the popover modal.
 *
 * @param {Number} windowWidth
 * @param {Number} windowHeight
 * @param {Number} anchorX
 * @param {Number} anchorY
 * @returns {Object}
 */
function getModalStyleOverride(windowWidth, windowHeight, anchorX, anchorY) {
    return {
        animationIn: 'zoomIn',
        animationInTiming: 800,
        animationOutTiming: 400,
        animationOut: 'zoomOut',
        modalStyle: {
            left: anchorX - (windowWidth / 2),
            marginBottom: windowHeight - anchorY,
        },
    };
}

/**
 * Generate the styles for the ReportActionItem component.
 *
 * @returns {Object}
 */
export default function () {
    return {
        getContainerStyle,
        getModalStyleOverride,
    };
}
