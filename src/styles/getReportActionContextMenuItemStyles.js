import CONST from '../CONST';
import themeColors from './themes/default';
import styles from './styles';
import variables from './variables';

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
        case CONST.BUTTON_STATES.COMPLETE:
            return themeColors.iconSuccessFill;
        case CONST.BUTTON_STATES.DEFAULT:
        default:
            return themeColors.icon;
    }
}

/**
 * Generate styles for the buttons in the mini ReportActionContextMenu.
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

/**
 * Generate styles for the rows in the larger ReportActionContextMenu.
 *
 * @param {String} [buttonState] - One of {'default', 'hovered', 'pressed'}
 * @returns {Array}
 */
function getBigButtonStyle(buttonState = CONST.BUTTON_STATES.DEFAULT) {
    return [
        getButtonBackgroundColorStyle(buttonState),
        styles.flexRow,
        styles.alignItemsCenter,
        styles.p4,
    ];
}

/**
 * Generate dynamic styles for the ReportActionContextMenuItem component.
 *
 * @param {Boolean} isMini
 * @returns {Object}
 */
function getReportActionContextMenuItemStyles(isMini) {
    return {
        getButtonStyle: isMini ? getMiniButtonStyle : getBigButtonStyle,
        getIconFillColor,
    };
}

export default getReportActionContextMenuItemStyles;
