import styles from './styles';
import variables from './variables';
import themeColors from './themes/default';

const miniButtonStyle = [styles.p1, styles.mv1, styles.mh2];
const miniWrapperStyle = [
    styles.flexRow,
    styles.boxShadowDefault,
    {
        borderRadius: variables.componentBorderRadius,
        borderWidth: 1,
        backgroundColor: themeColors.componentBG,
        borderColor: themeColors.border,
    },
];

/**
 * Get the wrapper and button styles for the comment actions menu.
 *
 * @param {boolean} isMini
 * @returns {Object}
 */
function getCommentActionsMenuStyles(isMini) {
    return {
        buttonStyle: isMini ? miniButtonStyle : [],
        wrapperStyle: isMini ? miniWrapperStyle : [],
    };
}

export default getCommentActionsMenuStyles;
