import _ from 'underscore';
import CONST from '../CONST';
import fontFamily from './fontFamily';
import themeColors from './themes/default';
import variables from './variables';
import colors from './colors';
import positioning from './utilities/positioning';
import styles from './styles';

/**
 * Return the style size from an avatar size constant
 *
 * @param {String} size
 * @returns {Number}
 */
function getAvatarSize(size) {
    const AVATAR_SIZES = {
        [CONST.AVATAR_SIZE.DEFAULT]: variables.avatarSizeNormal,
        [CONST.AVATAR_SIZE.SMALL_SUBSCRIPT]: variables.avatarSizeSmallSubscript,
        [CONST.AVATAR_SIZE.SUBSCRIPT]: variables.avatarSizeSubscript,
        [CONST.AVATAR_SIZE.SMALL]: variables.avatarSizeSmall,
        [CONST.AVATAR_SIZE.SMALLER]: variables.avatarSizeSmaller,
        [CONST.AVATAR_SIZE.LARGE]: variables.avatarSizeLarge,
    };
    return AVATAR_SIZES[size];
}

/**
 * Return the style from an avatar size constant
 *
 * @param {String} size
 * @returns {Object}
 */
function getAvatarStyle(size) {
    const avatarSize = getAvatarSize(size);
    return {
        height: avatarSize,
        width: avatarSize,
        borderRadius: avatarSize,
        backgroundColor: themeColors.offline,
    };
}

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
        if (zoomScale >= 1) {
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
 * Converts a color in hexadecimal notation into RGB notation.
 *
 * @param {String} hexadecimal A color in hexadecimal notation.
 * @returns {Array} `null` if the input color is not in hexadecimal notation. Otherwise, the RGB components of the input color.
 */
function hexadecimalToRGBComponents(hexadecimal) {
    const components = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexadecimal);

    if (components !== null) {
        return _.map(components.slice(1), component => parseInt(component, 16));
    }

    return null;
}

/**
 * Returns a background color with opacity style
 *
 * @param {String} backgroundColor
 * @param {number} opacity
 * @returns {Object}
 */
