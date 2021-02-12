import getContainerStyle from './getContainerStyle';
import variables from '../variables';
import CONTEXT_ACTIONS from '../../pages/home/report/ReportActionContextMenu/CONTEXT_ACTIONS';

// By default, the animated component we display would be centered on the anchor points provided.
// We need to shift the animation by 1/2 the popover's width and half the popover's height.
// So we calculate those static values here, and use them in the display/hide animations.
const CONTEXT_MENU_POPOVER_WIDTH = variables.reportActionContextMenuItemWidth;
const CONTEXT_MENU_POPOVER_HEIGHT = CONTEXT_ACTIONS.length * variables.reportActionContextMenuItemHeight;
const translateX = CONTEXT_MENU_POPOVER_WIDTH / 2;
const translateY = -(CONTEXT_MENU_POPOVER_HEIGHT / 2);

/**
 * This custom animation is an alteration of a standard "bounce" effect, except it's off-centered up and to the right.
 * The result is that the popover appears to grow along a diagonal from bottom-left to top-right,
 * ...with a fun bounce effect :)
 *
 * Note: react-native-modal uses react-native-animatable for its animations.
 * So this object represents a custom animation definition for react-native-animatable.
 * https://github.com/oblador/react-native-animatable
 */
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
        translateX,
        translateY,
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
        translateX,
        translateY,
    },
};

/**
 * This custom animation is an alteration of a standard "zoom" effect, except it's off-centered down and to the left.
 * The result is that the popover appears to shrink along a diagonal from top-right to bottom-left.
 */
const CUSTOM_ANIMATION_ZOOM_OUT_DOWN_LEFT = {
    0: {
        opacity: 1,
        scale: 1,
        translateX,
        translateY,
    },
    0.5: {
        opacity: 1,
        scale: 0.3,
    },
    0.99: {
        translateX,
        translateY,
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
function getModalStyleOverride(
    windowWidth,
    windowHeight,
    anchorX,
    anchorY,
) {
    return {
        animationIn: CUSTOM_ANIMATION_BOUNCE_IN_UP_RIGHT,
        animationOut: CUSTOM_ANIMATION_ZOOM_OUT_DOWN_LEFT,
        animationInTiming: 800,
        animationOutTiming: 400,
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
