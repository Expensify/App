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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: isHovered ? themeColors.activeComponentBG : themeColors.componentBG,
        cursor: 'default',
    };
}
