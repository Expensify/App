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

const bigWrapperStyle = [styles.flexColumn, defaultWrapperStyle];

/**
 * Generate the wrapper styles for the ReportActionContextMenu.
 *
 * @param {Boolean} isMini
 * @param {Boolean} isSmallScreenWidth
 * @returns {Array}
 */
function getReportActionContextMenuStyles(isMini, isSmallScreenWidth) {
    if (isMini) {
        return miniWrapperStyle;
    }

    return [
        ...bigWrapperStyle,

        // Small screens use a bottom-docked modal that already has vertical padding.
        isSmallScreenWidth ? {} : styles.pv3,
    ];
}

export default getReportActionContextMenuStyles;
