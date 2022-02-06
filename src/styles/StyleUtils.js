import _ from 'underscore';
import CONST from '../CONST';
import fontFamily from './fontFamily';
import themeColors from './themes/default';
import variables from './variables';
import colors from './colors';
import positioning from './utilities/positioning';
import styles from './styles';

/**
 * Takes safe area insets and returns padding to use for a View
 *
 * @param {Object} insets
 * @returns {Object}
 */
function getSafeAreaPadding(insets) {
    return {
        paddingTop: insets.top,
        paddingBottom: insets.bottom * variables.safeInsertPercentage,
        paddingLeft: insets.left * variables.safeInsertPercentage,
        paddingRight: insets.right * variables.safeInsertPercentage,
    };
}

/**
 * Takes safe area insets and returns margin to use for a View
 *
 * @param {Object} insets
 * @returns {Object}
 */
function getSafeAreaMargins(insets) {
    return {marginBottom: insets.bottom * variables.safeInsertPercentage};
}

/**
 * Return navigation menu styles.
 *
 * @param {Boolean} isSmallScreenWidth
 * @returns {Object}
 */
function getNavigationDrawerStyle(isSmallScreenWidth) {
    return isSmallScreenWidth
        ? {
            width: '100%',
            height: '100%',
            borderColor: themeColors.border,
        }
        : {
            height: '100%',
            width: variables.sideBarWidth,
            borderRightColor: themeColors.border,
        };
}

function getNavigationDrawerType(isSmallScreenWidth) {
    return isSmallScreenWidth ? 'slide' : 'permanent';
}

function getNavigationModalCardStyle(isSmallScreenWidth) {
    return {
        position: 'absolute',
        top: 0,
        right: 0,
        width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,
        backgroundColor: 'transparent',
        height: '100%',
    };
}

/**
 * @param {Boolean} isZoomed
 * @param {Boolean} isDragging
 * @return {Object}
 */
function getZoomCursorStyle(isZoomed, isDragging) {
    if (!isZoomed) {
        return {cursor: 'zoom-in'};
    }

    return {
        cursor: isDragging ? 'grabbing' : 'zoom-out',
    };
}

/**
 * @param {Boolean} isZoomed
 * @param {Number} imgWidth
 * @param {Number} imgHeight
 * @param {Number} zoomScale
 * @param {Number} containerHeight
 * @param {Number} containerWidth
 * @return {Object}
 */
function getZoomSizingStyle(isZoomed, imgWidth, imgHeight, zoomScale, containerHeight, containerWidth) {
    if (imgWidth === 0 || imgHeight === 0) {
        return {
            height: isZoomed ? '250%' : '100%',
            width: isZoomed ? '250%' : '100%',
        };
    }
    const top = `${Math.max((containerHeight - imgHeight) / 2, 0)}px`;
    const left = `${Math.max((containerWidth - imgWidth) / 2, 0)}px`;

    // Return different size and offset style based on zoomScale and isZoom.
    if (isZoomed) {
        // When both width and height are smaller than container(modal) size, set the height by multiplying zoomScale if it is zoomed in.
        if (zoomScale > 1) {
            return {
                height: `${imgHeight * zoomScale}px`,
                width: `${imgWidth * zoomScale}px`,
            };
        }

        // If image height and width are bigger than container size, display image with original size because original size is bigger and position absolute.
        return {
            height: `${imgHeight}px`,
            width: `${imgWidth}px`,
            top,
            left,
        };
    }

    // If image is not zoomed in and image size is smaller than container size, display with original size based on offset and position absolute.
    if (zoomScale > 1) {
        return {
            height: `${imgHeight}px`,
            width: `${imgWidth}px`,
            top,
            left,
        };
    }

    // If image is bigger than container size, display full image in the screen with scaled size (fit by container size) and position absolute.
    // top, left offset should be different when displaying long or wide image.
    const scaledTop = `${Math.max((containerHeight - (imgHeight * zoomScale)) / 2, 0)}px`;
    const scaledLeft = `${Math.max((containerWidth - (imgWidth * zoomScale)) / 2, 0)}px`;
    return {
        height: `${imgHeight * zoomScale}px`,
        width: `${imgWidth * zoomScale}px`,
        top: scaledTop,
        left: scaledLeft,
    };
}

