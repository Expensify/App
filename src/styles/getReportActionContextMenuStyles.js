import CONST from '../CONST';
import styles from './styles';
import variables from './variables';
import themeColors from './themes/default';

/**
 * Generate styles for the buttons in the mini comment actions menu.
 *
 * @param {String} [buttonState] - One of {'default', 'hovered', 'pressed'}
 * @returns {Array}
 */
function getMiniButtonStyle(buttonState = CONST.BUTTON_STATES.DEFAULT) {
    const defaultStyles = [styles.p1, styles.mv1, styles.mh2, {borderRadius: variables.componentBorderRadius}];
    switch (buttonState) {
        case CONST.BUTTON_STATES.HOVERED:
            return [
                ...defaultStyles,
                {
                    backgroundColor: themeColors.activeComponentBG,
                    cursor: 'pointer',
                },
            ];
        case CONST.BUTTON_STATES.PRESSED:
            return [
                styles.mv1,
                styles.mh2,
                {
                    borderRadius: variables.componentBorderRadius,
                    backgroundColor: themeColors.componentBG,
                    cursor: 'pointer',
                    borderWidth: 3,
                    borderColor: themeColors.border,
                    padding: 1,
                },
            ];
        case CONST.BUTTON_STATES.DEFAULT:
        default:
            return defaultStyles;
    }
}

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
function getReportActionContextMenuStyles(isMini) {
    return {
        getButtonStyle: isMini ? getMiniButtonStyle : () => {},
        wrapperStyle: isMini ? miniWrapperStyle : [],
    };
}

export default getReportActionContextMenuStyles;
