/**
 * Get card style for cardStyleInterpolator
 * @param {Number} screenWidth
 * @returns {Object}
 */
export default function getCardStyles(screenWidth) {
    return {
        position: 'fixed',
        width: screenWidth,
        right: 0,
        height: '100%',
    };
}
