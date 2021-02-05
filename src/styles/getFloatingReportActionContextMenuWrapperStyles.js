import positioning from './utilities/positioning';

/**
 * Generate the styles for the wrapper view of the floating report action context menu.
 *
 * @param {Number} yOffset
 * @returns {Object}
 */
export default function (yOffset) {
    return {
        position: 'absolute',
        top: yOffset + positioning.tn4.top,
        ...positioning.r4,
    };
}
