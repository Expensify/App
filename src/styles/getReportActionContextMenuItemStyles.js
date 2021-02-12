import CONST from '../CONST';
import themeColors from './themes/default';
import styles from './styles';
import variables from './variables';
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
        styles.flex1,
        styles.flexRow,
        styles.alignItemsCenter,
        styles.p3,
        {
            // Note: We give each item a static width and height so that we can calculate the dimensions of the
            // ReportActionContextMenu popover and use those dimensions in its display animation.
            width: variables.reportActionContextMenuItemWidth,
            height: variables.reportActionContextMenuItemHeight,
        },
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

/**
 * Get the style of the text in the ReportActionContextMenu, depending on the state of the button it's it.
 *
 * @param {String} [buttonState] - One of {'default', 'hovered', 'pressed'}
 * @returns {Array}
 */
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
        getTextStyle,
    };
}

export default getReportActionContextMenuItemStyles;
