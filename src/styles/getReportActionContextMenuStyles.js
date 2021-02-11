import CONST from '../CONST';
import styles from './styles';
import variables from './variables';
import themeColors from './themes/default';
import fontFamily from './fontFamily';

/**
 * Generate a style for the background color of the button, based on its current state.
 *
 * @param {String} [buttonState] - One of {'default', 'hovered', 'pressed'}
 * @returns {Object}
 */
function getButtonBackgroundColorStyle(buttonState = CONST.BUTTON_STATES.DEFAULT) {
    switch (buttonState) {
        case CONST.BUTTON_STATES.HOVERED:
            return {backgroundColor: themeColors.hoverComponentBG};
        case CONST.BUTTON_STATES.PRESSED:
            return {backgroundColor: themeColors.activeComponentBG};
        case CONST.BUTTON_STATES.DEFAULT:
        default:
            return {};
    }
}

/**
 * Generate styles for the buttons in the mini comment actions menu.
 *
 * @param {String} [buttonState] - One of {'default', 'hovered', 'pressed'}
 * @returns {Array}
 */
function getMiniButtonStyle(buttonState = CONST.BUTTON_STATES.DEFAULT) {
    return [
        getButtonBackgroundColorStyle(buttonState),
        styles.p1,
        styles.mv1,
        styles.mh1,
        {borderRadius: variables.componentBorderRadiusSmall},
    ];
}

function getBigButtonStyle(buttonState = CONST.BUTTON_STATES.DEFAULT) {
    return [
        getButtonBackgroundColorStyle(buttonState),
        styles.flex1,
        styles.flexRow,
        styles.alignItemsCenter,
        styles.p3,
    ];
}

/**
 * Get the fill color for the icons in the menu depending on the state of the button they're in.
 *
 * @param {String} [buttonState] - One of {'default', 'hovered', 'pressed'}
 * @returns {String}
 */
function getIconFillColor(buttonState = CONST.BUTTON_STATES.DEFAULT) {
    switch (buttonState) {
        case CONST.BUTTON_STATES.HOVERED:
            return themeColors.text;
        case CONST.BUTTON_STATES.PRESSED:
            return themeColors.heading;
        case CONST.BUTTON_STATES.DEFAULT:
        default:
            return themeColors.icon;
    }
}

function getTextStyle(buttonState = CONST.BUTTON_STATES.DEFAULT) {
    return [
        {
            color: getIconFillColor(buttonState),
            fontFamily: fontFamily.GTA_BOLD,
            fontSize: variables.fontSizeNormal,
            textAlign: 'center',
        },
        styles.mh3,
    ];
}

const defaultWrapperStyle = {
    flex: 1,
    borderRadius: variables.componentBorderRadiusNormal,
    borderWidth: 1,
    backgroundColor: themeColors.componentBG,
    borderColor: themeColors.border,
};

const miniWrapperStyle = [
    styles.flexRow,
    defaultWrapperStyle,
];

const bigWrapperStyle = [
    styles.flexColumn,
    defaultWrapperStyle,
];

/**
 * Get the wrapper and button styles for the comment actions menu.
 *
 * @param {boolean} isMini
 * @returns {Object}
 */
function getReportActionContextMenuStyles(isMini) {
    return {
        getIconFillColor,
        getTextStyle,
        getButtonStyle: isMini ? getMiniButtonStyle : getBigButtonStyle,
        wrapperStyle: isMini ? miniWrapperStyle : bigWrapperStyle,
    };
}

export default getReportActionContextMenuStyles;
