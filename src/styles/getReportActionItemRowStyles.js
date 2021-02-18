import themeColors from './themes/default';

/**
 * Generate the styles for the ReportActionItem wrapper view.
 *
 * @param {Boolean} [isHovered]
 * @returns {Object}
 */
export default function (isHovered = false) {
    return {
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: isHovered ? themeColors.hoverComponentBG : themeColors.componentBG,
        cursor: 'default',
    };
}
