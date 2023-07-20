import _ from 'underscore';
import CONST from '../CONST';
import fontFamily from './fontFamily';
import themeColors from './themes/default';
import variables from './variables';
import colors from './colors';
import positioning from './utilities/positioning';
import styles from './styles';
import spacing from './utilities/spacing';
import * as UserUtils from '../libs/UserUtils';
import * as Browser from '../libs/Browser';
import cursor from './utilities/cursor';

const workspaceColorOptions = [
    {backgroundColor: colors.blue200, fill: colors.blue700},
    {backgroundColor: colors.blue400, fill: colors.blue800},
    {backgroundColor: colors.blue700, fill: colors.blue200},
    {backgroundColor: colors.green200, fill: colors.green700},
    {backgroundColor: colors.green400, fill: colors.green800},
    {backgroundColor: colors.green700, fill: colors.green200},
    {backgroundColor: colors.yellow200, fill: colors.yellow700},
    {backgroundColor: colors.yellow400, fill: colors.yellow800},
    {backgroundColor: colors.yellow700, fill: colors.yellow200},
    {backgroundColor: colors.tangerine200, fill: colors.tangerine700},
    {backgroundColor: colors.tangerine400, fill: colors.tangerine800},
    {backgroundColor: colors.tangerine700, fill: colors.tangerine400},
    {backgroundColor: colors.pink200, fill: colors.pink700},
    {backgroundColor: colors.pink400, fill: colors.pink800},
    {backgroundColor: colors.pink700, fill: colors.pink200},
    {backgroundColor: colors.ice200, fill: colors.ice700},
    {backgroundColor: colors.ice400, fill: colors.ice800},
    {backgroundColor: colors.ice700, fill: colors.ice200},
];

const avatarBorderSizes = {
    [CONST.AVATAR_SIZE.SMALL_SUBSCRIPT]: variables.componentBorderRadiusSmall,
    [CONST.AVATAR_SIZE.MID_SUBSCRIPT]: variables.componentBorderRadiusSmall,
    [CONST.AVATAR_SIZE.SUBSCRIPT]: variables.componentBorderRadiusMedium,
    [CONST.AVATAR_SIZE.SMALLER]: variables.componentBorderRadiusMedium,
    [CONST.AVATAR_SIZE.SMALL]: variables.componentBorderRadiusMedium,
    [CONST.AVATAR_SIZE.HEADER]: variables.componentBorderRadiusMedium,
    [CONST.AVATAR_SIZE.DEFAULT]: variables.componentBorderRadiusNormal,
    [CONST.AVATAR_SIZE.MEDIUM]: variables.componentBorderRadiusLarge,
    [CONST.AVATAR_SIZE.LARGE]: variables.componentBorderRadiusLarge,
    [CONST.AVATAR_SIZE.LARGE_BORDERED]: variables.componentBorderRadiusRounded,
    [CONST.AVATAR_SIZE.SMALL_NORMAL]: variables.componentBorderRadiusMedium,
};

const avatarSizes = {
    [CONST.AVATAR_SIZE.DEFAULT]: variables.avatarSizeNormal,
    [CONST.AVATAR_SIZE.SMALL_SUBSCRIPT]: variables.avatarSizeSmallSubscript,
    [CONST.AVATAR_SIZE.MID_SUBSCRIPT]: variables.avatarSizeMidSubscript,
    [CONST.AVATAR_SIZE.SUBSCRIPT]: variables.avatarSizeSubscript,
    [CONST.AVATAR_SIZE.SMALL]: variables.avatarSizeSmall,
    [CONST.AVATAR_SIZE.SMALLER]: variables.avatarSizeSmaller,
    [CONST.AVATAR_SIZE.LARGE]: variables.avatarSizeLarge,
    [CONST.AVATAR_SIZE.MEDIUM]: variables.avatarSizeMedium,
    [CONST.AVATAR_SIZE.LARGE_BORDERED]: variables.avatarSizeLargeBordered,
    [CONST.AVATAR_SIZE.HEADER]: variables.avatarSizeHeader,
    [CONST.AVATAR_SIZE.MENTION_ICON]: variables.avatarSizeMentionIcon,
    [CONST.AVATAR_SIZE.SMALL_NORMAL]: variables.avatarSizeSmallNormal,
};

