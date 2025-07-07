"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultStyleUtils = void 0;
var react_native_1 = require("react-native");
var Browser_1 = require("@libs/Browser");
var getPlatform_1 = require("@libs/getPlatform");
var UserUtils_1 = require("@libs/UserUtils");
// eslint-disable-next-line no-restricted-imports
var theme_1 = require("@styles/theme");
var colors_1 = require("@styles/theme/colors");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var __1 = require("..");
var autoCompleteSuggestion_1 = require("./autoCompleteSuggestion");
var cardStyles_1 = require("./cardStyles");
var containerComposeStyles_1 = require("./containerComposeStyles");
var ModalStyleUtils_1 = require("./generators/ModalStyleUtils");
var ReportActionContextMenuStyleUtils_1 = require("./generators/ReportActionContextMenuStyleUtils");
var TooltipStyleUtils_1 = require("./generators/TooltipStyleUtils");
var getContextMenuItemStyles_1 = require("./getContextMenuItemStyles");
var getHighResolutionInfoWrapperStyle_1 = require("./getHighResolutionInfoWrapperStyle");
var getMoneyRequestReportPreviewStyle_1 = require("./getMoneyRequestReportPreviewStyle");
var index_1 = require("./getNavigationBarType/index");
var getNavigationModalCardStyles_1 = require("./getNavigationModalCardStyles");
var getSafeAreaInsets_1 = require("./getSafeAreaInsets");
var getSignInBgStyles_1 = require("./getSignInBgStyles");
var getSuccessReportCardLostIllustrationStyle_1 = require("./getSuccessReportCardLostIllustrationStyle");
var optionRowStyles_1 = require("./optionRowStyles");
var positioning_1 = require("./positioning");
var searchHeaderDefaultOffset_1 = require("./searchHeaderDefaultOffset");
var searchPageNarrowHeaderStyles_1 = require("./searchPageNarrowHeaderStyles");
var workspaceColorOptions = [
    { backgroundColor: colors_1.default.blue200, fill: colors_1.default.blue700 },
    { backgroundColor: colors_1.default.blue400, fill: colors_1.default.blue800 },
    { backgroundColor: colors_1.default.blue700, fill: colors_1.default.blue200 },
    { backgroundColor: colors_1.default.green200, fill: colors_1.default.green700 },
    { backgroundColor: colors_1.default.green400, fill: colors_1.default.green800 },
    { backgroundColor: colors_1.default.green700, fill: colors_1.default.green200 },
    { backgroundColor: colors_1.default.yellow200, fill: colors_1.default.yellow700 },
    { backgroundColor: colors_1.default.yellow400, fill: colors_1.default.yellow800 },
    { backgroundColor: colors_1.default.yellow700, fill: colors_1.default.yellow200 },
    { backgroundColor: colors_1.default.tangerine200, fill: colors_1.default.tangerine700 },
    { backgroundColor: colors_1.default.tangerine400, fill: colors_1.default.tangerine800 },
    { backgroundColor: colors_1.default.tangerine700, fill: colors_1.default.tangerine400 },
    { backgroundColor: colors_1.default.pink200, fill: colors_1.default.pink700 },
    { backgroundColor: colors_1.default.pink400, fill: colors_1.default.pink800 },
    { backgroundColor: colors_1.default.pink700, fill: colors_1.default.pink200 },
    { backgroundColor: colors_1.default.ice200, fill: colors_1.default.ice700 },
    { backgroundColor: colors_1.default.ice400, fill: colors_1.default.ice800 },
    { backgroundColor: colors_1.default.ice700, fill: colors_1.default.ice200 },
];
var eReceiptColorStyles = (_a = {},
    _a[CONST_1.default.ERECEIPT_COLORS.YELLOW] = { backgroundColor: colors_1.default.yellow800, color: colors_1.default.yellow400, titleColor: colors_1.default.yellow500 },
    _a[CONST_1.default.ERECEIPT_COLORS.ICE] = { backgroundColor: colors_1.default.ice800, color: colors_1.default.ice400, titleColor: colors_1.default.ice500 },
    _a[CONST_1.default.ERECEIPT_COLORS.BLUE] = { backgroundColor: colors_1.default.blue800, color: colors_1.default.blue400, titleColor: colors_1.default.blue500 },
    _a[CONST_1.default.ERECEIPT_COLORS.GREEN] = { backgroundColor: colors_1.default.green800, color: colors_1.default.green400, titleColor: colors_1.default.green500 },
    _a[CONST_1.default.ERECEIPT_COLORS.TANGERINE] = { backgroundColor: colors_1.default.tangerine800, color: colors_1.default.tangerine400, titleColor: colors_1.default.tangerine500 },
    _a[CONST_1.default.ERECEIPT_COLORS.PINK] = { backgroundColor: colors_1.default.pink800, color: colors_1.default.pink400, titleColor: colors_1.default.pink500 },
    _a);
var eReceiptColors = [
    CONST_1.default.ERECEIPT_COLORS.YELLOW,
    CONST_1.default.ERECEIPT_COLORS.ICE,
    CONST_1.default.ERECEIPT_COLORS.BLUE,
    CONST_1.default.ERECEIPT_COLORS.GREEN,
    CONST_1.default.ERECEIPT_COLORS.TANGERINE,
    CONST_1.default.ERECEIPT_COLORS.PINK,
];
var avatarBorderSizes = (_b = {},
    _b[CONST_1.default.AVATAR_SIZE.SMALL_SUBSCRIPT] = variables_1.default.componentBorderRadiusSmall,
    _b[CONST_1.default.AVATAR_SIZE.MID_SUBSCRIPT] = variables_1.default.componentBorderRadiusSmall,
    _b[CONST_1.default.AVATAR_SIZE.SUBSCRIPT] = variables_1.default.componentBorderRadiusMedium,
    _b[CONST_1.default.AVATAR_SIZE.SMALLER] = variables_1.default.componentBorderRadiusMedium,
    _b[CONST_1.default.AVATAR_SIZE.SMALL] = variables_1.default.componentBorderRadiusMedium,
    _b[CONST_1.default.AVATAR_SIZE.HEADER] = variables_1.default.componentBorderRadiusMedium,
    _b[CONST_1.default.AVATAR_SIZE.DEFAULT] = variables_1.default.componentBorderRadiusNormal,
    _b[CONST_1.default.AVATAR_SIZE.MEDIUM] = variables_1.default.componentBorderRadiusLarge,
    _b[CONST_1.default.AVATAR_SIZE.LARGE] = variables_1.default.componentBorderRadiusLarge,
    _b[CONST_1.default.AVATAR_SIZE.X_LARGE] = variables_1.default.componentBorderRadiusLarge,
    _b[CONST_1.default.AVATAR_SIZE.LARGE_BORDERED] = variables_1.default.componentBorderRadiusRounded,
    _b[CONST_1.default.AVATAR_SIZE.SMALL_NORMAL] = variables_1.default.componentBorderRadiusMedium,
    _b);
var avatarSizes = (_c = {},
    _c[CONST_1.default.AVATAR_SIZE.DEFAULT] = variables_1.default.avatarSizeNormal,
    _c[CONST_1.default.AVATAR_SIZE.SMALL_SUBSCRIPT] = variables_1.default.avatarSizeSmallSubscript,
    _c[CONST_1.default.AVATAR_SIZE.MID_SUBSCRIPT] = variables_1.default.avatarSizeMidSubscript,
    _c[CONST_1.default.AVATAR_SIZE.SUBSCRIPT] = variables_1.default.avatarSizeSubscript,
    _c[CONST_1.default.AVATAR_SIZE.SMALL] = variables_1.default.avatarSizeSmall,
    _c[CONST_1.default.AVATAR_SIZE.SMALLER] = variables_1.default.avatarSizeSmaller,
    _c[CONST_1.default.AVATAR_SIZE.LARGE] = variables_1.default.avatarSizeLarge,
    _c[CONST_1.default.AVATAR_SIZE.X_LARGE] = variables_1.default.avatarSizeXLarge,
    _c[CONST_1.default.AVATAR_SIZE.MEDIUM] = variables_1.default.avatarSizeMedium,
    _c[CONST_1.default.AVATAR_SIZE.LARGE_BORDERED] = variables_1.default.avatarSizeLargeBordered,
    _c[CONST_1.default.AVATAR_SIZE.HEADER] = variables_1.default.avatarSizeHeader,
    _c[CONST_1.default.AVATAR_SIZE.MENTION_ICON] = variables_1.default.avatarSizeMentionIcon,
    _c[CONST_1.default.AVATAR_SIZE.SMALL_NORMAL] = variables_1.default.avatarSizeSmallNormal,
    _c[CONST_1.default.AVATAR_SIZE.LARGE_NORMAL] = variables_1.default.avatarSizeLargeNormal,
    _c);
