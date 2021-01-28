import themeColors from './themes/default';
import {computeMiniReportActionContextMenuDimensions} from './getReportActionContextMenuStyles';

/**
 * Generate the styles for the ReportActionItem wrapper view.
 *
 * @param {Number} messageWidth
 * @param {Number} messageHeight
 * @param {Boolean} [isHovered]
 * @returns {Object}
 */
export default function (messageWidth, messageHeight, isHovered = false) {
    const menuDimensions = computeMiniReportActionContextMenuDimensions();
    return {
        messageWrapperStyle: {
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: isHovered ? themeColors.hoverComponentBG : themeColors.componentBG,
            cursor: 'default',
            marginTop: -1 * (menuDimensions.height),
        },
        menuWrapperStyle: {
            display: (messageWidth && messageHeight) ? 'flex' : 'none',
            position: 'relative',
            width: menuDimensions.width,
            height: menuDimensions.height,
            left: messageWidth - menuDimensions.width - 16,
            right: 16,
            top: (-1 * messageHeight) - (menuDimensions.height / 2),
        },
    };
}