const emptyAvatarStyles = {
    [CONST.AVATAR_SIZE.SMALL]: styles.emptyAvatarSmall,
    [CONST.AVATAR_SIZE.MEDIUM]: styles.emptyAvatarMedium,
    [CONST.AVATAR_SIZE.LARGE]: styles.emptyAvatarLarge,
};

/**
 * Return the style size from an avatar size constant
 *
 * @param {String} size
 * @returns {Number}
 */
function getAvatarSize(size) {
    return avatarSizes[size];
}

/**
 * Return the height of magic code input container
 *
 * @returns {Object}
 */
function getHeightOfMagicCodeInput() {
    return {height: styles.magicCodeInputContainer.minHeight - styles.textInputContainer.borderBottomWidth};
}

/**
 * Return the style from an empty avatar size constant
 *
 * @param {String} size
 * @returns {Object}
 */
function getEmptyAvatarStyle(size) {
    return emptyAvatarStyles[size];
}

/**
 * Return the width style from an avatar size constant
 *
 * @param {String} size
 * @returns {Object}
 */
function getAvatarWidthStyle(size) {
    const avatarSize = getAvatarSize(size);
    return {
        width: avatarSize,
    };
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
 * Get Font size of '+1' text on avatar overlay
 * @param {String} size
 * @returns {Object}
 */
function getAvatarExtraFontSizeStyle(size) {
    const AVATAR_SIZES = {
        [CONST.AVATAR_SIZE.DEFAULT]: variables.fontSizeNormal,
        [CONST.AVATAR_SIZE.SMALL_SUBSCRIPT]: variables.fontSizeExtraSmall,
        [CONST.AVATAR_SIZE.MID_SUBSCRIPT]: variables.fontSizeExtraSmall,
        [CONST.AVATAR_SIZE.SUBSCRIPT]: variables.fontSizeExtraSmall,
        [CONST.AVATAR_SIZE.SMALL]: variables.fontSizeSmall,
        [CONST.AVATAR_SIZE.SMALLER]: variables.fontSizeExtraSmall,
        [CONST.AVATAR_SIZE.LARGE]: variables.fontSizeXLarge,
        [CONST.AVATAR_SIZE.MEDIUM]: variables.fontSizeMedium,
        [CONST.AVATAR_SIZE.LARGE_BORDERED]: variables.fontSizeXLarge,
    };
    return {
        fontSize: AVATAR_SIZES[size],
    };
}

/**
 * Get Bordersize of Avatar based on avatar size
 * @param {String} size
 * @returns {Object}
 */
function getAvatarBorderWidth(size) {
    const AVATAR_SIZES = {
        [CONST.AVATAR_SIZE.DEFAULT]: 3,
        [CONST.AVATAR_SIZE.SMALL_SUBSCRIPT]: 1,
        [CONST.AVATAR_SIZE.MID_SUBSCRIPT]: 2,
        [CONST.AVATAR_SIZE.SUBSCRIPT]: 2,
        [CONST.AVATAR_SIZE.SMALL]: 2,
        [CONST.AVATAR_SIZE.SMALLER]: 2,
        [CONST.AVATAR_SIZE.LARGE]: 4,
        [CONST.AVATAR_SIZE.MEDIUM]: 3,
        [CONST.AVATAR_SIZE.LARGE_BORDERED]: 4,
    };
    return {
        borderWidth: AVATAR_SIZES[size],
    };
}

/**
 * Return the border radius for an avatar
 *
 * @param {String} size
 * @param {String} type
 * @returns {Object}
 */
function getAvatarBorderRadius(size, type) {
    if (type === CONST.ICON_TYPE_WORKSPACE) {
        return {borderRadius: avatarBorderSizes[size]};
    }

    // Default to rounded border
    return {borderRadius: variables.buttonBorderRadius};
}

/**
 * Return the border style for an avatar
 *
 * @param {String} size
 * @param {String} type
 * @returns {Object}
 */
function getAvatarBorderStyle(size, type) {
    return {
        overflow: 'hidden',
        ...getAvatarBorderRadius(size, type),
    };
}

/**
 * Helper method to return old dot default avatar associated with login
 *
 * @param {String} [workspaceName]
 * @returns {Object}
 */
function getDefaultWorkspaceAvatarColor(workspaceName) {
    const colorHash = UserUtils.hashText(workspaceName.trim(), workspaceColorOptions.length);

    return workspaceColorOptions[colorHash];
}

/**
 * Takes safe area insets and returns padding to use for a View
 *
 * @param {Object} insets
 * @param {Number} [insetsPercentage] - Percentage of the insets to use for sides and bottom padding
 * @returns {Object}
 */
function getSafeAreaPadding(insets, insetsPercentage = variables.safeInsertPercentage) {
    return {
        paddingTop: insets.top,
        paddingBottom: insets.bottom * insetsPercentage,
        paddingLeft: insets.left * insetsPercentage,
        paddingRight: insets.right * insetsPercentage,
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
 * @param {Boolean} isZoomed
 * @param {Boolean} isDragging
 * @return {Object}
 */
function getZoomCursorStyle(isZoomed, isDragging) {
    if (!isZoomed) {
        return styles.cursorZoomIn;
    }

    return isDragging ? styles.cursorGrabbing : styles.cursorZoomOut;
}

/**
 * @param {Boolean} isZoomed
 * @param {Number} imgWidth
 * @param {Number} imgHeight
 * @param {Number} zoomScale
 * @param {Number} containerHeight
 * @param {Number} containerWidth
 * @param {Boolean} isLoading
 * @returns {Object | undefined}
 */
function getZoomSizingStyle(isZoomed, imgWidth, imgHeight, zoomScale, containerHeight, containerWidth, isLoading) {
    // Hide image until finished loading to prevent showing preview with wrong dimensions
    if (isLoading || imgWidth === 0 || imgHeight === 0) {
        return undefined;
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
    const scaledTop = `${Math.max((containerHeight - imgHeight * zoomScale) / 2, 0)}px`;
    const scaledLeft = `${Math.max((containerWidth - imgWidth * zoomScale) / 2, 0)}px`;
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
function getWidthStyle(width) {
    return {
        width,
    };
}

/**
 * Returns auto grow height text input style
 *
 * @param {Number} textInputHeight
 * @param {Number} maxHeight
 * @returns {Object}
 */
function getAutoGrowHeightInputStyle(textInputHeight, maxHeight) {
    if (textInputHeight > maxHeight) {
        return {
            ...styles.pr0,
            ...styles.overflowAuto,
        };
    }

    return {
        ...styles.pr0,
        ...styles.overflowHidden,
        // maxHeight is not of the input only but the of the whole input container
        // which also includes the top padding and bottom border
        height: maxHeight - styles.textInputMultilineContainer.paddingTop - styles.textInputContainer.borderBottomWidth,
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
 * Returns a style for text color
 *
 * @param {String} color
 * @returns {Object}
 */
function getTextColorStyle(color) {
    return {
        color,
    };
}

/**
 * Returns a style with the specified borderColor
 *
 * @param {String} borderColor
 * @returns {Object}
 */
function getBorderColorStyle(borderColor) {
    return {
        borderColor,
    };
}

/**
 * Returns the width style for the wordmark logo on the sign in page
 *
 * @param {String} environment
 * @param {Boolean} isSmallScreenWidth
 * @returns {Object}
 */
function getSignInWordmarkWidthStyle(environment, isSmallScreenWidth) {
    if (environment === CONST.ENVIRONMENT.DEV) {
        return isSmallScreenWidth ? {width: variables.signInLogoWidthPill} : {width: variables.signInLogoWidthLargeScreenPill};
    }
    if (environment === CONST.ENVIRONMENT.STAGING) {
        return isSmallScreenWidth ? {width: variables.signInLogoWidthPill} : {width: variables.signInLogoWidthLargeScreenPill};
    }
    if (environment === CONST.ENVIRONMENT.PRODUCTION) {
        return isSmallScreenWidth ? {width: variables.signInLogoWidth} : {width: variables.signInLogoWidthLargeScreen};
    }
    return isSmallScreenWidth ? {width: variables.signInLogoWidthPill} : {width: variables.signInLogoWidthLargeScreenPill};
}

/**
 * Converts a color in hexadecimal notation into RGB notation.
 *
 * @param {String} hexadecimal A color in hexadecimal notation.
 * @returns {Array} `undefined` if the input color is not in hexadecimal notation. Otherwise, the RGB components of the input color.
 */
function hexadecimalToRGBArray(hexadecimal) {
    const components = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexadecimal);

    if (components === null) {
        return undefined;
    }

    return _.map(components.slice(1), (component) => parseInt(component, 16));
}

/**
 * Returns a background color with opacity style
 *
 * @param {String} backgroundColor
 * @param {number} opacity
 * @returns {Object}
 */
function getBackgroundColorWithOpacityStyle(backgroundColor, opacity) {
    const result = hexadecimalToRGBArray(backgroundColor);
    if (result !== undefined) {
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
 * @param {boolean} [isAdHoc=false]
 * @return {Object}
 */
function getBadgeColorStyle(success, error, isPressed = false, isAdHoc = false) {
    if (success) {
        if (isAdHoc) {
            return isPressed ? styles.badgeAdHocSuccessPressed : styles.badgeAdHocSuccess;
        }
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
 * @param {Boolean} isMenuItem - whether this button is apart of a list
 * @returns {Object}
 */
function getButtonBackgroundColorStyle(buttonState = CONST.BUTTON_STATES.DEFAULT, isMenuItem = false) {
    switch (buttonState) {
        case CONST.BUTTON_STATES.PRESSED:
            return {backgroundColor: themeColors.buttonPressedBG};
        case CONST.BUTTON_STATES.ACTIVE:
            return isMenuItem ? {backgroundColor: themeColors.border} : {backgroundColor: themeColors.buttonHoveredBG};
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
 * @param {Number | null} height
 * @returns {Object}
 */
function getWidthAndHeightStyle(width, height = null) {
    return {
        width,
        height: height != null ? height : width,
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
    insets,
}) {
    // use fallback value for safeAreaPaddingBottom to keep padding bottom consistent with padding top.
    // More info: issue #17376
    const safeAreaPaddingBottomWithFallback = insets.bottom === 0 ? modalContainerStylePaddingTop || 0 : safeAreaPaddingBottom;
    return {
        marginTop: (modalContainerStyleMarginTop || 0) + (shouldAddTopSafeAreaMargin ? safeAreaPaddingTop : 0),
        marginBottom: (modalContainerStyleMarginBottom || 0) + (shouldAddBottomSafeAreaMargin ? safeAreaPaddingBottomWithFallback : 0),
        paddingTop: shouldAddTopSafeAreaPadding ? (modalContainerStylePaddingTop || 0) + safeAreaPaddingTop : modalContainerStylePaddingTop || 0,
        paddingBottom: shouldAddBottomSafeAreaPadding ? (modalContainerStylePaddingBottom || 0) + safeAreaPaddingBottomWithFallback : modalContainerStylePaddingBottom || 0,
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
            width: CONST.SMALL_EMOJI_PICKER_SIZE.WIDTH,
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
            backgroundColor: colors.ivory,
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
            : // Warning: Setting this to a non-transparent color will cause unread indicator to break on Android
              colors.transparent,
        opacity: isLoading ? 0.5 : 1,
        ...styles.cursorInitial,
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
        ...styles.cursorDefault,
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
    return {width: !isSmallScreenWidth ? variables.sideBarWidth - margin * 2 : undefined};
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
    const [foregroundRed, foregroundGreen, foregroundBlue] = foregroundRGB;
    const [backgroundRed, backgroundGreen, backgroundBlue] = backgroundRGB;

    return [(1 - opacity) * backgroundRed + opacity * foregroundRed, (1 - opacity) * backgroundGreen + opacity * foregroundGreen, (1 - opacity) * backgroundBlue + opacity * foregroundBlue];
}

/**
 * Converts three unit values to the three components of a color in RGB notation.
 *
 * @param {number} red A unit value representing the first component of a color in RGB notation.
 * @param {number} green A unit value representing the second component of a color in RGB notation.
 * @param {number} blue A unit value representing the third component of a color in RGB notation.
 * @returns {Array} An array with the three components of a color in RGB notation.
 */
function convertUnitValuesToRGB(red, green, blue) {
    return [Math.floor(red * 255), Math.floor(green * 255), Math.floor(blue * 255)];
}

/**
 * Converts the three components of a color in RGB notation to three unit values.
 *
 * @param {number} red The first component of a color in RGB notation.
 * @param {number} green The second component of a color in RGB notation.
 * @param {number} blue The third component of a color in RGB notation.
 * @returns {Array} An array with three unit values representing the components of a color in RGB notation.
 */
function convertRGBToUnitValues(red, green, blue) {
    return [red / 255, green / 255, blue / 255];
}

/**
 * Matches an RGBA or RGB color value and extracts the color components.
 *
 * @param {string} color - The RGBA or RGB color value to match and extract components from.
 * @returns {Array} An array containing the extracted color components [red, green, blue, alpha].
 * Returns null if the input string does not match the pattern.
 */
function extractValuesFromRGB(color) {
    const rgbaPattern = /rgba?\((?<r>[.\d]+)[, ]+(?<g>[.\d]+)[, ]+(?<b>[.\d]+)(?:\s?[,/]\s?(?<a>[.\d]+%?))?\)$/i;
    const matchRGBA = color.match(rgbaPattern);
    if (matchRGBA) {
        const [, red, green, blue, alpha] = matchRGBA;
        return [parseInt(red, 10), parseInt(green, 10), parseInt(blue, 10), alpha ? parseFloat(alpha) : 1];
    }

    return null;
}

/**
 * Determines the theme color for a modal based on the app's background color,
 * the modal's backdrop, and the backdrop's opacity.
 *
 * @param {String} bgColor - theme background color
 * @returns {String} The theme color as an RGB value.
 */
function getThemeBackgroundColor(bgColor = themeColors.appBG) {
    const backdropOpacity = variables.modalFullscreenBackdropOpacity;

    const [backgroundRed, backgroundGreen, backgroundBlue] = extractValuesFromRGB(bgColor) || hexadecimalToRGBArray(bgColor);
    const [backdropRed, backdropGreen, backdropBlue] = hexadecimalToRGBArray(themeColors.modalBackdrop);
    const normalizedBackdropRGB = convertRGBToUnitValues(backdropRed, backdropGreen, backdropBlue);
    const normalizedBackgroundRGB = convertRGBToUnitValues(backgroundRed, backgroundGreen, backgroundBlue);
    const themeRGBNormalized = convertRGBAToRGB(normalizedBackdropRGB, normalizedBackgroundRGB, backdropOpacity);
    const themeRGB = convertUnitValuesToRGB(...themeRGBNormalized);

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
 * Parse style function and return Styles object
 * @param {Object|Object[]|Function} style
 * @param {Object} state
 * @returns {Object[]}
 */
function parseStyleFromFunction(style, state) {
    const functionAppliedStyle = _.isFunction(style) ? style(state) : style;
    return parseStyleAsArray(functionAppliedStyle);
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
 * Get height as style
 * @param {Number} height
 * @returns {Object}
 */
function getHeight(height) {
    return {
        height,
    };
}

/**
 * Get minimum height as style
 * @param {Number} minHeight
 * @returns {Object}
 */
function getMinimumHeight(minHeight) {
    return {
        minHeight,
    };
}

/**
 * Get maximum width as style
 * @param {Number} maxWidth
 * @returns {Object}
 */
function getMaximumWidth(maxWidth) {
    return {
        maxWidth,
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

/**
 * @param {Object} params
 * @param {Boolean} params.isHovered
 * @param {Boolean} params.isPressed
 * @param {Boolean} params.isInReportAction
 * @param {Boolean} params.shouldUseCardBackground
 * @returns {Object}
 */
function getHorizontalStackedAvatarBorderStyle({isHovered, isPressed, isInReportAction = false, shouldUseCardBackground = false}) {
    let backgroundColor = shouldUseCardBackground ? themeColors.cardBG : themeColors.appBG;

    if (isHovered) {
        backgroundColor = isInReportAction ? themeColors.highlightBG : themeColors.border;
    }

    if (isPressed) {
        backgroundColor = isInReportAction ? themeColors.highlightBG : themeColors.buttonPressedBG;
    }

    return {
        backgroundColor,
        borderColor: backgroundColor,
    };
}

/**
 * Get computed avatar styles based on position and border size
 * @param {Number} index
 * @param {Number} overlapSize
 * @param {Number} borderWidth
 * @param {Number} borderRadius
 * @returns {Object}
 */
function getHorizontalStackedAvatarStyle(index, overlapSize, borderWidth, borderRadius) {
    return {
        left: -(overlapSize * index),
        borderRadius,
        borderWidth,
        zIndex: index + 2,
    };
}

/**
 * Get computed avatar styles of '+1' overlay based on size
 * @param {Object} oneAvatarSize
 * @param {Numer} oneAvatarBorderWidth
 * @returns {Object}
 */
function getHorizontalStackedOverlayAvatarStyle(oneAvatarSize, oneAvatarBorderWidth) {
    return {
        borderWidth: oneAvatarBorderWidth,
        borderRadius: oneAvatarSize.width,
        left: -(oneAvatarSize.width * 2 + oneAvatarBorderWidth * 2),
        zIndex: 6,
        borderStyle: 'solid',
    };
}

/**
 * @param {Number} safeAreaPaddingBottom
 * @returns {Object}
 */
function getErrorPageContainerStyle(safeAreaPaddingBottom = 0) {
    return {
        backgroundColor: themeColors.componentBG,
        paddingBottom: 40 + safeAreaPaddingBottom,
    };
}

/**
 * Gets the correct size for the empty state background image based on screen dimensions
 *
 * @param {Boolean} isSmallScreenWidth
 * @returns {Object}
 */
function getReportWelcomeBackgroundImageStyle(isSmallScreenWidth) {
    if (isSmallScreenWidth) {
        return {
            height: CONST.EMPTY_STATE_BACKGROUND.SMALL_SCREEN.IMAGE_HEIGHT,
            width: '100%',
            position: 'absolute',
        };
    }

    return {
        height: CONST.EMPTY_STATE_BACKGROUND.WIDE_SCREEN.IMAGE_HEIGHT,
        width: '100%',
        position: 'absolute',
    };
}

/**
 * Gets the correct top margin size for the chat welcome message based on screen dimensions
 *
 * @param {Boolean} isSmallScreenWidth
 * @returns {Object}
 */
function getReportWelcomeTopMarginStyle(isSmallScreenWidth) {
    if (isSmallScreenWidth) {
        return {
            marginTop: CONST.EMPTY_STATE_BACKGROUND.SMALL_SCREEN.VIEW_HEIGHT,
        };
    }

    return {
        marginTop: CONST.EMPTY_STATE_BACKGROUND.WIDE_SCREEN.VIEW_HEIGHT,
    };
}

/**
 * Returns fontSize style
 *
 * @param {Number} fontSize
 * @returns {Object}
 */
function getFontSizeStyle(fontSize) {
    return {
        fontSize,
    };
}

/**
 * Returns lineHeight style
 *
 * @param {Number} lineHeight
 * @returns {Object}
 */
function getLineHeightStyle(lineHeight) {
    return {
        lineHeight,
    };
}

/**
 * Gets the correct size for the empty state container based on screen dimensions
 *
 * @param {Boolean} isSmallScreenWidth
 * @returns {Object}
 */
function getReportWelcomeContainerStyle(isSmallScreenWidth) {
    if (isSmallScreenWidth) {
        return {
            minHeight: CONST.EMPTY_STATE_BACKGROUND.SMALL_SCREEN.CONTAINER_MINHEIGHT,
            display: 'flex',
            justifyContent: 'space-between',
        };
    }

    return {
        minHeight: CONST.EMPTY_STATE_BACKGROUND.WIDE_SCREEN.CONTAINER_MINHEIGHT,
        display: 'flex',
        justifyContent: 'space-between',
    };
}

/**
 * Gets styles for AutoCompleteSuggestion row
 *
 * @param {Number} highlightedEmojiIndex
 * @param {Number} rowHeight
 * @param {Boolean} hovered
 * @param {Number} currentEmojiIndex
 * @returns {Object}
 */
function getAutoCompleteSuggestionItemStyle(highlightedEmojiIndex, rowHeight, hovered, currentEmojiIndex) {
    let backgroundColor;

    if (currentEmojiIndex === highlightedEmojiIndex) {
        backgroundColor = themeColors.activeComponentBG;
    } else if (hovered) {
        backgroundColor = themeColors.hoverComponentBG;
    }

    return [
        {
            height: rowHeight,
            justifyContent: 'center',
        },
        backgroundColor
            ? {
                  backgroundColor,
              }
            : {},
    ];
}

/**
 * Gets the correct position for auto complete suggestion container
 *
 * @param {Number} itemsHeight
 * @param {Boolean} shouldIncludeReportRecipientLocalTimeHeight
 * @returns {Object}
 */
function getAutoCompleteSuggestionContainerStyle(itemsHeight, shouldIncludeReportRecipientLocalTimeHeight) {
    'worklet';

    const optionalPadding = shouldIncludeReportRecipientLocalTimeHeight ? CONST.RECIPIENT_LOCAL_TIME_HEIGHT : 0;
    const padding = CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTER_PADDING - optionalPadding;
    const borderWidth = 2;
    const height = itemsHeight + 2 * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTER_INNER_PADDING + borderWidth;

    // The suggester is positioned absolutely within the component that includes the input and RecipientLocalTime view (for non-expanded mode only). To position it correctly,
    // we need to shift it by the suggester's height plus its padding and, if applicable, the height of the RecipientLocalTime view.
    return {
        overflow: 'hidden',
        top: -(height + padding),
        height,
    };
}

/**
 * Select the correct color for text.
 * @param {Boolean} isColored
 * @returns {String | null}
 */
const getColoredBackgroundStyle = (isColored) => ({backgroundColor: isColored ? colors.blueLink : null});

function getEmojiReactionBubbleStyle(isHovered, hasUserReacted, isContextMenu = false) {
    let backgroundColor = themeColors.border;

    if (isHovered) {
        backgroundColor = themeColors.buttonHoveredBG;
    }

    if (hasUserReacted) {
        backgroundColor = themeColors.reactionActiveBackground;
    }

    if (isContextMenu) {
        return {
            paddingVertical: 3,
            paddingHorizontal: 12,
            backgroundColor,
        };
    }

    return {
        paddingVertical: 2,
        paddingHorizontal: 8,
        backgroundColor,
    };
}

function getEmojiReactionBubbleTextStyle(isContextMenu = false) {
    if (isContextMenu) {
        return {
            fontSize: 17,
            lineHeight: 24,
        };
    }

    return {
        fontSize: 15,
        lineHeight: 22,
    };
}

function getEmojiReactionCounterTextStyle(hasUserReacted) {
    if (hasUserReacted) {
        return {color: themeColors.reactionActiveText};
    }

    return {color: themeColors.textLight};
}

/**
 * Returns a style object with a rotation transformation applied based on the provided direction prop.
 *
 * @param {string} direction - The direction of the rotation (CONST.DIRECTION.LEFT or CONST.DIRECTION.RIGHT).
 * @returns {Object}
 */
function getDirectionStyle(direction) {
    if (direction === CONST.DIRECTION.LEFT) {
        return {transform: [{rotate: '180deg'}]};
    }

    return {};
}

/**
 * Returns a style object with display flex or none basing on the condition value.
 *
 * @param {boolean} condition
 * @returns {Object}
 */
const displayIfTrue = (condition) => ({display: condition ? 'flex' : 'none'});

/**
 * @param {Boolean} shouldDisplayBorder
 * @returns {Object}
 */
function getGoogleListViewStyle(shouldDisplayBorder) {
    if (shouldDisplayBorder) {
        return {
            ...styles.borderTopRounded,
            ...styles.borderBottomRounded,
            marginTop: 4,
            paddingVertical: 6,
        };
    }

    return {
        transform: [{scale: 0}],
    };
}

/**
 * Gets the correct height for emoji picker list based on screen dimensions
 *
 * @param {Boolean} hasAdditionalSpace
 * @param {Number} windowHeight
 * @returns {Object}
 */
function getEmojiPickerListHeight(hasAdditionalSpace, windowHeight) {
    const style = {
        ...spacing.ph4,
        height: hasAdditionalSpace ? CONST.NON_NATIVE_EMOJI_PICKER_LIST_HEIGHT + CONST.CATEGORY_SHORTCUT_BAR_HEIGHT : CONST.NON_NATIVE_EMOJI_PICKER_LIST_HEIGHT,
    };

    if (windowHeight) {
        // dimensions of content above the emoji picker list
        const dimensions = hasAdditionalSpace ? CONST.EMOJI_PICKER_TEXT_INPUT_SIZES : CONST.EMOJI_PICKER_TEXT_INPUT_SIZES + CONST.CATEGORY_SHORTCUT_BAR_HEIGHT;
        return {
            ...style,
            maxHeight: windowHeight - dimensions,
        };
    }
    return style;
}

/**
 * Returns style object for the user mention component based on whether the mention is ours or not.
 * @param {Boolean} isOurMention
 * @returns {Object}
 */
function getMentionStyle(isOurMention) {
    const backgroundColor = isOurMention ? themeColors.ourMentionBG : themeColors.mentionBG;
    return {
        backgroundColor,
        borderRadius: variables.componentBorderRadiusSmall,
        paddingHorizontal: 2,
    };
}

/**
 * Returns text color for the user mention text based on whether the mention is ours or not.
 * @param {Boolean} isOurMention
 * @returns {Object}
 */
function getMentionTextColor(isOurMention) {
    return isOurMention ? themeColors.ourMentionText : themeColors.mentionText;
}

/**
 * Returns style object for the mobile on WEB
 * @param {Number} windowHeight
 * @param {Number} viewportOffsetTop
 * @returns {Object}
 */
function getOuterModalStyle(windowHeight, viewportOffsetTop) {
    return Browser.isMobile() ? {maxHeight: windowHeight, marginTop: viewportOffsetTop} : {};
}

/**
 * Returns style object for flexWrap depending on the screen size
 * @param {Boolean} isExtraSmallScreenWidth
 * @return {Object}
 */
function getWrappingStyle(isExtraSmallScreenWidth) {
    return {
        flexWrap: isExtraSmallScreenWidth ? 'wrap' : 'nowrap',
    };
}

/**
 * Returns the text container styles for menu items depending on if the menu item container a small avatar
 * @param {Boolean} isSmallAvatarSubscriptMenu
 * @returns {Number}
 */
function getMenuItemTextContainerStyle(isSmallAvatarSubscriptMenu) {
    return {
        minHeight: isSmallAvatarSubscriptMenu ? variables.avatarSizeSubscript : variables.componentSizeNormal,
    };
}

/**
 * Returns link styles based on whether the link is disabled or not
 * @param {Boolean} isDisabled
 * @returns {Object}
 */
function getDisabledLinkStyles(isDisabled = false) {
    const disabledLinkStyles = {
        color: themeColors.textSupporting,
        ...cursor.cursorDisabled,
    };

    return {
        ...styles.link,
        ...(isDisabled ? disabledLinkStyles : {}),
    };
}

/**
 * Returns the checkbox container style
 * @param {Number} size
 * @param {Number} borderRadius
 * @returns {Object}
 */
function getCheckboxContainerStyle(size, borderRadius) {
    return {
        backgroundColor: themeColors.componentBG,
        height: size,
        width: size,
        borderColor: themeColors.borderLighter,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        // eslint-disable-next-line object-shorthand
        borderRadius: borderRadius,
    };
}

export {
    getAvatarSize,
    getAvatarWidthStyle,
    getAvatarStyle,
    getAvatarExtraFontSizeStyle,
    getAvatarBorderWidth,
    getAvatarBorderStyle,
    getEmptyAvatarStyle,
    getErrorPageContainerStyle,
    getSafeAreaPadding,
    getSafeAreaMargins,
    getZoomCursorStyle,
    getZoomSizingStyle,
    getWidthStyle,
    getAutoGrowHeightInputStyle,
    getBackgroundAndBorderStyle,
    getBackgroundColorStyle,
    getTextColorStyle,
    getBorderColorStyle,
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
    getThemeBackgroundColor,
    parseStyleAsArray,
    parseStyleFromFunction,
    combineStyles,
    getPaddingLeft,
    hasSafeAreas,
    getHeight,
    getMinimumHeight,
    getMaximumWidth,
    fade,
    getHorizontalStackedAvatarBorderStyle,
    getHorizontalStackedAvatarStyle,
    getHorizontalStackedOverlayAvatarStyle,
    getReportWelcomeBackgroundImageStyle,
    getReportWelcomeTopMarginStyle,
    getReportWelcomeContainerStyle,
    getAutoCompleteSuggestionItemStyle,
    getAutoCompleteSuggestionContainerStyle,
    getColoredBackgroundStyle,
    getDefaultWorkspaceAvatarColor,
    getAvatarBorderRadius,
    getEmojiReactionBubbleStyle,
    getEmojiReactionBubbleTextStyle,
    getEmojiReactionCounterTextStyle,
    getDirectionStyle,
    displayIfTrue,
    getFontSizeStyle,
    getLineHeightStyle,
    getSignInWordmarkWidthStyle,
    getGoogleListViewStyle,
    getEmojiPickerListHeight,
    getMentionStyle,
    getMentionTextColor,
    getHeightOfMagicCodeInput,
    getOuterModalStyle,
    getWrappingStyle,
    getMenuItemTextContainerStyle,
    getDisabledLinkStyles,
    getCheckboxContainerStyle,
};
