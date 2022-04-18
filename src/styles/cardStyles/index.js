import variables from '../variables';

/**
 * Get card style for cardStyleInterpolator
 * @param {Boolean} isSmallScreenWidth
 * @param {Number} screenWidth
 * @returns {Object}
 */
export default function getCardStyles(isSmallScreenWidth, screenWidth) {
    return {
        position: 'fixed',
        width: isSmallScreenWidth ? screenWidth : variables.sideBarWidth,
        right: 0,
        height: '100%',
    };
}