var avatarFontSizes = (_d = {},
    _d[CONST_1.default.AVATAR_SIZE.DEFAULT] = variables_1.default.fontSizeNormal,
    _d[CONST_1.default.AVATAR_SIZE.SMALL_SUBSCRIPT] = variables_1.default.fontSizeExtraSmall,
    _d[CONST_1.default.AVATAR_SIZE.MID_SUBSCRIPT] = variables_1.default.fontSizeExtraSmall,
    _d[CONST_1.default.AVATAR_SIZE.SUBSCRIPT] = variables_1.default.fontSizeExtraSmall,
    _d[CONST_1.default.AVATAR_SIZE.SMALL] = variables_1.default.fontSizeSmall,
    _d[CONST_1.default.AVATAR_SIZE.SMALLER] = variables_1.default.fontSizeExtraSmall,
    _d[CONST_1.default.AVATAR_SIZE.LARGE] = variables_1.default.fontSizeXLarge,
    _d[CONST_1.default.AVATAR_SIZE.MEDIUM] = variables_1.default.fontSizeMedium,
    _d[CONST_1.default.AVATAR_SIZE.LARGE_BORDERED] = variables_1.default.fontSizeXLarge,
    _d);
var avatarBorderWidths = (_e = {},
    _e[CONST_1.default.AVATAR_SIZE.DEFAULT] = 3,
    _e[CONST_1.default.AVATAR_SIZE.SMALL_SUBSCRIPT] = 2,
    _e[CONST_1.default.AVATAR_SIZE.MID_SUBSCRIPT] = 2,
    _e[CONST_1.default.AVATAR_SIZE.SUBSCRIPT] = 2,
    _e[CONST_1.default.AVATAR_SIZE.SMALL] = 2,
    _e[CONST_1.default.AVATAR_SIZE.SMALLER] = 2,
    _e[CONST_1.default.AVATAR_SIZE.LARGE] = 4,
    _e[CONST_1.default.AVATAR_SIZE.X_LARGE] = 4,
    _e[CONST_1.default.AVATAR_SIZE.MEDIUM] = 3,
    _e[CONST_1.default.AVATAR_SIZE.LARGE_BORDERED] = 4,
    _e);
/**
 * Converts a color in hexadecimal notation into RGB notation.
 *
 * @param hexadecimal A color in hexadecimal notation.
 * @returns `undefined` if the input color is not in hexadecimal notation. Otherwise, the RGB components of the input color.
 */
function hexadecimalToRGBArray(hexadecimal) {
    var components = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexadecimal);
    if (components === null) {
        return undefined;
    }
    return components.slice(1).map(function (component) { return parseInt(component, 16); });
}
/**
 * Converts a color in RGBA notation to an equivalent color in RGB notation.
 *
 * @param foregroundRGB The three components of the foreground color in RGB notation.
 * @param backgroundRGB The three components of the background color in RGB notation.
 * @param opacity The desired opacity of the foreground color.
 * @returns The RGB components of the RGBA color converted to RGB.
 */
function convertRGBAToRGB(foregroundRGB, backgroundRGB, opacity) {
    var foregroundRed = foregroundRGB[0], foregroundGreen = foregroundRGB[1], foregroundBlue = foregroundRGB[2];
    var backgroundRed = backgroundRGB[0], backgroundGreen = backgroundRGB[1], backgroundBlue = backgroundRGB[2];
    return [(1 - opacity) * backgroundRed + opacity * foregroundRed, (1 - opacity) * backgroundGreen + opacity * foregroundGreen, (1 - opacity) * backgroundBlue + opacity * foregroundBlue];
}
/**
 * Converts three unit values to the three components of a color in RGB notation.
 *
 * @param red A unit value representing the first component of a color in RGB notation.
 * @param green A unit value representing the second component of a color in RGB notation.
 * @param blue A unit value representing the third component of a color in RGB notation.
 * @returns An array with the three components of a color in RGB notation.
 */
function convertUnitValuesToRGB(red, green, blue) {
    return [Math.floor(red * 255), Math.floor(green * 255), Math.floor(blue * 255)];
}
/**
 * Converts the three components of a color in RGB notation to three unit values.
 *
 * @param red The first component of a color in RGB notation.
 * @param green The second component of a color in RGB notation.
 * @param blue The third component of a color in RGB notation.
 * @returns An array with three unit values representing the components of a color in RGB notation.
 */
function convertRGBToUnitValues(red, green, blue) {
    return [red / 255, green / 255, blue / 255];
}
/**
 * Matches an RGBA or RGB color value and extracts the color components.
 *
 * @param color - The RGBA or RGB color value to match and extract components from.
 * @returns An array containing the extracted color components [red, green, blue, alpha].
 *
 * Returns null if the input string does not match the pattern.
 */
function extractValuesFromRGB(color) {
    var rgbaPattern = /rgba?\((?<r>[.\d]+)[, ]+(?<g>[.\d]+)[, ]+(?<b>[.\d]+)(?:\s?[,/]\s?(?<a>[.\d]+%?))?\)$/i;
    var matchRGBA = color.match(rgbaPattern);
    if (matchRGBA) {
        var red = matchRGBA[1], green = matchRGBA[2], blue = matchRGBA[3], alpha = matchRGBA[4];
        return [parseInt(red, 10), parseInt(green, 10), parseInt(blue, 10), alpha ? parseFloat(alpha) : 1];
    }
    return null;
}
/**
 * Return the style size from an avatar size constant
 */
function getAvatarSize(size) {
    return avatarSizes[size];
}
/**
 * Return the width style from an avatar size constant
 */
function getAvatarWidthStyle(size) {
    var avatarSize = getAvatarSize(size);
    return {
        width: avatarSize,
    };
}
/**
 * Get Font size of '+1' text on avatar overlay
 */
function getAvatarExtraFontSizeStyle(size) {
    return {
        fontSize: avatarFontSizes[size],
    };
}
/**
 * Get border size of Avatar based on avatar size
 */
function getAvatarBorderWidth(size) {
    return {
        borderWidth: avatarBorderWidths[size],
    };
}
/**
 * Return the border radius for an avatar
 */
function getAvatarBorderRadius(size, type) {
    if (type === CONST_1.default.ICON_TYPE_WORKSPACE) {
        return { borderRadius: avatarBorderSizes[size] };
    }
    // Default to rounded border
    return { borderRadius: variables_1.default.buttonBorderRadius };
}
/**
 * Return the border style for an avatar
 */
function getAvatarBorderStyle(size, type) {
    return __assign({ overflow: 'hidden' }, getAvatarBorderRadius(size, type));
}
/**
 * Returns the avatar subscript icon container styles
 */
function getAvatarSubscriptIconContainerStyle(iconWidth, iconHeight) {
    if (iconWidth === void 0) { iconWidth = 16; }
    if (iconHeight === void 0) { iconHeight = 16; }
    var borderWidth = 2;
    // The width of the container is the width of the icon + 2x border width (left and right)
    var containerWidth = iconWidth + 2 * borderWidth;
    // The height of the container is the height of the icon + 2x border width (top and bottom)
    var containerHeight = iconHeight + 2 * borderWidth;
    return {
        overflow: 'hidden',
        position: 'absolute',
        bottom: -4,
        right: -4,
        borderWidth: borderWidth,
        borderRadius: 2 + borderWidth,
        width: containerWidth,
        height: containerHeight,
    };
}
/**
 * Helper method to return workspace avatar color styles
 */
function getDefaultWorkspaceAvatarColor(text) {
    var _a;
    var colorHash = (0, UserUtils_1.hashText)(text.trim(), workspaceColorOptions.length);
    return (_a = workspaceColorOptions.at(colorHash)) !== null && _a !== void 0 ? _a : { backgroundColor: colors_1.default.blue200, fill: colors_1.default.blue700 };
}
/**
 * Helper method to return formatted backgroundColor and fill styles
 */
function getBackgroundColorAndFill(backgroundColor, fill) {
    return { backgroundColor: backgroundColor, fill: fill };
}
/**
 * Helper method to return eReceipt color code
 */
function getEReceiptColorCode(transaction) {
    var _a;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var transactionID = (transaction === null || transaction === void 0 ? void 0 : transaction.parentTransactionID) || (transaction === null || transaction === void 0 ? void 0 : transaction.transactionID);
    if (!transactionID) {
        return CONST_1.default.ERECEIPT_COLORS.YELLOW;
    }
    var colorHash = (0, UserUtils_1.hashText)(transactionID.trim(), eReceiptColors.length);
    return (_a = eReceiptColors.at(colorHash)) !== null && _a !== void 0 ? _a : CONST_1.default.ERECEIPT_COLORS.YELLOW;
}
/**
 * Helper method to return eReceipt color code for Receipt Thumbnails
 */
function getFileExtensionColorCode(fileExtension) {
    switch (fileExtension) {
        case CONST_1.default.IOU.FILE_TYPES.DOC:
            return CONST_1.default.ERECEIPT_COLORS.PINK;
        case CONST_1.default.IOU.FILE_TYPES.HTML:
            return CONST_1.default.ERECEIPT_COLORS.TANGERINE;
        default:
            return CONST_1.default.ERECEIPT_COLORS.GREEN;
    }
}
/**
 * Helper method to return eReceipt color styles
 */
function getEReceiptColorStyles(colorCode) {
    return eReceiptColorStyles[colorCode];
}
/**
 * Takes safe area insets and returns platform specific padding to use for a View
 */