function getBackgroundColorWithOpacityStyle(backgroundColor, opacity) {
    const result = hexadecimalToRGBComponents(backgroundColor);
    if (result !== null) {
        return {
            backgroundColor: `rgba(${result[0]}, ${result[1]}, ${result[2]}, ${opacity})`,
        };
    }
    return {};
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
 * @param {Boolean} isMenuIcon - whether this icon is apart of a list
 * @returns {Object}
 */
function getIconFillColor(buttonState = CONST.BUTTON_STATES.DEFAULT, isMenuIcon = false) {
    switch (buttonState) {
        case CONST.BUTTON_STATES.ACTIVE:
        case CONST.BUTTON_STATES.PRESSED:
            return themeColors.iconHovered;
        case CONST.BUTTON_STATES.COMPLETE:
            return themeColors.iconSuccessFill;
        case CONST.BUTTON_STATES.DEFAULT:
        case CONST.BUTTON_STATES.DISABLED:
        default:
            if (isMenuIcon) {
                return themeColors.iconMenu;
            }
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
    shouldAddBottomSafeAreaMargin,
    shouldAddTopSafeAreaMargin,
    shouldAddBottomSafeAreaPadding,
    shouldAddTopSafeAreaPadding,
    safeAreaPaddingTop,
    safeAreaPaddingBottom,
    safeAreaPaddingLeft,
    safeAreaPaddingRight,
    modalContainerStyleMarginTop,
    modalContainerStyleMarginBottom,
    modalContainerStylePaddingTop,
    modalContainerStylePaddingBottom,
}) {
    return {
        marginTop: (modalContainerStyleMarginTop || 0) + (shouldAddTopSafeAreaMargin ? safeAreaPaddingTop : 0),
        marginBottom: (modalContainerStyleMarginBottom || 0) + (shouldAddBottomSafeAreaMargin ? safeAreaPaddingBottom : 0),
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
    if (isSmallScreenWidth) {
        return {
            width: '100%',
        };
    }
    return {
        width: CONST.EMOJI_PICKER_SIZE.WIDTH,
        height: CONST.EMOJI_PICKER_SIZE.HEIGHT,
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
        {
            backgroundColor: colors.floralwhite,
            backgroundImageUri: `${CONST.CLOUDFRONT_URL}/images/homepage/brand-stories/cpa-card.svg`,
            redirectUri: `${CONST.USE_EXPENSIFY_URL}/accountants`,
        },
    ];
    return promos[_.random(0, 4)];
}

/**
 * Generate the styles for the ReportActionItem wrapper view.
 *
 * @param {Boolean} [isHovered]
 * @param {Boolean} [isLoading]
 * @returns {Object}
 */
function getReportActionItemStyle(isHovered = false, isLoading = false) {
    return {
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: isHovered
            ? themeColors.hoverComponentBG

            // Warning: Setting this to a non-transparent color will cause unread indicator to break on Android
            : colors.transparent,
        opacity: isLoading ? 0.5 : 1,
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
 * Converts a color in RGBA notation to an equivalent color in RGB notation.
 *
 * @param {Array} foregroundRGB The three components of the foreground color in RGB notation.
 * @param {Array} backgroundRGB The three components of the background color in RGB notation.
 * @param {number} opacity The desired opacity of the foreground color.
 * @returns {Array} The RGB components of the RGBA color converted to RGB.
 */
function convertRGBAToRGB(foregroundRGB, backgroundRGB, opacity) {
    const [foregroundR, foregroundG, foregroundB] = foregroundRGB;
    const [backgroundR, backgroundG, backgroundB] = backgroundRGB;

    return [
        ((1 - opacity) * backgroundR) + (opacity * foregroundR),
        ((1 - opacity) * backgroundG) + (opacity * foregroundG),
        ((1 - opacity) * backgroundB) + (opacity * foregroundB),
    ];
}

/**
 * Denormalizes the three components of a color in RGB notation.
 *
 * @param {number} r The first normalized component of a color in RGB notation.
 * @param {number} g The second normalized component of a color in RGB notation.
 * @param {number} b The third normalized component of a color in RGB notation.
 * @returns {Array} An array with the three denormalized components of a color in RGB notation.
 */
function denormalizeRGB(r, g, b) {
    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}

/**
 * Normalizes the three components of a color in RGB notation.
 *
 * @param {number} r The first denormalized component of a color in RGB notation.
 * @param {number} g The second denormalized component of a color in RGB notation.
 * @param {number} b The third denormalized component of a color in RGB notation.
 * @returns {Array} An array with the three normalized components of a color in RGB notation.
 */
function normalizeRGB(r, g, b) {
    return [r / 255, g / 255, b / 255];
}

/**
 * Determines the theme color for a modal based on the app's background color,
 * the modal's backdrop, and the backdrop's opacity.
 *
 * @returns {String} The theme color as an RGB value.
 */
function getThemeBackgroundColor() {
    const backdropOpacity = variables.modalFullscreenBackdropOpacity;

    const [backgroundR, backgroundG, backgroundB] = hexadecimalToRGBComponents(themeColors.appBG);
    const [backdropR, backdropG, backdropB] = hexadecimalToRGBComponents(themeColors.modalBackdrop);
    const normalizedBackdropRGB = normalizeRGB(backdropR, backdropG, backdropB);
    const normalizedBackgroundRGB = normalizeRGB(
        backgroundR,
        backgroundG,
        backgroundB,
    );
    const themeRGBNormalized = convertRGBAToRGB(
        normalizedBackdropRGB,
        normalizedBackgroundRGB,
        backdropOpacity,
    );
    const themeRGB = denormalizeRGB(...themeRGBNormalized);

    return `rgb(${themeRGB.join(', ')})`;
}

/**
 * Parse styleParam and return Styles array
 * @param {Object|Object[]} styleParam
 * @returns {Object[]}
 */
function parseStyleAsArray(styleParam) {
    return _.isArray(styleParam) ? styleParam : [styleParam];
}

/**
 * Receives any number of object or array style objects and returns them all as an array
 * @param {Object|Object[]} allStyles
 * @return {Object[]}
 */
function combineStyles(...allStyles) {
    let finalStyles = [];
    _.each(allStyles, (style) => {
        finalStyles = finalStyles.concat(parseStyleAsArray(style));
    });
    return finalStyles;
}

/**
 * Get variable padding-left as style
 * @param {Number} paddingLeft
 * @returns {Object}
 */
function getPaddingLeft(paddingLeft) {
    return {
        paddingLeft,
    };
}

/**
 * Android only - convert RTL text to a LTR text using Unicode controls.
 * https://www.w3.org/International/questions/qa-bidi-unicode-controls
 * @param {String} text
 * @returns {String}
 */
function convertToLTR(text) {
    return `\u2066${text}`;
}

/**
 * Checks to see if the iOS device has safe areas or not
 *
 * @param {Number} windowWidth
 * @param {Number} windowHeight
 * @returns {Boolean}
 */
function hasSafeAreas(windowWidth, windowHeight) {
    const heightsIphonesWithNotches = [812, 896, 844, 926];
    return _.contains(heightsIphonesWithNotches, windowHeight) || _.contains(heightsIphonesWithNotches, windowWidth);
}

/**
 * Get variable keyboard height as style
 * @param {Number} keyboardHeight
 * @returns {Object}
 */
function getHeight(keyboardHeight) {
    return {
        height: keyboardHeight,
    };
}

/**
 * Return style for opacity animation.
 *
 * @param {Animated.Value} fadeAnimation
 * @returns {Object}
 */
function fade(fadeAnimation) {
    return {
        opacity: fadeAnimation,
    };
}

/**
 * Return width for keyboard shortcuts modal.
 *
 * @param {Boolean} isSmallScreenWidth
 * @returns {Object}
 */
function getKeyboardShortcutsModalWidth(isSmallScreenWidth) {
    if (isSmallScreenWidth) {
        return {maxWidth: '100%'};
    }
    return {maxWidth: 600};
}

export {
    getAvatarSize,
    getAvatarStyle,
    getSafeAreaPadding,
    getSafeAreaMargins,
    getNavigationDrawerStyle,
    getNavigationDrawerType,
    getZoomCursorStyle,
    getZoomSizingStyle,
    getAutoGrowTextInputStyle,
    getBackgroundAndBorderStyle,
    getBackgroundColorStyle,
    getBackgroundColorWithOpacityStyle,
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
    getKeyboardShortcutsModalWidth,
    getPaymentMethodMenuWidth,
    getThemeBackgroundColor as getThemeColor,
    parseStyleAsArray,
    combineStyles,
    getPaddingLeft,
    convertToLTR,
    hasSafeAreas,
    getHeight,
    fade,
};