/**
 * Returns auto grow text input style
 *
 * @param {Number} width
 * @return {Object}
 */
function getAutoGrowTextInputStyle(width) {
    return {
        minWidth: 5,
        width,
    };
}

/**
 * Returns a style with backgroundColor and borderColor set to the same color
 *
 * @param {String} backgroundColor
 * @returns {Object}
 */
function getBackgroundAndBorderStyle(backgroundColor) {
    return {
        backgroundColor,
        borderColor: backgroundColor,
    };
}

/**
 * Returns a style with the specified backgroundColor
 *
 * @param {String} backgroundColor
 * @returns {Object}
 */
function getBackgroundColorStyle(backgroundColor) {
    return {
        backgroundColor,
    };
}

/**
 * Generate a style for the background color of the Badge
 *
 * @param {Boolean} success
 * @param {Boolean} error
 * @param {boolean} [isPressed=false]
 * @return {Object}
 */
function getBadgeColorStyle(success, error, isPressed = false) {
    if (success) {
        return isPressed ? styles.badgeSuccessPressed : styles.badgeSuccess;
    }
    if (error) {
        return isPressed ? styles.badgeDangerPressed : styles.badgeDanger;
    }
    return {};
}

/**
 * Generate a style for the background color of the button, based on its current state.
 *
 * @param {String} [buttonState] - One of {'default', 'hovered', 'pressed'}
 * @returns {Object}
 */
function getButtonBackgroundColorStyle(buttonState = CONST.BUTTON_STATES.DEFAULT) {
    switch (buttonState) {
        case CONST.BUTTON_STATES.ACTIVE:
            return {backgroundColor: themeColors.buttonHoveredBG};
        case CONST.BUTTON_STATES.PRESSED:
            return {backgroundColor: themeColors.buttonPressedBG};
        case CONST.BUTTON_STATES.DISABLED:
        case CONST.BUTTON_STATES.DEFAULT:
        default:
            return {};
    }
}

/**
 * Generate fill color of an icon based on its state.
 *
 * @param {String} [buttonState] - One of {'default', 'hovered', 'pressed'}
 * @returns {Object}
 */
function getIconFillColor(buttonState = CONST.BUTTON_STATES.DEFAULT) {
    switch (buttonState) {
        case CONST.BUTTON_STATES.ACTIVE:
            return themeColors.text;
        case CONST.BUTTON_STATES.PRESSED:
            return themeColors.heading;
        case CONST.BUTTON_STATES.COMPLETE:
            return themeColors.iconSuccessFill;
        case CONST.BUTTON_STATES.DEFAULT:
        case CONST.BUTTON_STATES.DISABLED:
        default:
            return themeColors.icon;
    }
}

/**
 * @param {Animated.Value} rotate
 * @param {Animated.Value} backgroundColor
 * @returns {Object}
 */
function getAnimatedFABStyle(rotate, backgroundColor) {
    return {
        transform: [{rotate}],
        backgroundColor,
    };
}

/**
 * @param {Number} width
 * @param {Number} height
 * @returns {Object}
 */
function getWidthAndHeightStyle(width, height) {
    return {
        width,
        height,
    };
}

/**
 * @param {Object} params
 * @returns {Object}
 */
function getModalPaddingStyles({
    shouldAddBottomSafeAreaPadding,
    shouldAddTopSafeAreaPadding,
    safeAreaPaddingTop,
    safeAreaPaddingBottom,
    safeAreaPaddingLeft,
    safeAreaPaddingRight,
    modalContainerStylePaddingTop,
    modalContainerStylePaddingBottom,
}) {
    return {
        paddingTop: shouldAddTopSafeAreaPadding
            ? (modalContainerStylePaddingTop || 0) + safeAreaPaddingTop
            : modalContainerStylePaddingTop || 0,
        paddingBottom: shouldAddBottomSafeAreaPadding
            ? (modalContainerStylePaddingBottom || 0) + safeAreaPaddingBottom
            : modalContainerStylePaddingBottom || 0,
        paddingLeft: safeAreaPaddingLeft || 0,
        paddingRight: safeAreaPaddingRight || 0,
    };
}

