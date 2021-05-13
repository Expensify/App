import colors from './colors';
import themeColors from './themes/default';
import positioning from './utilities/positioning';

/**
 * Generate the styles for the ReportActionItem wrapper view.
 *
 * @param {Boolean} [isHovered]
 * @returns {Object}
 */
export function getReportActionItemStyle(isHovered = false) {
    return {
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: isHovered
            ? themeColors.hoverComponentBG

            // Warning: Setting this to a non-transparent color will cause unread indicator to break on Android
            : colors.transparent,
        cursor: 'default',
    };
}

/**
 * Generate the wrapper styles for the mini ReportActionContextMenu.
 *
 * @param {Boolean} isReportActionItemGrouped
 * @returns {Object}
 */
export function getMiniReportActionContextMenuWrapperStyle(isReportActionItemGrouped) {
    return {
        ...(isReportActionItemGrouped ? positioning.tn8 : positioning.tn4),
        ...positioning.r4,
        position: 'absolute',
        zIndex: 1,
    };
}
