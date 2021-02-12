import getContainerStyle from './getContainerStyle';

/**
 * This custom animation is an alteration of a standard "bounce" effect, except it's off-centered up and to the right.
 * The result is that the popover appears to grow along a diagonal from bottom-left to top-right,
 * ...with a fun bounce effect :)
 *
 * Note: react-native-modal uses react-native-animatable for its animations.
 * So this object represents a custom animation definition for react-native-animatable.
 * https://github.com/oblador/react-native-animatable
 *
 * @param {Number} popoverWidth
 * @param {Number} popoverHeight
 * @returns {Object}
 */
function generateAnimationBounceInUpRight(popoverWidth, popoverHeight) {
    // By default, the animated component we display would be centered on the anchor points provided.
    // We need to shift the animation by 1/2 the popover's width and 1/2 the popover's height.
    // So we calculate those values here, and use them in the display/hide animations.
    const xOffset = Math.floor(popoverWidth / 2);
    const yOffset = -Math.floor(popoverHeight / 2);

    return {
        0: {
            opacity: 0,
            scale: 0.3,
            translateX: 0,
            translateY: 0,
        },
        0.01: {
            opacity: 0,
            scale: 0.3,
            translateX: xOffset,
            translateY: yOffset,
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
            translateX: xOffset,
            translateY: yOffset,
        },
    };
}

/**
 * This custom animation is an alteration of a standard "zoom-out" effect,
 * except it's off-centered down and to the left.
 * The result is that the popover appears to shrink along a diagonal from top-right to bottom-left.
 *
 * @param {Number} popoverWidth
 * @param {Number} popoverHeight
 * @returns {Object}
 */
function generateAnimationZoomOutDownLeft(popoverWidth, popoverHeight) {
    const xOffset = Math.floor(popoverWidth / 2);
    const yOffset = -Math.floor(popoverHeight / 2);

    return {
        0: {
            opacity: 1,
            scale: 1,
            translateX: xOffset,
            translateY: yOffset,
        },
        0.5: {
            opacity: 1,
            scale: 0.3,
        },
        0.99: {
            translateX: xOffset,
            translateY: yOffset,
        },
        1: {
            opacity: 0,
            scale: 0,
            translateX: 0,
            translateY: 0,
        },
    };
}

/**
 * Generate the style overrides for the popover modal.
 *
 * @param {Number} windowWidth
 * @param {Number} windowHeight
 * @param {Number} anchorX
 * @param {Number} anchorY
 * @param {Number} popoverWidth
 * @param {Number} popoverHeight
 * @returns {Object}
 */
function getModalStyleOverride(
    windowWidth,
    windowHeight,
    anchorX,
    anchorY,
    popoverWidth,
    popoverHeight,
) {
    return {
        animationIn: generateAnimationBounceInUpRight(popoverWidth, popoverHeight),
        animationOut: generateAnimationZoomOutDownLeft(popoverWidth, popoverHeight),
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