/**
 * Takes fontStyle and fontWeight and returns the correct fontFamily
 *
 * @param {Object} params
 * @returns {String}
 */
function getFontFamilyMonospace({fontStyle, fontWeight}) {
    const italic = fontStyle === 'italic' && fontFamily.MONOSPACE_ITALIC;
    const bold = fontWeight === 'bold' && fontFamily.MONOSPACE_BOLD;
    const italicBold = italic && bold && fontFamily.MONOSPACE_BOLD_ITALIC;

    return italicBold || bold || italic || fontFamily.MONOSPACE;
}

/**
 * Gives the width for Emoji picker Widget
 *
 * @param {Boolean} isSmallScreenWidth
 * @returns {String}
 */
function getEmojiPickerStyle(isSmallScreenWidth) {
    return {
        width: isSmallScreenWidth ? '100%' : CONST.EMOJI_PICKER_SIZE,
    };
}

/**
 * Get the random promo color and image for Login page
 *
 * @return {Object}
 */
function getLoginPagePromoStyle() {
    const promos = [
        {
            backgroundColor: colors.green,
            backgroundImageUri: `${CONST.CLOUDFRONT_URL}/images/homepage/brand-stories/freeplan_green.svg`,
        },
        {
            backgroundColor: colors.orange,
            backgroundImageUri: `${CONST.CLOUDFRONT_URL}/images/homepage/brand-stories/freeplan_orange.svg`,
        },
        {
            backgroundColor: colors.pink,
            backgroundImageUri: `${CONST.CLOUDFRONT_URL}/images/homepage/brand-stories/freeplan_pink.svg`,
        },
        {
            backgroundColor: colors.blue,
            backgroundImageUri: `${CONST.CLOUDFRONT_URL}/images/homepage/brand-stories/freeplan_blue.svg`,
        },
    ];
    return promos[_.random(0, 3)];
}

/**
 * Generate the styles for the ReportActionItem wrapper view.
 *
 * @param {Boolean} [isHovered]
 * @returns {Object}
 */
function getReportActionItemStyle(isHovered = false) {
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
function getMiniReportActionContextMenuWrapperStyle(isReportActionItemGrouped) {
    return {
        ...(isReportActionItemGrouped ? positioning.tn8 : positioning.tn4),
        ...positioning.r4,
        position: 'absolute',
        zIndex: 1,
    };
}

/**
 * @param {Boolean} isSmallScreenWidth
 * @returns {Object}
 */
function getPaymentMethodMenuWidth(isSmallScreenWidth) {
    const margin = 20;
    return {width: !isSmallScreenWidth ? variables.sideBarWidth - (margin * 2) : undefined};
}

/**
 * Parse styleParam and return Styles array
 * @param {Object|Object[]} styleParam
 * @returns {Object[]}
 */
function parseStyleAsArray(styleParam) {
    return _.isArray(styleParam) ? styleParam : [styleParam];
}

export {
    getSafeAreaPadding,
    getSafeAreaMargins,
    getNavigationDrawerStyle,
    getNavigationDrawerType,
    getNavigationModalCardStyle,
    getZoomCursorStyle,
    getZoomSizingStyle,
    getAutoGrowTextInputStyle,
    getBackgroundAndBorderStyle,
    getBackgroundColorStyle,
    getBadgeColorStyle,
    getButtonBackgroundColorStyle,
    getIconFillColor,
    getAnimatedFABStyle,
    getWidthAndHeightStyle,
    getModalPaddingStyles,
    getFontFamilyMonospace,
    getEmojiPickerStyle,
    getLoginPagePromoStyle,
    getReportActionItemStyle,
    getMiniReportActionContextMenuWrapperStyle,
    getPaymentMethodMenuWidth,
    parseStyleAsArray,
};