function getPlatformSafeAreaPadding(insets, insetsPercentageProp) {
    var _a, _b, _c, _d;
    var platform = (0, getPlatform_1.default)();
    var insetsPercentage = insetsPercentageProp;
    if (insetsPercentage == null) {
        switch (platform) {
            case CONST_1.default.PLATFORM.IOS:
                insetsPercentage = variables_1.default.iosSafeAreaInsetsPercentage;
                break;
            case CONST_1.default.PLATFORM.ANDROID:
                insetsPercentage = variables_1.default.androidSafeAreaInsetsPercentage;
                break;
            default:
                insetsPercentage = 1;
        }
    }
    return {
        paddingTop: (_a = insets === null || insets === void 0 ? void 0 : insets.top) !== null && _a !== void 0 ? _a : 0,
        paddingBottom: ((_b = insets === null || insets === void 0 ? void 0 : insets.bottom) !== null && _b !== void 0 ? _b : 0) * insetsPercentage,
        paddingLeft: ((_c = insets === null || insets === void 0 ? void 0 : insets.left) !== null && _c !== void 0 ? _c : 0) * insetsPercentage,
        paddingRight: ((_d = insets === null || insets === void 0 ? void 0 : insets.right) !== null && _d !== void 0 ? _d : 0) * insetsPercentage,
    };
}
/**
 * Takes safe area insets and returns margin to use for a View
 */
function getSafeAreaMargins(insets) {
    var _a;
    return { marginBottom: ((_a = insets === null || insets === void 0 ? void 0 : insets.bottom) !== null && _a !== void 0 ? _a : 0) * variables_1.default.iosSafeAreaInsetsPercentage };
}
function getZoomSizingStyle(isZoomed, imgWidth, imgHeight, zoomScale, containerHeight, containerWidth, isLoading) {
    // Hide image until finished loading to prevent showing preview with wrong dimensions
    if (isLoading || imgWidth === 0 || imgHeight === 0) {
        return undefined;
    }
    var top = "".concat(Math.max((containerHeight - imgHeight) / 2, 0), "px");
    var left = "".concat(Math.max((containerWidth - imgWidth) / 2, 0), "px");
    // Return different size and offset style based on zoomScale and isZoom.
    if (isZoomed) {
        // When both width and height are smaller than container(modal) size, set the height by multiplying zoomScale if it is zoomed in.
        if (zoomScale >= 1) {
            return {
                height: "".concat(imgHeight * zoomScale, "px"),
                width: "".concat(imgWidth * zoomScale, "px"),
            };
        }
        // If image height and width are bigger than container size, display image with original size because original size is bigger and position absolute.
        return {
            height: "".concat(imgHeight, "px"),
            width: "".concat(imgWidth, "px"),
            top: top,
            left: left,
        };
    }
    // If image is not zoomed in and image size is smaller than container size, display with original size based on offset and position absolute.
    if (zoomScale > 1) {
        return {
            height: "".concat(imgHeight, "px"),
            width: "".concat(imgWidth, "px"),
            top: top,
            left: left,
        };
    }
    // If image is bigger than container size, display full image in the screen with scaled size (fit by container size) and position absolute.
    // top, left offset should be different when displaying long or wide image.
    var scaledTop = "".concat(Math.max((containerHeight - imgHeight * zoomScale) / 2, 0), "px");
    var scaledLeft = "".concat(Math.max((containerWidth - imgWidth * zoomScale) / 2, 0), "px");
    return {
        height: "".concat(imgHeight * zoomScale, "px"),
        width: "".concat(imgWidth * zoomScale, "px"),
        top: scaledTop,
        left: scaledLeft,
    };
}
/**
 * Returns a style with width set to the specified number
 */
function getWidthStyle(width) {
    return {
        width: width,
    };
}
/**
 * Returns a style with border radius set to the specified number
 */
function getBorderRadiusStyle(borderRadius) {
    return {
        borderRadius: borderRadius,
    };
}
/**
 * Returns a style with backgroundColor and borderColor set to the same color
 */
function getBackgroundAndBorderStyle(backgroundColor) {
    return {
        backgroundColor: backgroundColor,
        borderColor: backgroundColor,
    };
}
/**
 * Returns a style with the specified backgroundColor
 */
function getBackgroundColorStyle(backgroundColor) {
    return {
        backgroundColor: backgroundColor,
    };
}
/**
 * Returns a style for text color
 */
function getTextColorStyle(color) {
    return {
        color: color,
    };
}
/**
 * Returns a style with the specified borderColor
 */
function getBorderColorStyle(borderColor) {
    return {
        borderColor: borderColor,
    };
}
/**
 * Returns the width style for the wordmark logo on the sign in page
 */
function getSignInWordmarkWidthStyle(isSmallScreenWidth, environment) {
    if (environment === CONST_1.default.ENVIRONMENT.DEV) {
        return isSmallScreenWidth ? { width: variables_1.default.signInLogoWidthPill } : { width: variables_1.default.signInLogoWidthLargeScreenPill };
    }
    if (environment === CONST_1.default.ENVIRONMENT.STAGING) {
        return isSmallScreenWidth ? { width: variables_1.default.signInLogoWidthPill } : { width: variables_1.default.signInLogoWidthLargeScreenPill };
    }
    if (environment === CONST_1.default.ENVIRONMENT.PRODUCTION) {
        return isSmallScreenWidth ? { width: variables_1.default.signInLogoWidth } : { width: variables_1.default.signInLogoWidthLargeScreen };
    }
    return isSmallScreenWidth ? { width: variables_1.default.signInLogoWidthPill } : { width: variables_1.default.signInLogoWidthLargeScreenPill };
}
/**
 * Returns a background color with opacity style
 */
function getBackgroundColorWithOpacityStyle(backgroundColor, opacity) {
    var result = hexadecimalToRGBArray(backgroundColor);
    if (result !== undefined) {
        return {
            backgroundColor: "rgba(".concat(result.at(0), ", ").concat(result.at(1), ", ").concat(result.at(2), ", ").concat(opacity, ")"),
        };
    }
    return {};
}
function getWidthAndHeightStyle(width, height) {
    return {
        width: width,
        height: height !== null && height !== void 0 ? height : width,
    };
}
function getIconWidthAndHeightStyle(small, medium, large, width, height, isButtonIcon) {
    switch (true) {
        case small:
            return { width: isButtonIcon ? variables_1.default.iconSizeExtraSmall : variables_1.default.iconSizeSmall, height: isButtonIcon ? variables_1.default.iconSizeExtraSmall : variables_1.default === null || variables_1.default === void 0 ? void 0 : variables_1.default.iconSizeSmall };
        case medium:
            return { width: isButtonIcon ? variables_1.default.iconSizeSmall : variables_1.default.iconSizeNormal, height: isButtonIcon ? variables_1.default.iconSizeSmall : variables_1.default.iconSizeNormal };
        case large:
            return { width: isButtonIcon ? variables_1.default.iconSizeNormal : variables_1.default.iconSizeLarge, height: isButtonIcon ? variables_1.default.iconSizeNormal : variables_1.default.iconSizeLarge };
        default: {
            return { width: width, height: height };
        }
    }
}
function getButtonStyleWithIcon(styles, small, medium, large, hasIcon, hasText, shouldShowRightIcon) {
    var useDefaultButtonStyles = !!(hasIcon && shouldShowRightIcon) || !!(!hasIcon && !shouldShowRightIcon);
    switch (true) {
        case small: {
            var verticalStyle = hasIcon ? styles.pl2 : styles.pr2;
            return useDefaultButtonStyles ? styles.buttonSmall : __assign(__assign({}, styles.buttonSmall), (hasText ? verticalStyle : styles.ph0));
        }
        case medium: {
            var verticalStyle = hasIcon ? styles.pl3 : styles.pr3;
            return useDefaultButtonStyles ? styles.buttonMedium : __assign(__assign({}, styles.buttonMedium), (hasText ? verticalStyle : styles.ph0));
        }
        case large: {
            var verticalStyle = hasIcon ? styles.pl4 : styles.pr4;
            return useDefaultButtonStyles ? styles.buttonLarge : __assign(__assign({}, styles.buttonLarge), (hasText ? verticalStyle : styles.ph0));
        }
        default: {
            if (hasIcon && !hasText) {
                return __assign(__assign({}, styles.buttonMedium), styles.ph0);
            }
            return undefined;
        }
    }
}
/**
 * Combine margin/padding with safe area inset
 *
 * @param modalContainerValue - margin or padding value
 * @param safeAreaValue - safe area inset
 * @param shouldAddSafeAreaValue - indicator whether safe area inset should be applied
 */
