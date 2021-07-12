/**
 * Get Indicator Styles while animating
 *
 * @param {Object} rotate
 * @param {Object} scale
 * @returns {Object}
 */
function getSyncingStyles(rotate, scale) {
    return {
        transform: [{
            rotate: rotate.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '-360deg'],
            }),
        },
        {
            scale,
        }],
    };
}

// eslint-disable-next-line import/prefer-default-export
export {getSyncingStyles};
