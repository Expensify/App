import styles from './styles';
import variables from './variables';
import themeColors from './themes/default';

const miniWrapperStyle = [
    styles.flexRow,
    {
        flex: 1,
        borderRadius: variables.componentBorderRadiusNormal,
        borderWidth: 1,
        backgroundColor: themeColors.componentBG,
        borderColor: themeColors.border,
    },
];

/**
 * Generate the wrapper styles for the ReportActionContextMenu.
 *
 * @param {Boolean} isMini
 * @returns {Array}
 */
function getReportActionContextMenuStyles(isMini) {
    return isMini ? miniWrapperStyle : [];
}

export default getReportActionContextMenuStyles;