function getCombinedSpacing(modalContainerValue, safeAreaValue, shouldAddSafeAreaValue) {
    // modalContainerValue can only be added to safe area inset if it's a number, otherwise it's returned as is
    if (typeof modalContainerValue === 'number') {
        return modalContainerValue + (shouldAddSafeAreaValue ? safeAreaValue : 0);
    }
    if (!modalContainerValue) {
        return shouldAddSafeAreaValue ? safeAreaValue : 0;
    }
    return modalContainerValue;
}
function getModalPaddingStyles(_a) {
    var _b;
    var shouldAddBottomSafeAreaMargin = _a.shouldAddBottomSafeAreaMargin, shouldAddTopSafeAreaMargin = _a.shouldAddTopSafeAreaMargin, shouldAddBottomSafeAreaPadding = _a.shouldAddBottomSafeAreaPadding, shouldAddTopSafeAreaPadding = _a.shouldAddTopSafeAreaPadding, modalContainerStyle = _a.modalContainerStyle, insets = _a.insets;
    var _c = getPlatformSafeAreaPadding(insets), safeAreaPaddingTop = _c.paddingTop, safeAreaPaddingBottom = _c.paddingBottom, safeAreaPaddingLeft = _c.paddingLeft, safeAreaPaddingRight = _c.paddingRight;
    // use fallback value for safeAreaPaddingBottom to keep padding bottom consistent with padding top.
    // More info: issue #17376
    var safeAreaPaddingBottomWithFallback = insets.bottom === 0 && typeof modalContainerStyle.paddingTop === 'number' ? ((_b = modalContainerStyle.paddingTop) !== null && _b !== void 0 ? _b : 0) : safeAreaPaddingBottom;
    return {
        marginTop: getCombinedSpacing(modalContainerStyle.marginTop, safeAreaPaddingTop, shouldAddTopSafeAreaMargin),
        marginBottom: getCombinedSpacing(modalContainerStyle.marginBottom, safeAreaPaddingBottomWithFallback, shouldAddBottomSafeAreaMargin),
        paddingTop: getCombinedSpacing(modalContainerStyle.paddingTop, safeAreaPaddingTop, shouldAddTopSafeAreaPadding),
        paddingBottom: getCombinedSpacing(modalContainerStyle.paddingBottom, safeAreaPaddingBottom, shouldAddBottomSafeAreaPadding),
        paddingLeft: safeAreaPaddingLeft !== null && safeAreaPaddingLeft !== void 0 ? safeAreaPaddingLeft : 0,
        paddingRight: safeAreaPaddingRight !== null && safeAreaPaddingRight !== void 0 ? safeAreaPaddingRight : 0,
    };
}
/**
 * Returns the font size for the HTML code tag renderer.
 */
function getCodeFontSize(isInsideH1, isInsideTaskTitle) {
    if (isInsideH1 && !isInsideTaskTitle) {
        return 15;
    }
    if (isInsideTaskTitle) {
        return 18;
    }
    return 13;
}
/**
 * Gives the width for Emoji picker Widget
 */
function getEmojiPickerStyle(isSmallScreenWidth) {
    if (isSmallScreenWidth) {
        return {
            width: CONST_1.default.SMALL_EMOJI_PICKER_SIZE.WIDTH,
        };
    }
    return {
        width: CONST_1.default.EMOJI_PICKER_SIZE.WIDTH,
        height: CONST_1.default.EMOJI_PICKER_SIZE.HEIGHT,
    };
}
function getPaymentMethodMenuWidth(isSmallScreenWidth) {
    var margin = 20;
    return { width: !isSmallScreenWidth ? variables_1.default.sideBarWidth - margin * 2 : undefined };
}
/**
 * Parse styleParam and return Styles array
 */
function parseStyleAsArray(styleParam) {
    return Array.isArray(styleParam) ? styleParam : [styleParam];
}
/**
 * Parse style function and return Styles object
 */
function parseStyleFromFunction(style, state) {
    return typeof style === 'function' ? style(state) : style;
}
/**
 * Receives any number of object or array style objects and returns them all as an array
 */
function combineStyles() {
    var allStyles = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        allStyles[_i] = arguments[_i];
    }
    var finalStyles = [];
    allStyles.forEach(function (style) {
        finalStyles = finalStyles.concat(parseStyleAsArray(style));
    });
    return finalStyles;
}
/**
 * Get variable padding-left as style
 */
function getPaddingLeft(paddingLeft) {
    return {
        paddingLeft: paddingLeft,
    };
}
/**
 * Get variable padding-right as style
 */
function getPaddingRight(paddingRight) {
    return {
        paddingRight: paddingRight,
    };
}
/**
 * Get variable padding-bottom as style
 */
function getPaddingBottom(paddingBottom) {
    return {
        paddingBottom: paddingBottom,
    };
}
/**
 * Checks to see if the iOS device has safe areas or not
 */
function hasSafeAreas(windowWidth, windowHeight) {
    var heightsIPhonesWithNotches = [812, 896, 844, 926];
    return heightsIPhonesWithNotches.includes(windowHeight) || heightsIPhonesWithNotches.includes(windowWidth);
}
/**
 * Get height as style
 */
function getHeight(height) {
    return {
        height: height,
    };
}
/**
 * Get minimum height as style
 */
function getMinimumHeight(minHeight) {
    return {
        minHeight: minHeight,
    };
}
/**
 * Get minimum width as style
 */
function getMinimumWidth(minWidth) {
    return {
        minWidth: minWidth,
    };
}
/**
 * Get maximum height as style
 */
function getMaximumHeight(maxHeight) {
    return {
        maxHeight: maxHeight,
    };
}
/**
 * Get maximum width as style
 */
function getMaximumWidth(maxWidth) {
    return {
        maxWidth: maxWidth,
    };
}
function getHorizontalStackedAvatarBorderStyle(_a) {
    var theme = _a.theme, isHovered = _a.isHovered, isPressed = _a.isPressed, _b = _a.isInReportAction, isInReportAction = _b === void 0 ? false : _b, _c = _a.shouldUseCardBackground, shouldUseCardBackground = _c === void 0 ? false : _c, _d = _a.isActive, isActive = _d === void 0 ? false : _d;
    var borderColor = shouldUseCardBackground ? theme.cardBG : theme.appBG;
    if (isHovered) {
        borderColor = isInReportAction ? theme.hoverComponentBG : theme.border;
    }
    if (isActive) {
        borderColor = theme.messageHighlightBG;
    }
    if (isPressed) {
        borderColor = isInReportAction ? theme.hoverComponentBG : theme.buttonPressedBG;
    }
    return { borderColor: borderColor };
}
/**
 * Get computed avatar styles based on position and border size
 */
function getHorizontalStackedAvatarStyle(index, overlapSize) {
    return {
        marginLeft: index > 0 ? -overlapSize : 0,
        zIndex: index + 2,
    };
}
/**
 * Get computed avatar styles of '+1' overlay based on size
 */
function getHorizontalStackedOverlayAvatarStyle(oneAvatarSize, oneAvatarBorderWidth) {
    return {
        borderWidth: oneAvatarBorderWidth,
        borderRadius: oneAvatarSize.width,
        marginLeft: -(oneAvatarSize.width + oneAvatarBorderWidth * 2),
        zIndex: 6,
        borderStyle: 'solid',
    };
}
/**
 * Gets the correct size for the empty state background image based on screen dimensions
 */
function getReportWelcomeBackgroundImageStyle(isSmallScreenWidth) {
    if (isSmallScreenWidth) {
        return {
            position: 'absolute',
            bottom: 0,
            height: CONST_1.default.EMPTY_STATE_BACKGROUND.SMALL_SCREEN.IMAGE_HEIGHT,
            width: '100%',
        };
    }
    return {
        position: 'absolute',
        bottom: 0,
        height: CONST_1.default.EMPTY_STATE_BACKGROUND.WIDE_SCREEN.IMAGE_HEIGHT,
        width: '100%',
    };
}
/**
 * Gets the style for the container of the empty state background image that overlap the created report action
 */
function getReportWelcomeBackgroundContainerStyle() {
    return {
        position: 'absolute',
        top: CONST_1.default.EMPTY_STATE_BACKGROUND.OVERLAP,
        width: '100%',
    };
}
/**
 * Returns fontSize style
 */
function getFontSizeStyle(fontSize) {
    return {
        fontSize: fontSize,
    };
}
/**
 * Returns lineHeight style
 */
function getLineHeightStyle(lineHeight) {
    return {
        lineHeight: lineHeight,
    };
}
/**
 * Gets the correct position for the base auto complete suggestion container
 */
function getBaseAutoCompleteSuggestionContainerStyle(_a) {
    var left = _a.left, bottom = _a.bottom, width = _a.width;
    return {
        position: 'absolute',
        bottom: bottom,
        left: left,
        width: width,
    };
}
var shouldPreventScroll = (0, autoCompleteSuggestion_1.default)();
/**
 * Gets the correct position for auto complete suggestion container
 */
