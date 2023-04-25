import styles from './styles';
import variables from './variables';
import themeColors from './themes/default';

const defaultWrapperStyle = {
    backgroundColor: themeColors.componentBG,
};

const miniWrapperStyle = [
    styles.flexRow,
    defaultWrapperStyle,
    {
        borderRadius: variables.buttonBorderRadius,
        borderWidth: 1,
        borderColor: themeColors.border,
    },
];

const bigWrapperStyle = [
    styles.flexColumn,
    defaultWrapperStyle,
];

/**
 * Generate the wrapper styles for the ReportActionContextMenu.
 *
 * @param {Boolean} isMini
 * @param {Boolean} isSmallScreenWidth
 * @returns {Array}
 */
function getReportActionContextMenuStyles(isMini, isSmallScreenWidth) {
    // For the bottom_docked modal type, we have defined default paddings in getBaseModalStyles file, so there is no need to add vertical padding for small screen width
    // When popover modal type, then only Need to pass vertical padding.
    return isMini ? miniWrapperStyle : [...bigWrapperStyle, isSmallScreenWidth ? {} : styles.pv3];
}

export default getReportActionContextMenuStyles;