function getAutoCompleteSuggestionContainerStyle(itemsHeight) {
    'worklet';
    var borderWidth = 2;
    var height = itemsHeight + 2 * CONST_1.default.AUTO_COMPLETE_SUGGESTER.SUGGESTER_INNER_PADDING + (shouldPreventScroll ? borderWidth : 0);
    return {
        height: height,
        minHeight: CONST_1.default.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT,
    };
}
function getEmojiReactionBubbleTextStyle(isContextMenu) {
    if (isContextMenu === void 0) { isContextMenu = false; }
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
function getTransformScaleStyle(scaleValue) {
    return {
        transform: [{ scale: scaleValue }],
    };
}
/**
 * Returns a style object with a rotation transformation applied based on the provided direction prop.
 *
 * @param direction - The direction of the rotation (CONST.DIRECTION.LEFT or CONST.DIRECTION.RIGHT).
 */
function getDirectionStyle(direction) {
    if (direction === CONST_1.default.DIRECTION.LEFT) {
        return { transform: 'rotate(180deg)' };
    }
    return {};
}
/**
 * Returns a style object with display flex or none basing on the condition value.
 */
function displayIfTrue(condition) {
    return { display: condition ? 'flex' : 'none' };
}
/**
 * Gets the correct height for emoji picker list based on screen dimensions
 */
function getEmojiPickerListHeight(isRenderingShortcutRow, windowHeight) {
    var style = {
        height: isRenderingShortcutRow ? CONST_1.default.NON_NATIVE_EMOJI_PICKER_LIST_HEIGHT + CONST_1.default.CATEGORY_SHORTCUT_BAR_HEIGHT : CONST_1.default.NON_NATIVE_EMOJI_PICKER_LIST_HEIGHT,
    };
    if (windowHeight) {
        // dimensions of content above the emoji picker list
        var dimensions = isRenderingShortcutRow ? CONST_1.default.EMOJI_PICKER_TEXT_INPUT_SIZES + CONST_1.default.CATEGORY_SHORTCUT_BAR_HEIGHT : CONST_1.default.EMOJI_PICKER_TEXT_INPUT_SIZES;
        var maxHeight = windowHeight - dimensions;
        return __assign(__assign({}, style), { maxHeight: maxHeight, 
            /**
             * On native platforms, `maxHeight` doesn't work as expected, so we manually
             * enforce the height by returning the smaller of the element's height or the
             * `maxHeight`, ensuring it doesn't exceed the maximum allowed.
             */
            height: Math.min(style.height, maxHeight) });
    }
    return style;
}
/**
 * Returns vertical padding based on number of lines.
 */
function getComposeTextAreaPadding(isComposerFullSize, textContainsOnlyEmojis) {
    var paddingTop = 8;
    var paddingBottom = 8;
    // Issue #26222: If isComposerFullSize paddingValue will always be 5 to prevent padding jumps when adding multiple lines.
    if (!isComposerFullSize) {
        paddingTop = 8;
        paddingBottom = 8;
    }
    // We need to reduce the top padding because emojis have a bigger font height.
    if (textContainsOnlyEmojis) {
        paddingTop = 3;
    }
    return { paddingTop: paddingTop, paddingBottom: paddingBottom };
}
/**
 * Returns style object for the mobile on WEB
 */
function getOuterModalStyle(windowHeight, viewportOffsetTop) {
    return (0, Browser_1.isMobile)() ? { maxHeight: windowHeight, marginTop: viewportOffsetTop } : {};
}
/**
 * Returns style object for flexWrap depending on the screen size
 */
function getWrappingStyle(isExtraSmallScreenWidth) {
    return {
        flexWrap: isExtraSmallScreenWidth ? 'wrap' : 'nowrap',
    };
}
/**
 * Returns the text container styles for menu items depending on if the menu item container is in compact mode or not
 */
function getMenuItemTextContainerStyle(compactMode) {
    return {
        minHeight: compactMode ? 20 : variables_1.default.componentSizeNormal,
    };
}
/**
 * Returns the style for a menu item's icon based on of the container is in compact mode or not
 */
function getMenuItemIconStyle(compactMode) {
    return {
        justifyContent: 'center',
        alignItems: 'center',
        width: compactMode ? 20 : variables_1.default.componentSizeNormal,
    };
}
/**
 * Returns color style
 */
function getColorStyle(color) {
    return { color: color };
}
/**
 * Returns the checkbox pressable style
 */
function getCheckboxPressableStyle(borderRadius) {
    if (borderRadius === void 0) { borderRadius = 6; }
    return {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius,
    };
}
/**
 * Returns style object for the drop button height
 */
function getDropDownButtonHeight(buttonSize) {
    if (buttonSize === CONST_1.default.DROPDOWN_BUTTON_SIZE.LARGE) {
        return {
            height: variables_1.default.componentSizeLarge,
        };
    }
    if (buttonSize === CONST_1.default.DROPDOWN_BUTTON_SIZE.SMALL) {
        return {
            height: variables_1.default.componentSizeSmall,
        };
    }
    return {
        height: variables_1.default.componentSizeNormal,
    };
}
/**
 * Returns fitting fontSize and lineHeight values in order to prevent large amounts from being cut off on small screen widths.
 */
function getAmountFontSizeAndLineHeight(isSmallScreenWidth, windowWidth, displayAmountLength, numberOfParticipant) {
    var toSubtract = 0;
    var baseFontSize = variables_1.default.fontSizeXLarge;
    var baseLineHeight = variables_1.default.lineHeightXXLarge;
    var numberOfAvatar = numberOfParticipant < 4 ? numberOfParticipant : 4;
    var differentWithMaxLength = 17 - displayAmountLength;
    // with a window width is more than 420px the maximum amount will not be cut off with the maximum avatar displays
    if (isSmallScreenWidth && windowWidth < 420) {
        // Based on width Difference we can see the max length of amount can be displayed with the number of avatars.
        // From there we can calculate subtract in accordance with the number of avatar and the length of amount text
        var widthDifference = 420 - windowWidth;
        switch (true) {
            // It is very rare for native devices to have a width smaller than 350px so add a constant subtract here
            case widthDifference > 70:
                toSubtract = 11;
                break;
            case widthDifference > 60:
                if (18 - numberOfAvatar * 2 < displayAmountLength) {
                    toSubtract = numberOfAvatar * 2 - differentWithMaxLength;
                }
                break;
            case widthDifference > 50:
                if (19 - numberOfAvatar * 2 < displayAmountLength) {
                    toSubtract = (numberOfAvatar - 1) * 2 + 1 - differentWithMaxLength;
                }
                break;
            case widthDifference > 40:
                if (20 - numberOfAvatar * 2 < displayAmountLength) {
                    toSubtract = (numberOfAvatar - 1) * 2 - differentWithMaxLength;
                }
                break;
            case widthDifference > 30:
                if (21 - numberOfAvatar * 2 < displayAmountLength) {
                    toSubtract = (numberOfAvatar - 1) * 2 - 1 - differentWithMaxLength;
                }
                break;
            case widthDifference > 20:
                if (22 - numberOfAvatar * 2 < displayAmountLength) {
                    toSubtract = (numberOfAvatar - 2) * 2 - differentWithMaxLength;
                }
                break;
            default:
                if (displayAmountLength + numberOfAvatar === 21) {
                    toSubtract = 3;
                }
                break;
        }
    }
    return {
        fontSize: baseFontSize - toSubtract,
        lineHeight: baseLineHeight - toSubtract,
    };
}
/**
 * Get transparent color by setting alpha value 0 of the passed hex(#xxxxxx) color code
 */
function getTransparentColor(color) {
    return "".concat(color, "00");
}
function getOpacityStyle(opacity) {
    return { opacity: opacity };
}
function getMultiGestureCanvasContainerStyle(canvasWidth) {
    return {
        width: canvasWidth,
        overflow: 'hidden',
    };
}
function percentage(percentageValue, totalValue) {
    return (totalValue / 100) * percentageValue;
}
/**
 * Calculates the width in px of characters from 0 to 9 and '.'
 */
function getCharacterWidth(character) {
    var defaultWidth = 8;
    if (character === '.') {
        return percentage(25, defaultWidth);
    }
    var number = +character;
    // The digit '1' is 62.5% smaller than the default width
    if (number === 1) {
        return percentage(62.5, defaultWidth);
    }
    if (number >= 2 && number <= 5) {
        return defaultWidth;
    }
    if (number === 7) {
        return percentage(87.5, defaultWidth);
    }
    if ((number >= 6 && number <= 9) || number === 0) {
        return percentage(112.5, defaultWidth);
    }
    return defaultWidth;
}
function getAmountWidth(amount) {
    var width = 0;
    for (var i = 0; i < amount.length; i++) {
        width += getCharacterWidth(amount.charAt(i));
    }
    return width;
}
/**
 * When the item is selected and disabled, we want selected item styles.
 * When the item is focused and disabled, we want disabled item styles.
 * Single true value will give result accordingly.
 */
function getItemBackgroundColorStyle(isSelected, isFocused, isDisabled, selectedBG, focusedBG) {
    if (isSelected) {
        return { backgroundColor: selectedBG };
    }
    if (isDisabled) {
        return { backgroundColor: undefined };
    }
    if (isFocused) {
        return { backgroundColor: focusedBG };
    }
    return {};
}
var staticStyleUtils = {
    positioning: positioning_1.default,
    searchHeaderDefaultOffset: searchHeaderDefaultOffset_1.default,
    combineStyles: combineStyles,
    displayIfTrue: displayIfTrue,
    getAmountFontSizeAndLineHeight: getAmountFontSizeAndLineHeight,
    getAutoCompleteSuggestionContainerStyle: getAutoCompleteSuggestionContainerStyle,
    getAvatarBorderRadius: getAvatarBorderRadius,
    getAvatarBorderStyle: getAvatarBorderStyle,
    getAvatarBorderWidth: getAvatarBorderWidth,
    getAvatarExtraFontSizeStyle: getAvatarExtraFontSizeStyle,
    getAvatarSize: getAvatarSize,
    getAvatarWidthStyle: getAvatarWidthStyle,
    getAvatarSubscriptIconContainerStyle: getAvatarSubscriptIconContainerStyle,
    getBackgroundAndBorderStyle: getBackgroundAndBorderStyle,
    getBackgroundColorStyle: getBackgroundColorStyle,
    getBackgroundColorWithOpacityStyle: getBackgroundColorWithOpacityStyle,
    getPaddingLeft: getPaddingLeft,
    getPaddingRight: getPaddingRight,
    getPaddingBottom: getPaddingBottom,
    hasSafeAreas: hasSafeAreas,
    getHeight: getHeight,
    getMinimumHeight: getMinimumHeight,
    getMinimumWidth: getMinimumWidth,
    getMaximumHeight: getMaximumHeight,
    getMaximumWidth: getMaximumWidth,
    getHorizontalStackedAvatarBorderStyle: getHorizontalStackedAvatarBorderStyle,
    getHorizontalStackedAvatarStyle: getHorizontalStackedAvatarStyle,
    getHorizontalStackedOverlayAvatarStyle: getHorizontalStackedOverlayAvatarStyle,
    getMoneyRequestReportPreviewStyle: getMoneyRequestReportPreviewStyle_1.default,
    getReportWelcomeBackgroundImageStyle: getReportWelcomeBackgroundImageStyle,
    getReportWelcomeBackgroundContainerStyle: getReportWelcomeBackgroundContainerStyle,
    getBaseAutoCompleteSuggestionContainerStyle: getBaseAutoCompleteSuggestionContainerStyle,
    getBorderColorStyle: getBorderColorStyle,
    getCheckboxPressableStyle: getCheckboxPressableStyle,
    getComposeTextAreaPadding: getComposeTextAreaPadding,
    getColorStyle: getColorStyle,
    getDefaultWorkspaceAvatarColor: getDefaultWorkspaceAvatarColor,
    getBackgroundColorAndFill: getBackgroundColorAndFill,
    getDirectionStyle: getDirectionStyle,
    getDropDownButtonHeight: getDropDownButtonHeight,
    getEmojiPickerListHeight: getEmojiPickerListHeight,
    getEmojiPickerStyle: getEmojiPickerStyle,
    getEmojiReactionBubbleTextStyle: getEmojiReactionBubbleTextStyle,
    getTransformScaleStyle: getTransformScaleStyle,
    getCodeFontSize: getCodeFontSize,
    getFontSizeStyle: getFontSizeStyle,
    getLineHeightStyle: getLineHeightStyle,
    getMenuItemTextContainerStyle: getMenuItemTextContainerStyle,
    getMenuItemIconStyle: getMenuItemIconStyle,
    getModalPaddingStyles: getModalPaddingStyles,
    getOuterModalStyle: getOuterModalStyle,
    getPaymentMethodMenuWidth: getPaymentMethodMenuWidth,
    getSafeAreaInsets: getSafeAreaInsets_1.default,
    getSafeAreaMargins: getSafeAreaMargins,
    getPlatformSafeAreaPadding: getPlatformSafeAreaPadding,
    getSignInWordmarkWidthStyle: getSignInWordmarkWidthStyle,
    getTextColorStyle: getTextColorStyle,
    getTransparentColor: getTransparentColor,
    getWidthAndHeightStyle: getWidthAndHeightStyle,
    getWidthStyle: getWidthStyle,
    getWrappingStyle: getWrappingStyle,
    getZoomSizingStyle: getZoomSizingStyle,
    parseStyleAsArray: parseStyleAsArray,
    parseStyleFromFunction: parseStyleFromFunction,
    getEReceiptColorStyles: getEReceiptColorStyles,
    getEReceiptColorCode: getEReceiptColorCode,
    getFileExtensionColorCode: getFileExtensionColorCode,
    getNavigationModalCardStyle: getNavigationModalCardStyles_1.default,
    getCardStyles: cardStyles_1.default,
    getSearchPageNarrowHeaderStyles: searchPageNarrowHeaderStyles_1.default,
    getOpacityStyle: getOpacityStyle,
    getMultiGestureCanvasContainerStyle: getMultiGestureCanvasContainerStyle,
    getSignInBgStyles: getSignInBgStyles_1.default,
    getIconWidthAndHeightStyle: getIconWidthAndHeightStyle,
    getButtonStyleWithIcon: getButtonStyleWithIcon,
    getCharacterWidth: getCharacterWidth,
    getAmountWidth: getAmountWidth,
    getBorderRadiusStyle: getBorderRadiusStyle,
    getHighResolutionInfoWrapperStyle: getHighResolutionInfoWrapperStyle_1.default,
    getItemBackgroundColorStyle: getItemBackgroundColorStyle,
    getNavigationBarType: index_1.default,
    getSuccessReportCardLostIllustrationStyle: getSuccessReportCardLostIllustrationStyle_1.default,
};
var createStyleUtils = function (theme, styles) { return (__assign(__assign(__assign(__assign(__assign({}, staticStyleUtils), (0, ModalStyleUtils_1.default)({ theme: theme, styles: styles })), (0, TooltipStyleUtils_1.default)({ theme: theme, styles: styles })), (0, ReportActionContextMenuStyleUtils_1.default)({ theme: theme, styles: styles })), { getCompactContentContainerStyles: function () { return (0, optionRowStyles_1.compactContentContainerStyles)(styles); }, getContextMenuItemStyles: function (windowWidth) { return (0, getContextMenuItemStyles_1.default)(styles, windowWidth); }, getContainerComposeStyles: function () { return (0, containerComposeStyles_1.default)(styles); }, 
    /**
     * Gets styles for AutoCompleteSuggestion row
     */
    getAutoCompleteSuggestionItemStyle: function (highlightedEmojiIndex, rowHeight, isHovered, currentEmojiIndex) {
        var backgroundColor;
        if (currentEmojiIndex === highlightedEmojiIndex) {
            backgroundColor = theme.activeComponentBG;
        }
        else if (isHovered) {
            backgroundColor = theme.hoverComponentBG;
        }
        return [
            {
                height: rowHeight,
                justifyContent: 'center',
            },
            backgroundColor
                ? {
                    backgroundColor: backgroundColor,
                }
                : {},
        ];
    }, 
    /**
     * Returns auto grow height text input style
     */
    getAutoGrowHeightInputStyle: function (textInputHeight, maxHeight) {
        if (textInputHeight > maxHeight) {
            return __assign(__assign({}, styles.pr0), styles.overflowAuto);
        }
        return __assign(__assign(__assign({}, styles.pr0), styles.overflowHidden), { 
            // maxHeight is not of the input only but the of the whole input container
            // which also includes the top padding and bottom border
            height: maxHeight - styles.textInputMultilineContainer.paddingTop - styles.textInputContainer.borderWidth * 2 });
    }, 
    /*
     * Returns styles for the text input container, with extraSpace allowing overflow without affecting the layout.
     */
    getAutoGrowWidthInputContainerStyles: function (width, extraSpace, marginSide) {
        var _a;
        if (!!width && !!extraSpace) {
            var marginKey = marginSide === 'left' ? 'marginLeft' : 'marginRight';
            return _a = {}, _a[marginKey] = -extraSpace, _a.width = width + extraSpace, _a;
        }
        return { width: width };
    }, 
    /*
     * Returns the actual maxHeight of the auto-growing markdown text input.
     */
    getMarkdownMaxHeight: function (maxAutoGrowHeight) {
        // maxHeight is not of the input only but the of the whole input container
        // which also includes the top padding and bottom border
        return maxAutoGrowHeight ? { maxHeight: maxAutoGrowHeight - styles.textInputMultilineContainer.paddingTop - styles.textInputContainer.borderWidth * 2 } : {};
    }, 
    /**
     * Computes styles for the text input icon container.
     * Applies horizontal padding if requested, and sets the top margin based on the presence of a label.
     */
    getTextInputIconContainerStyles: function (hasLabel, includePadding) {
        if (includePadding === void 0) { includePadding = true; }
        var paddingStyle = includePadding ? { paddingHorizontal: 11 } : {};
        return __assign(__assign({}, paddingStyle), { marginTop: hasLabel ? 8 : 16 });
    }, 
    /**
     * Return the style from an avatar size constant
     */
    getAvatarStyle: function (size) {
        var avatarSize = getAvatarSize(size);
        return {
            height: avatarSize,
            width: avatarSize,
            borderRadius: avatarSize,
            backgroundColor: theme.border,
        };
    }, 
    /**
     * Generate a style for the background color of the Badge
     */
    getBadgeColorStyle: function (isSuccess, isError, isPressed, isAdHoc) {
        if (isPressed === void 0) { isPressed = false; }
        if (isAdHoc === void 0) { isAdHoc = false; }
        if (isSuccess) {
            if (isAdHoc) {
                return isPressed ? styles.badgeAdHocSuccessPressed : styles.badgeAdHocSuccess;
            }
            return isPressed ? styles.badgeSuccessPressed : styles.badgeSuccess;
        }
        if (isError) {
            return isPressed ? styles.badgeDangerPressed : styles.badgeDanger;
        }
        return {};
    }, getIconColorStyle: function (isSuccess, isError) {
        if (isSuccess) {
            return theme.iconSuccessFill;
        }
        if (isError) {
            return theme.iconDangerFill;
        }
        return theme.icon;
    }, getEnvironmentBadgeStyle: function (isSuccess, isError, isAdhoc) {
        if (isAdhoc) {
            return styles.badgeAdHocSuccess;
        }
        if (isSuccess) {
            return styles.badgeEnvironmentSuccess;
        }
        if (isError) {
            return styles.badgeEnvironmentDanger;
        }
        return {};
    }, 
    /**
     * Generate a style for the background color of the button, based on its current state.
     *
     * @param buttonState - One of {'default', 'hovered', 'pressed'}
     * @param isMenuItem - whether this button is apart of a list
     */
    getButtonBackgroundColorStyle: function (buttonState, isMenuItem) {
        if (buttonState === void 0) { buttonState = CONST_1.default.BUTTON_STATES.DEFAULT; }
        if (isMenuItem === void 0) { isMenuItem = false; }
        switch (buttonState) {
            case CONST_1.default.BUTTON_STATES.PRESSED:
                return isMenuItem ? { backgroundColor: theme.buttonHoveredBG } : { backgroundColor: theme.buttonPressedBG };
            case CONST_1.default.BUTTON_STATES.ACTIVE:
                return isMenuItem ? { backgroundColor: theme.border } : { backgroundColor: theme.buttonHoveredBG };
            case CONST_1.default.BUTTON_STATES.DISABLED:
            case CONST_1.default.BUTTON_STATES.DEFAULT:
            default:
                return {};
        }
    }, 
    /**
     * Returns the checkbox container style
     */
    getCheckboxContainerStyle: function (size, borderRadius) {
        if (borderRadius === void 0) { borderRadius = 4; }
        return ({
            backgroundColor: theme.componentBG,
            height: size,
            width: size,
            borderColor: theme.borderLighter,
            borderWidth: 2,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: borderRadius,
            margin: 2,
        });
    }, 
    /**
     * Select the correct color for text.
     */
    getColoredBackgroundStyle: function (isColored) { return ({ backgroundColor: isColored ? theme.mentionBG : undefined }); }, 
    /**
     * Returns link styles based on whether the link is disabled or not
     */
    getDisabledLinkStyles: function (isDisabled) {
        if (isDisabled === void 0) { isDisabled = false; }
        var disabledLinkStyles = __assign({ color: theme.textSupporting }, styles.cursorDisabled);
        return __assign(__assign({}, styles.link), (isDisabled ? disabledLinkStyles : {}));
    }, 
    /**
     * Get the style for the AM and PM buttons in the TimePicker
     */
    getStatusAMandPMButtonStyle: function (amPmValue) {
        var computedStyleForAM = amPmValue !== CONST_1.default.TIME_PERIOD.AM ? { backgroundColor: theme.componentBG } : {};
        var computedStyleForPM = amPmValue !== CONST_1.default.TIME_PERIOD.PM ? { backgroundColor: theme.componentBG } : {};
        return {
            styleForAM: [styles.timePickerWidth72, computedStyleForAM],
            styleForPM: [styles.timePickerWidth72, computedStyleForPM],
        };
    }, 
    /**
     * Get the styles of the text next to dot indicators
     */
    getDotIndicatorTextStyles: function (isErrorText) {
        if (isErrorText === void 0) { isErrorText = true; }
        return (isErrorText ? __assign(__assign({}, styles.offlineFeedback.text), { color: styles.formError.color }) : __assign({}, styles.offlineFeedback.text));
    }, getEmojiReactionBubbleStyle: function (isHovered, hasUserReacted, isContextMenu) {
        if (isContextMenu === void 0) { isContextMenu = false; }
        var backgroundColor = theme.border;
        if (isHovered) {
            backgroundColor = theme.buttonHoveredBG;
        }
        if (hasUserReacted) {
            backgroundColor = theme.reactionActiveBackground;
        }
        if (isContextMenu) {
            return {
                paddingVertical: 3,
                paddingHorizontal: 12,
                backgroundColor: backgroundColor,
            };
        }
        return {
            paddingVertical: 2,
            paddingHorizontal: 8,
            backgroundColor: backgroundColor,
        };
    }, getEmojiReactionCounterTextStyle: function (hasUserReacted) {
        if (hasUserReacted) {
            return { color: theme.reactionActiveText };
        }
        return { color: theme.text };
    }, getErrorPageContainerStyle: function (safeAreaPaddingBottom) {
        if (safeAreaPaddingBottom === void 0) { safeAreaPaddingBottom = 0; }
        return ({
            backgroundColor: theme.componentBG,
            paddingBottom: 40 + safeAreaPaddingBottom,
        });
    }, getGoogleListViewStyle: function (shouldDisplayBorder) {
        if (shouldDisplayBorder) {
            return __assign(__assign(__assign({}, styles.borderTopRounded), styles.borderBottomRounded), { marginTop: 4, paddingVertical: 6 });
        }
        return {
            transform: 'scale(0)',
        };
    }, 
    /**
     * Return the height of magic code input container
     */
    getHeightOfMagicCodeInput: function () { return ({ height: styles.magicCodeInputContainer.height - styles.textInputContainer.borderWidth * 2 }); }, 
    /**
     * Generate fill color of an icon based on its state.
     *
     * @param buttonState - One of {'default', 'hovered', 'pressed'}
     * @param isMenuIcon - whether this icon is apart of a list
     * @param isPane - whether this icon is in a pane, e.g. Account or Workspace Settings
     */
    getIconFillColor: function (buttonState, isMenuIcon, isPane) {
        if (buttonState === void 0) { buttonState = CONST_1.default.BUTTON_STATES.DEFAULT; }
        if (isMenuIcon === void 0) { isMenuIcon = false; }
        if (isPane === void 0) { isPane = false; }
        switch (buttonState) {
            case CONST_1.default.BUTTON_STATES.ACTIVE:
            case CONST_1.default.BUTTON_STATES.PRESSED:
                if (isPane) {
                    return theme.iconMenu;
                }
                return theme.iconHovered;
            case CONST_1.default.BUTTON_STATES.COMPLETE:
                return theme.iconSuccessFill;
            case CONST_1.default.BUTTON_STATES.DEFAULT:
            case CONST_1.default.BUTTON_STATES.DISABLED:
            default:
                if (isMenuIcon && !isPane) {
                    return theme.iconMenu;
                }
                return theme.icon;
        }
    }, 
    /**
     * Returns style object for the user mention component based on whether the mention is ours or not.
     */
    getMentionStyle: function (isOurMention) {
        var backgroundColor = isOurMention ? theme.ourMentionBG : theme.mentionBG;
        return {
            backgroundColor: backgroundColor,
            borderRadius: variables_1.default.componentBorderRadiusSmall,
            paddingHorizontal: 2,
        };
    }, 
    /**
     * Returns text color for the user mention text based on whether the mention is ours or not.
     */
    getMentionTextColor: function (isOurMention) { return (isOurMention ? theme.ourMentionText : theme.mentionText); }, 
    /**
     * Generate the wrapper styles for the mini ReportActionContextMenu.
     */
    getMiniReportActionContextMenuWrapperStyle: function (isReportActionItemGrouped) { return (__assign(__assign(__assign(__assign(__assign({}, (isReportActionItemGrouped ? positioning_1.default.tn8 : positioning_1.default.tn4)), positioning_1.default.r4), styles.cursorDefault), styles.userSelectNone), { overflowAnchor: 'none', position: 'absolute', zIndex: 8 })); }, 
    /**
     * Generate the styles for the ReportActionItem wrapper view.
     */
    getReportActionItemStyle: function (isHovered, isClickable) {
        if (isHovered === void 0) { isHovered = false; }
        if (isClickable === void 0) { isClickable = false; }
        return (__assign({ display: 'flex', justifyContent: 'space-between', backgroundColor: isHovered
                ? theme.hoverComponentBG
                : // Warning: Setting this to a non-transparent color will cause unread indicator to break on Android
                    theme.transparent, opacity: 1 }, (isClickable ? styles.cursorPointer : styles.cursorInitial)));
    }, 
    /**
     * Determines the theme color for a modal based on the app's background color,
     * the modal's backdrop, and the backdrop's opacity.
     *
     * @param bgColor - theme background color
     * @returns The theme color as an RGB value.
     */
    getThemeBackgroundColor: function (bgColor) {
        var _a, _b, _c;
        var backdropOpacity = variables_1.default.overlayOpacity;
        var _d = (_b = (_a = extractValuesFromRGB(bgColor)) !== null && _a !== void 0 ? _a : hexadecimalToRGBArray(bgColor)) !== null && _b !== void 0 ? _b : [], backgroundRed = _d[0], backgroundGreen = _d[1], backgroundBlue = _d[2];
        var _e = (_c = hexadecimalToRGBArray(theme.overlay)) !== null && _c !== void 0 ? _c : [], backdropRed = _e[0], backdropGreen = _e[1], backdropBlue = _e[2];
        var normalizedBackdropRGB = convertRGBToUnitValues(backdropRed, backdropGreen, backdropBlue);
        var normalizedBackgroundRGB = convertRGBToUnitValues(backgroundRed, backgroundGreen, backgroundBlue);
        var _f = convertRGBAToRGB(normalizedBackdropRGB, normalizedBackgroundRGB, backdropOpacity), red = _f[0], green = _f[1], blue = _f[2];
        var themeRGB = convertUnitValuesToRGB(red, green, blue);
        return "rgb(".concat(themeRGB.join(', '), ")");
    }, getZoomCursorStyle: function (isZoomed, isDragging) {
        if (!isZoomed) {
            return styles.cursorZoomIn;
        }
        return isDragging ? styles.cursorGrabbing : styles.cursorZoomOut;
    }, getReportTableColumnStyles: function (columnName, isDateColumnWide, isAmountColumnWide, isTaxAmountColumnWide) {
        if (isDateColumnWide === void 0) { isDateColumnWide = false; }
        if (isAmountColumnWide === void 0) { isAmountColumnWide = false; }
        if (isTaxAmountColumnWide === void 0) { isTaxAmountColumnWide = false; }
        var columnWidth;
        switch (columnName) {
            case CONST_1.default.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS:
            case CONST_1.default.SEARCH.TABLE_COLUMNS.RECEIPT:
                columnWidth = __assign(__assign({}, getWidthStyle(variables_1.default.w36)), styles.alignItemsCenter);
                break;
            case CONST_1.default.SEARCH.TABLE_COLUMNS.DATE:
                columnWidth = getWidthStyle(isDateColumnWide ? variables_1.default.w92 : variables_1.default.w52);
                break;
            case CONST_1.default.SEARCH.TABLE_COLUMNS.MERCHANT:
            case CONST_1.default.SEARCH.TABLE_COLUMNS.FROM:
            case CONST_1.default.SEARCH.TABLE_COLUMNS.TO:
            case CONST_1.default.SEARCH.TABLE_COLUMNS.ASSIGNEE:
            case CONST_1.default.SEARCH.TABLE_COLUMNS.TITLE:
            case CONST_1.default.SEARCH.TABLE_COLUMNS.DESCRIPTION:
            case CONST_1.default.SEARCH.TABLE_COLUMNS.IN:
                columnWidth = styles.flex1;
                break;
            case CONST_1.default.SEARCH.TABLE_COLUMNS.CATEGORY:
            case CONST_1.default.SEARCH.TABLE_COLUMNS.TAG:
                columnWidth = __assign(__assign({}, getWidthStyle(variables_1.default.w36)), styles.flex1);
                break;
            case CONST_1.default.SEARCH.TABLE_COLUMNS.TAX_AMOUNT:
                columnWidth = __assign(__assign({}, getWidthStyle(isTaxAmountColumnWide ? variables_1.default.w130 : variables_1.default.w96)), styles.alignItemsEnd);
                break;
            case CONST_1.default.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT:
                columnWidth = __assign(__assign({}, getWidthStyle(isAmountColumnWide ? variables_1.default.w130 : variables_1.default.w96)), styles.alignItemsEnd);
                break;
            case CONST_1.default.SEARCH.TABLE_COLUMNS.TYPE:
                columnWidth = __assign(__assign({}, getWidthStyle(variables_1.default.w20)), styles.alignItemsCenter);
                break;
            case CONST_1.default.SEARCH.TABLE_COLUMNS.ACTION:
                columnWidth = __assign(__assign({}, getWidthStyle(variables_1.default.w80)), styles.alignItemsCenter);
                break;
            default:
                columnWidth = styles.flex1;
        }
        return columnWidth;
    }, getTextOverflowStyle: function (overflow) { return ({
        textOverflow: overflow,
    }); }, 
    /**
     * Returns container styles for showing the icons in MultipleAvatars/SubscriptAvatar
     */
    getContainerStyles: function (size, isInReportAction) {
        if (isInReportAction === void 0) { isInReportAction = false; }
        var containerStyles;
        switch (size) {
            case CONST_1.default.AVATAR_SIZE.SMALL:
                containerStyles = [styles.emptyAvatarSmall, styles.emptyAvatarMarginSmall];
                break;
            case CONST_1.default.AVATAR_SIZE.SMALLER:
                containerStyles = [styles.emptyAvatarSmaller, styles.emptyAvatarMarginSmaller];
                break;
            case CONST_1.default.AVATAR_SIZE.MEDIUM:
                containerStyles = [styles.emptyAvatarMedium, styles.emptyAvatarMargin];
                break;
            case CONST_1.default.AVATAR_SIZE.LARGE:
                containerStyles = [styles.emptyAvatarLarge, styles.mb2, styles.mr2];
                break;
            default:
                containerStyles = [styles.emptyAvatar, isInReportAction ? styles.emptyAvatarMarginChat : styles.emptyAvatarMargin];
        }
        return containerStyles;
    }, getUpdateRequiredViewStyles: function (isSmallScreenWidth) { return [
        __assign({ alignItems: 'center', justifyContent: 'center' }, (isSmallScreenWidth ? {} : styles.pb40)),
    ]; }, 
    /**
     * Returns a style that sets the maximum height of the composer based on the number of lines and whether the composer is full size or not.
     */
    getComposerMaxHeightStyle: function (maxLines, isComposerFullSize) {
        var _a;
        if (isComposerFullSize || maxLines == null) {
            return {};
        }
        var composerLineHeight = (_a = styles.textInputCompose.lineHeight) !== null && _a !== void 0 ? _a : 0;
        return {
            maxHeight: maxLines * composerLineHeight,
        };
    }, getFullscreenCenteredContentStyles: function () { return [react_native_1.StyleSheet.absoluteFill, styles.justifyContentCenter, styles.alignItemsCenter]; }, 
    /**
     * Returns the styles for the Tools modal
     */
    getTestToolsModalStyle: function (windowWidth) { return [styles.settingsPageBody, styles.p5, { width: windowWidth * 0.9 }]; }, getMultiselectListStyles: function (isSelected, isDisabled) { return (__assign(__assign(__assign(__assign({}, (isSelected && styles.checkedContainer)), (isSelected && styles.borderColorFocus)), (isDisabled && styles.cursorDisabled)), (isDisabled && styles.buttonOpacityDisabled))); }, 
    /**
     * When adding a new prefix character, adjust this method to add expected character width.
     * This is because character width isn't known before it's rendered to the screen, and once it's rendered,
     * it's too late to calculate it's width because the change in padding would cause a visible jump.
     * Some characters are wider than the others when rendered, e.g. '@' vs '#'. Chosen font-family and font-size
     * also have an impact on the width of the character, but as long as there's only one font-family and one font-size,
     * this method will produce reliable results.
     */
    getCharacterPadding: function (prefix) {
        var padding = 0;
        prefix.split('').forEach(function (char) {
            if (char.match(/[a-z]/i) && char === char.toUpperCase()) {
                padding += 11;
            }
            else {
                padding += 8;
            }
        });
        return padding;
    }, 
    // TODO: remove it when we'll implement the callback to handle this toggle in Expensify/Expensify#368335
    getWorkspaceWorkflowsOfflineDescriptionStyle: function (descriptionTextStyle) { return (__assign(__assign({}, react_native_1.StyleSheet.flatten(descriptionTextStyle)), { opacity: styles.opacitySemiTransparent.opacity })); }, getTripReservationIconContainer: function (isSmallIcon) { return ({
        width: isSmallIcon ? variables_1.default.avatarSizeSmallNormal : variables_1.default.avatarSizeNormal,
        height: isSmallIcon ? variables_1.default.avatarSizeSmallNormal : variables_1.default.avatarSizeNormal,
        borderRadius: isSmallIcon ? variables_1.default.avatarSizeSmallNormal : variables_1.default.componentBorderRadiusXLarge,
        backgroundColor: theme.border,
        alignItems: 'center',
        justifyContent: 'center',
    }); }, getTaskPreviewIconWrapper: function (avatarSize) { return (__assign({ height: avatarSize ? getAvatarSize(avatarSize) : variables_1.default.fontSizeNormalHeight }, styles.justifyContentCenter)); }, getTaskPreviewTitleStyle: function (iconHeight, isTaskCompleted) { return [
        styles.flex1,
        isTaskCompleted ? [styles.textSupporting, styles.textLineThrough] : [],
        { marginTop: (iconHeight - variables_1.default.fontSizeNormalHeight) / 2 },
    ]; }, getResetStyle: function (keys) {
        return keys.reduce(function (styleObj, key) {
            // eslint-disable-next-line no-param-reassign
            styleObj[key] = null;
            return styleObj;
        }, {});
    } })); };
var DefaultStyleUtils = createStyleUtils(theme_1.defaultTheme, __1.defaultStyles);
exports.DefaultStyleUtils = DefaultStyleUtils;
exports.default = createStyleUtils;
