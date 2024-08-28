import {StyleSheet} from 'react-native';
import type {AnimatableNumericValue, Animated, ColorValue, ImageStyle, PressableStateCallbackType, StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {EdgeInsets} from 'react-native-safe-area-context';
import type {ValueOf} from 'type-fest';
import type ImageSVGProps from '@components/ImageSVG/types';
import * as Browser from '@libs/Browser';
import * as UserUtils from '@libs/UserUtils';
// eslint-disable-next-line no-restricted-imports
import {defaultTheme} from '@styles/theme';
import colors from '@styles/theme/colors';
import type {ThemeColors} from '@styles/theme/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import {defaultStyles} from '..';
import type {ThemeStyles} from '..';
import shouldPreventScrollOnAutoCompleteSuggestion from './autoCompleteSuggestion';
import getCardStyles from './cardStyles';
import containerComposeStyles from './containerComposeStyles';
import createModalStyleUtils from './generators/ModalStyleUtils';
import createReportActionContextMenuStyleUtils from './generators/ReportActionContextMenuStyleUtils';
import createTooltipStyleUtils from './generators/TooltipStyleUtils';
import getContextMenuItemStyles from './getContextMenuItemStyles';
import getHighResolutionInfoWrapperStyle from './getHighResolutionInfoWrapperStyle';
import getNavigationModalCardStyle from './getNavigationModalCardStyles';
import getSignInBgStyles from './getSignInBgStyles';
import {compactContentContainerStyles} from './optionRowStyles';
import positioning from './positioning';
import type {
    AllStyles,
    AvatarSize,
    AvatarSizeName,
    AvatarSizeValue,
    AvatarStyle,
    ButtonSizeValue,
    ButtonStateName,
    EReceiptColorName,
    EreceiptColorStyle,
    ParsableStyle,
    SVGAvatarColorStyle,
    TextColorStyle,
} from './types';

const workspaceColorOptions: SVGAvatarColorStyle[] = [
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

const eReceiptColorStyles: Partial<Record<EReceiptColorName, EreceiptColorStyle>> = {
    [CONST.ERECEIPT_COLORS.YELLOW]: {backgroundColor: colors.yellow600, color: colors.yellow100},
    [CONST.ERECEIPT_COLORS.ICE]: {backgroundColor: colors.blue800, color: colors.ice400},
    [CONST.ERECEIPT_COLORS.BLUE]: {backgroundColor: colors.blue400, color: colors.blue100},
    [CONST.ERECEIPT_COLORS.GREEN]: {backgroundColor: colors.green800, color: colors.green400},
    [CONST.ERECEIPT_COLORS.TANGERINE]: {backgroundColor: colors.tangerine800, color: colors.tangerine400},
    [CONST.ERECEIPT_COLORS.PINK]: {backgroundColor: colors.pink800, color: colors.pink400},
};

const eReceiptColors: EReceiptColorName[] = [
    CONST.ERECEIPT_COLORS.YELLOW,
    CONST.ERECEIPT_COLORS.ICE,
    CONST.ERECEIPT_COLORS.BLUE,
    CONST.ERECEIPT_COLORS.GREEN,
    CONST.ERECEIPT_COLORS.TANGERINE,
    CONST.ERECEIPT_COLORS.PINK,
];

const avatarBorderSizes: Partial<Record<AvatarSizeName, number>> = {
    [CONST.AVATAR_SIZE.SMALL_SUBSCRIPT]: variables.componentBorderRadiusSmall,
    [CONST.AVATAR_SIZE.MID_SUBSCRIPT]: variables.componentBorderRadiusSmall,
    [CONST.AVATAR_SIZE.SUBSCRIPT]: variables.componentBorderRadiusMedium,
    [CONST.AVATAR_SIZE.SMALLER]: variables.componentBorderRadiusMedium,
    [CONST.AVATAR_SIZE.SMALL]: variables.componentBorderRadiusMedium,
    [CONST.AVATAR_SIZE.HEADER]: variables.componentBorderRadiusMedium,
    [CONST.AVATAR_SIZE.DEFAULT]: variables.componentBorderRadiusNormal,
    [CONST.AVATAR_SIZE.MEDIUM]: variables.componentBorderRadiusLarge,
    [CONST.AVATAR_SIZE.LARGE]: variables.componentBorderRadiusLarge,
    [CONST.AVATAR_SIZE.XLARGE]: variables.componentBorderRadiusLarge,
    [CONST.AVATAR_SIZE.LARGE_BORDERED]: variables.componentBorderRadiusRounded,
    [CONST.AVATAR_SIZE.SMALL_NORMAL]: variables.componentBorderRadiusMedium,
};

const avatarSizes: Record<AvatarSizeName, AvatarSizeValue> = {
    [CONST.AVATAR_SIZE.DEFAULT]: variables.avatarSizeNormal,
    [CONST.AVATAR_SIZE.SMALL_SUBSCRIPT]: variables.avatarSizeSmallSubscript,
    [CONST.AVATAR_SIZE.MID_SUBSCRIPT]: variables.avatarSizeMidSubscript,
    [CONST.AVATAR_SIZE.SUBSCRIPT]: variables.avatarSizeSubscript,
    [CONST.AVATAR_SIZE.SMALL]: variables.avatarSizeSmall,
    [CONST.AVATAR_SIZE.SMALLER]: variables.avatarSizeSmaller,
    [CONST.AVATAR_SIZE.LARGE]: variables.avatarSizeLarge,
    [CONST.AVATAR_SIZE.XLARGE]: variables.avatarSizeXLarge,
    [CONST.AVATAR_SIZE.MEDIUM]: variables.avatarSizeMedium,
    [CONST.AVATAR_SIZE.LARGE_BORDERED]: variables.avatarSizeLargeBordered,
    [CONST.AVATAR_SIZE.HEADER]: variables.avatarSizeHeader,
    [CONST.AVATAR_SIZE.MENTION_ICON]: variables.avatarSizeMentionIcon,
    [CONST.AVATAR_SIZE.SMALL_NORMAL]: variables.avatarSizeSmallNormal,
};

const avatarFontSizes: Partial<Record<AvatarSizeName, number>> = {
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

const avatarBorderWidths: Partial<Record<AvatarSizeName, number>> = {
    [CONST.AVATAR_SIZE.DEFAULT]: 3,
    [CONST.AVATAR_SIZE.SMALL_SUBSCRIPT]: 2,
    [CONST.AVATAR_SIZE.MID_SUBSCRIPT]: 2,
    [CONST.AVATAR_SIZE.SUBSCRIPT]: 2,
    [CONST.AVATAR_SIZE.SMALL]: 2,
    [CONST.AVATAR_SIZE.SMALLER]: 2,
    [CONST.AVATAR_SIZE.LARGE]: 4,
    [CONST.AVATAR_SIZE.MEDIUM]: 3,
    [CONST.AVATAR_SIZE.LARGE_BORDERED]: 4,
};

/**
 * Converts a color in hexadecimal notation into RGB notation.
 *
 * @param hexadecimal A color in hexadecimal notation.
 * @returns `undefined` if the input color is not in hexadecimal notation. Otherwise, the RGB components of the input color.
 */
function hexadecimalToRGBArray(hexadecimal: string): number[] | undefined {
    const components = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexadecimal);

    if (components === null) {
        return undefined;
    }

    return components.slice(1).map((component) => parseInt(component, 16));
}

/**
 * Converts a color in RGBA notation to an equivalent color in RGB notation.
 *
 * @param foregroundRGB The three components of the foreground color in RGB notation.
 * @param backgroundRGB The three components of the background color in RGB notation.
 * @param opacity The desired opacity of the foreground color.
 * @returns The RGB components of the RGBA color converted to RGB.
 */
function convertRGBAToRGB(foregroundRGB: number[], backgroundRGB: number[], opacity: number): number[] {
    const [foregroundRed, foregroundGreen, foregroundBlue] = foregroundRGB;
    const [backgroundRed, backgroundGreen, backgroundBlue] = backgroundRGB;

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
function convertUnitValuesToRGB(red: number, green: number, blue: number): number[] {
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
function convertRGBToUnitValues(red: number, green: number, blue: number): number[] {
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
function extractValuesFromRGB(color: string): number[] | null {
    const rgbaPattern = /rgba?\((?<r>[.\d]+)[, ]+(?<g>[.\d]+)[, ]+(?<b>[.\d]+)(?:\s?[,/]\s?(?<a>[.\d]+%?))?\)$/i;
    const matchRGBA = color.match(rgbaPattern);
    if (matchRGBA) {
        const [, red, green, blue, alpha] = matchRGBA;
        return [parseInt(red, 10), parseInt(green, 10), parseInt(blue, 10), alpha ? parseFloat(alpha) : 1];
    }

    return null;
}

/**
 * Return the style size from an avatar size constant
 */
function getAvatarSize(size: AvatarSizeName): number {
    return avatarSizes[size];
}

/**
 * Return the width style from an avatar size constant
 */
function getAvatarWidthStyle(size: AvatarSizeName): ViewStyle {
    const avatarSize = getAvatarSize(size);
    return {
        width: avatarSize,
    };
}

/**
 * Get Font size of '+1' text on avatar overlay
 */
function getAvatarExtraFontSizeStyle(size: AvatarSizeName): TextStyle {
    return {
        fontSize: avatarFontSizes[size],
    };
}

/**
 * Get Bordersize of Avatar based on avatar size
 */
function getAvatarBorderWidth(size: AvatarSizeName): ViewStyle {
    return {
        borderWidth: avatarBorderWidths[size],
    };
}

/**
 * Return the border radius for an avatar
 */
function getAvatarBorderRadius(size: AvatarSizeName, type?: string): ViewStyle {
    if (type === CONST.ICON_TYPE_WORKSPACE) {
        return {borderRadius: avatarBorderSizes[size]};
    }

    // Default to rounded border
    return {borderRadius: variables.buttonBorderRadius};
}

/**
 * Return the border style for an avatar
 */
function getAvatarBorderStyle(size: AvatarSizeName, type: string): ViewStyle {
    return {
        overflow: 'hidden',
        ...getAvatarBorderRadius(size, type),
    };
}

/**
 * Helper method to return workspace avatar color styles
 */
function getDefaultWorkspaceAvatarColor(text: string): ViewStyle {
    const colorHash = UserUtils.hashText(text.trim(), workspaceColorOptions.length);

    return workspaceColorOptions[colorHash];
}

/**
 * Helper method to return formatted backgroundColor and fill styles
 */
function getBackgroundColorAndFill(backgroundColor: string, fill: string): SVGAvatarColorStyle {
    return {backgroundColor, fill};
}

/**
 * Helper method to return eReceipt color code
 */
function getEReceiptColorCode(transaction: OnyxEntry<Transaction>): EReceiptColorName {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const transactionID = transaction?.parentTransactionID || transaction?.transactionID || '';

    const colorHash = UserUtils.hashText(transactionID.trim(), eReceiptColors.length);

    return eReceiptColors[colorHash];
}

/**
 * Helper method to return eReceipt color code for Receipt Thumbnails
 */
function getFileExtensionColorCode(fileExtension?: string): EReceiptColorName {
    switch (fileExtension) {
        case CONST.IOU.FILE_TYPES.DOC:
            return CONST.ERECEIPT_COLORS.PINK;
        case CONST.IOU.FILE_TYPES.HTML:
            return CONST.ERECEIPT_COLORS.TANGERINE;
        default:
            return CONST.ERECEIPT_COLORS.GREEN;
    }
}

/**
 * Helper method to return eReceipt color styles
 */
function getEReceiptColorStyles(colorCode: EReceiptColorName): EreceiptColorStyle | undefined {
    return eReceiptColorStyles[colorCode];
}

type SafeAreaPadding = {
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
};

/**
 * Takes safe area insets and returns padding to use for a View
 */
function getSafeAreaPadding(insets?: EdgeInsets, insetsPercentage: number = variables.safeInsertPercentage): SafeAreaPadding {
    return {
        paddingTop: insets?.top ?? 0,
        paddingBottom: (insets?.bottom ?? 0) * insetsPercentage,
        paddingLeft: (insets?.left ?? 0) * insetsPercentage,
        paddingRight: (insets?.right ?? 0) * insetsPercentage,
    };
}

/**
 * Takes safe area insets and returns margin to use for a View
 */
function getSafeAreaMargins(insets?: EdgeInsets): ViewStyle {
    return {marginBottom: (insets?.bottom ?? 0) * variables.safeInsertPercentage};
}

function getZoomSizingStyle(
    isZoomed: boolean,
    imgWidth: number,
    imgHeight: number,
    zoomScale: number,
    containerHeight: number,
    containerWidth: number,
    isLoading: boolean,
): ViewStyle | undefined {
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
 * Returns a style with width set to the specified number
 */
function getWidthStyle(width: number): ViewStyle & ImageStyle {
    return {
        width,
    };
}

/**
 * Returns a style with border radius set to the specified number
 */
function getBorderRadiusStyle(borderRadius: number): ViewStyle & ImageStyle {
    return {
        borderRadius,
    };
}

/**
 * Returns a style with backgroundColor and borderColor set to the same color
 */
function getBackgroundAndBorderStyle(backgroundColor: ColorValue | undefined): ViewStyle {
    return {
        backgroundColor,
        borderColor: backgroundColor,
    };
}

/**
 * Returns a style with the specified backgroundColor
 */
function getBackgroundColorStyle(backgroundColor: ColorValue): ViewStyle {
    return {
        backgroundColor,
    };
}

/**
 * Returns a style for text color
 */
function getTextColorStyle(color: string): TextColorStyle {
    return {
        color,
    };
}

/**
 * Returns a style with the specified borderColor
 */
function getBorderColorStyle(borderColor: string): ViewStyle {
    return {
        borderColor,
    };
}

/**
 * Returns the width style for the wordmark logo on the sign in page
 */
function getSignInWordmarkWidthStyle(isSmallScreenWidth: boolean, environment: ValueOf<typeof CONST.ENVIRONMENT>): ViewStyle {
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
 * Returns a background color with opacity style
 */
function getBackgroundColorWithOpacityStyle(backgroundColor: string, opacity: number): ViewStyle {
    const result = hexadecimalToRGBArray(backgroundColor);
    if (result !== undefined) {
        return {
            backgroundColor: `rgba(${result[0]}, ${result[1]}, ${result[2]}, ${opacity})`,
        };
    }
    return {};
}

function getWidthAndHeightStyle(width: number, height?: number): Pick<ViewStyle, 'height' | 'width'> {
    return {
        width,
        height: height ?? width,
    };
}

function getIconWidthAndHeightStyle(small: boolean, medium: boolean, large: boolean, width: number, height: number, hasText?: boolean): Pick<ImageSVGProps, 'width' | 'height'> {
    switch (true) {
        case small:
            return {width: hasText ? variables.iconSizeExtraSmall : variables.iconSizeSmall, height: hasText ? variables.iconSizeExtraSmall : variables?.iconSizeSmall};
        case medium:
            return {width: hasText ? variables.iconSizeSmall : variables.iconSizeNormal, height: hasText ? variables.iconSizeSmall : variables.iconSizeNormal};
        case large:
            return {width: hasText ? variables.iconSizeNormal : variables.iconSizeLarge, height: hasText ? variables.iconSizeNormal : variables.iconSizeLarge};
        default: {
            return {width, height};
        }
    }
}

function getButtonStyleWithIcon(
    styles: ThemeStyles,
    small: boolean,
    medium: boolean,
    large: boolean,
    hasIcon?: boolean,
    hasText?: boolean,
    shouldShowRightIcon?: boolean,
): ViewStyle | undefined {
    const useDefaultButtonStyles = !!(hasIcon && shouldShowRightIcon) || !!(!hasIcon && !shouldShowRightIcon);
    switch (true) {
        case small: {
            const verticalStyle = hasIcon ? styles.pl2 : styles.pr2;
            return useDefaultButtonStyles ? styles.buttonSmall : {...styles.buttonSmall, ...(hasText ? verticalStyle : styles.ph0)};
        }
        case medium: {
            const verticalStyle = hasIcon ? styles.pl3 : styles.pr3;
            return useDefaultButtonStyles ? styles.buttonMedium : {...styles.buttonMedium, ...(hasText ? verticalStyle : styles.ph0)};
        }
        case large: {
            const verticalStyle = hasIcon ? styles.pl4 : styles.pr4;
            return useDefaultButtonStyles ? styles.buttonLarge : {...styles.buttonLarge, ...(hasText ? verticalStyle : styles.ph0)};
        }
        default: {
            if (hasIcon && !hasText) {
                return {...styles.buttonMedium, ...styles.ph0};
            }

            return undefined;
        }
    }
}

type MarginPaddingValue = ViewStyle['marginTop' | 'marginBottom' | 'paddingTop' | 'paddingBottom'];

/**
 * Combine margin/padding with safe area inset
 *
 * @param modalContainerValue - margin or padding value
 * @param safeAreaValue - safe area inset
 * @param shouldAddSafeAreaValue - indicator whether safe area inset should be applied
 */
function getCombinedSpacing(modalContainerValue: MarginPaddingValue, safeAreaValue: number, shouldAddSafeAreaValue: boolean): MarginPaddingValue {
    // modalContainerValue can only be added to safe area inset if it's a number, otherwise it's returned as is
    if (typeof modalContainerValue === 'number') {
        return modalContainerValue + (shouldAddSafeAreaValue ? safeAreaValue : 0);
    }

    if (!modalContainerValue) {
        return shouldAddSafeAreaValue ? safeAreaValue : 0;
    }

    return modalContainerValue;
}

type ModalPaddingStylesParams = {
    shouldAddBottomSafeAreaMargin: boolean;
    shouldAddTopSafeAreaMargin: boolean;
    shouldAddBottomSafeAreaPadding: boolean;
    shouldAddTopSafeAreaPadding: boolean;
    safeAreaPaddingTop: number;
    safeAreaPaddingBottom: number;
    safeAreaPaddingLeft: number;
    safeAreaPaddingRight: number;
    modalContainerStyleMarginTop: MarginPaddingValue;
    modalContainerStyleMarginBottom: MarginPaddingValue;
    modalContainerStylePaddingTop: MarginPaddingValue;
    modalContainerStylePaddingBottom: MarginPaddingValue;
    insets: EdgeInsets;
};

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
}: ModalPaddingStylesParams): ViewStyle {
    // use fallback value for safeAreaPaddingBottom to keep padding bottom consistent with padding top.
    // More info: issue #17376
    const safeAreaPaddingBottomWithFallback = insets.bottom === 0 && typeof modalContainerStylePaddingTop === 'number' ? modalContainerStylePaddingTop ?? 0 : safeAreaPaddingBottom;
    return {
        marginTop: getCombinedSpacing(modalContainerStyleMarginTop, safeAreaPaddingTop, shouldAddTopSafeAreaMargin),
        marginBottom: getCombinedSpacing(modalContainerStyleMarginBottom, safeAreaPaddingBottomWithFallback, shouldAddBottomSafeAreaMargin),
        paddingTop: getCombinedSpacing(modalContainerStylePaddingTop, safeAreaPaddingTop, shouldAddTopSafeAreaPadding),
        paddingBottom: getCombinedSpacing(modalContainerStylePaddingBottom, safeAreaPaddingBottomWithFallback, shouldAddBottomSafeAreaPadding),
        paddingLeft: safeAreaPaddingLeft ?? 0,
        paddingRight: safeAreaPaddingRight ?? 0,
    };
}

/**
 * Returns the font size for the HTML code tag renderer.
 */
function getCodeFontSize(isInsideH1: boolean) {
    return isInsideH1 ? 15 : 13;
}

/**
 * Gives the width for Emoji picker Widget
 */
function getEmojiPickerStyle(isSmallScreenWidth: boolean): ViewStyle {
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

function getPaymentMethodMenuWidth(isSmallScreenWidth: boolean): ViewStyle {
    const margin = 20;
    return {width: !isSmallScreenWidth ? variables.sideBarWidth - margin * 2 : undefined};
}

/**
 * Parse styleParam and return Styles array
 */
function parseStyleAsArray<T extends AllStyles>(styleParam: T | T[]): T[] {
    return Array.isArray(styleParam) ? styleParam : [styleParam];
}

/**
 * Parse style function and return Styles object
 */
function parseStyleFromFunction(style: ParsableStyle, state: PressableStateCallbackType): StyleProp<ViewStyle> {
    return typeof style === 'function' ? style(state) : style;
}

/**
 * Receives any number of object or array style objects and returns them all as an array
 */
function combineStyles<T extends AllStyles>(...allStyles: Array<T | T[]>): T[] {
    let finalStyles: T[] = [];
    allStyles.forEach((style) => {
        finalStyles = finalStyles.concat(parseStyleAsArray(style));
    });
    return finalStyles;
}

/**
 * Get variable padding-left as style
 */
function getPaddingLeft(paddingLeft: number): ViewStyle {
    return {
        paddingLeft,
    };
}

/**
 * Get variable padding-right as style
 */
function getPaddingRight(paddingRight: number): ViewStyle {
    return {
        paddingRight,
    };
}

/**
 * Checks to see if the iOS device has safe areas or not
 */
function hasSafeAreas(windowWidth: number, windowHeight: number): boolean {
    const heightsIphonesWithNotches = [812, 896, 844, 926];
    return heightsIphonesWithNotches.includes(windowHeight) || heightsIphonesWithNotches.includes(windowWidth);
}

/**
 * Get height as style
 */
function getHeight(height: number): ViewStyle {
    return {
        height,
    };
}

/**
 * Get minimum height as style
 */
function getMinimumHeight(minHeight: number): ViewStyle {
    return {
        minHeight,
    };
}

/**
 * Get minimum width as style
 */
function getMinimumWidth(minWidth: number): ViewStyle & ImageStyle {
    return {
        minWidth,
    };
}

/**
 * Get maximum height as style
 */
function getMaximumHeight(maxHeight: number): ViewStyle {
    return {
        maxHeight,
    };
}

/**
 * Get maximum width as style
 */
function getMaximumWidth(maxWidth: number): ViewStyle {
    return {
        maxWidth,
    };
}

/**
 * Return style for opacity animation.
 */
function fade(fadeAnimation: Animated.Value): Animated.WithAnimatedValue<ViewStyle> {
    return {
        opacity: fadeAnimation,
    };
}

type AvatarBorderStyleParams = {
    theme: ThemeColors;
    isHovered: boolean;
    isPressed: boolean;
    isInReportAction: boolean;
    shouldUseCardBackground: boolean;
};

function getHorizontalStackedAvatarBorderStyle({theme, isHovered, isPressed, isInReportAction = false, shouldUseCardBackground = false}: AvatarBorderStyleParams): ViewStyle {
    let borderColor = shouldUseCardBackground ? theme.cardBG : theme.appBG;

    if (isHovered) {
        borderColor = isInReportAction ? theme.hoverComponentBG : theme.border;
    }

    if (isPressed) {
        borderColor = isInReportAction ? theme.hoverComponentBG : theme.buttonPressedBG;
    }

    return {borderColor};
}

/**
 * Get computed avatar styles based on position and border size
 */
function getHorizontalStackedAvatarStyle(index: number, overlapSize: number): ViewStyle {
    return {
        marginLeft: index > 0 ? -overlapSize : 0,
        zIndex: index + 2,
    };
}

/**
 * Get computed avatar styles of '+1' overlay based on size
 */
function getHorizontalStackedOverlayAvatarStyle(oneAvatarSize: AvatarSize, oneAvatarBorderWidth: number): ViewStyle {
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
function getReportWelcomeBackgroundImageStyle(isSmallScreenWidth: boolean): ImageStyle {
    if (isSmallScreenWidth) {
        return {
            position: 'absolute',
            bottom: 0,
            height: CONST.EMPTY_STATE_BACKGROUND.SMALL_SCREEN.IMAGE_HEIGHT,
            width: '100%',
        };
    }

    return {
        position: 'absolute',
        bottom: 0,
        height: CONST.EMPTY_STATE_BACKGROUND.WIDE_SCREEN.IMAGE_HEIGHT,
        width: '100%',
    };
}

/**
 * Gets the style for the container of the empty state background image that overlap the created report action
 */
function getReportWelcomeBackgroundContainerStyle(): ViewStyle {
    return {
        position: 'absolute',
        top: CONST.EMPTY_STATE_BACKGROUND.OVERLAP,
        width: '100%',
    };
}

/**
 * Returns fontSize style
 */
function getFontSizeStyle(fontSize: number): TextStyle {
    return {
        fontSize,
    };
}

/**
 * Returns lineHeight style
 */
function getLineHeightStyle(lineHeight: number): TextStyle {
    return {
        lineHeight,
    };
}

type GetBaseAutoCompleteSuggestionContainerStyleParams = {
    left: number;
    bottom: number;
    width: number;
};

/**
 * Gets the correct position for the base auto complete suggestion container
 */
function getBaseAutoCompleteSuggestionContainerStyle({left, bottom, width}: GetBaseAutoCompleteSuggestionContainerStyleParams): ViewStyle {
    return {
        position: 'absolute',
        bottom,
        left,
        width,
    };
}

const shouldPreventScroll = shouldPreventScrollOnAutoCompleteSuggestion();

/**
 * Gets the correct position for auto complete suggestion container
 */
function getAutoCompleteSuggestionContainerStyle(itemsHeight: number): ViewStyle {
    'worklet';

    const borderWidth = 2;
    const height = itemsHeight + 2 * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTER_INNER_PADDING + (shouldPreventScroll ? borderWidth : 0);

    return {
        height,
        minHeight: CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTION_ROW_HEIGHT,
    };
}

function getEmojiReactionBubbleTextStyle(isContextMenu = false): TextStyle {
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

function getTransformScaleStyle(scaleValue: AnimatableNumericValue): ViewStyle {
    return {
        transform: [{scale: scaleValue}],
    };
}

/**
 * Returns a style object with a rotation transformation applied based on the provided direction prop.
 *
 * @param direction - The direction of the rotation (CONST.DIRECTION.LEFT or CONST.DIRECTION.RIGHT).
 */
function getDirectionStyle(direction: ValueOf<typeof CONST.DIRECTION>): ViewStyle {
    if (direction === CONST.DIRECTION.LEFT) {
        return {transform: 'rotate(180deg)'};
    }

    return {};
}

/**
 * Returns a style object with display flex or none basing on the condition value.
 */
function displayIfTrue(condition: boolean): ViewStyle {
    return {display: condition ? 'flex' : 'none'};
}

/**
 * Gets the correct height for emoji picker list based on screen dimensions
 */
function getEmojiPickerListHeight(isRenderingShortcutRow: boolean, windowHeight: number): ViewStyle {
    const style = {
        height: isRenderingShortcutRow ? CONST.NON_NATIVE_EMOJI_PICKER_LIST_HEIGHT + CONST.CATEGORY_SHORTCUT_BAR_HEIGHT : CONST.NON_NATIVE_EMOJI_PICKER_LIST_HEIGHT,
    };

    if (windowHeight) {
        // dimensions of content above the emoji picker list
        const dimensions = isRenderingShortcutRow ? CONST.EMOJI_PICKER_TEXT_INPUT_SIZES + CONST.CATEGORY_SHORTCUT_BAR_HEIGHT : CONST.EMOJI_PICKER_TEXT_INPUT_SIZES;
        return {
            ...style,
            maxHeight: windowHeight - dimensions,
        };
    }
    return style;
}

/**
 * Returns padding vertical based on number of lines
 */
function getComposeTextAreaPadding(isComposerFullSize: boolean): TextStyle {
    let paddingValue = 5;
    // Issue #26222: If isComposerFullSize paddingValue will always be 5 to prevent padding jumps when adding multiple lines.
    if (!isComposerFullSize) {
        paddingValue = 8;
    }
    return {
        paddingTop: paddingValue,
        paddingBottom: paddingValue,
    };
}

/**
 * Returns style object for the mobile on WEB
 */
function getOuterModalStyle(windowHeight: number, viewportOffsetTop: number): ViewStyle {
    return Browser.isMobile() ? {maxHeight: windowHeight, marginTop: viewportOffsetTop} : {};
}

/**
 * Returns style object for flexWrap depending on the screen size
 */
function getWrappingStyle(isExtraSmallScreenWidth: boolean): ViewStyle {
    return {
        flexWrap: isExtraSmallScreenWidth ? 'wrap' : 'nowrap',
    };
}

/**
 * Returns the text container styles for menu items depending on if the menu item container a small avatar
 */
function getMenuItemTextContainerStyle(isSmallAvatarSubscriptMenu: boolean): ViewStyle {
    return {
        minHeight: isSmallAvatarSubscriptMenu ? variables.avatarSizeSubscript : variables.componentSizeNormal,
    };
}

/**
 * Returns color style
 */
function getColorStyle(color: string): TextColorStyle {
    return {color};
}

/**
 * Returns the checkbox pressable style
 */
function getCheckboxPressableStyle(borderRadius = 6): ViewStyle {
    return {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius,
    };
}

/**
 * Returns style object for the dropbutton height
 */
function getDropDownButtonHeight(buttonSize: ButtonSizeValue): ViewStyle {
    if (buttonSize === CONST.DROPDOWN_BUTTON_SIZE.LARGE) {
        return {
            height: variables.componentSizeLarge,
        };
    }
    return {
        height: variables.componentSizeNormal,
    };
}

/**
 * Returns fitting fontSize and lineHeight values in order to prevent large amounts from being cut off on small screen widths.
 */
function getAmountFontSizeAndLineHeight(isSmallScreenWidth: boolean, windowWidth: number, displayAmountLength: number, numberOfParticipant: number): TextStyle {
    let toSubtract = 0;
    const baseFontSize = variables.fontSizeXLarge;
    const baseLineHeight = variables.lineHeightXXLarge;

    const numberOfAvatar = numberOfParticipant < 4 ? numberOfParticipant : 4;
    const differentWithMaxLength = 17 - displayAmountLength;

    // with a window width is more than 420px the maximum amount will not be cut off with the maximum avatar displays
    if (isSmallScreenWidth && windowWidth < 420) {
        // Based on width Difference we can see the max length of amount can be displayed with the number of avatars.
        // From there we can calculate subtract in accordance with the number of avatar and the length of amount text
        const widthDifference = 420 - windowWidth;
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
function getTransparentColor(color: string) {
    return `${color}00`;
}

function getOpacityStyle(opacity: number) {
    return {opacity};
}

function getMultiGestureCanvasContainerStyle(canvasWidth: number): ViewStyle {
    return {
        width: canvasWidth,
        overflow: 'hidden',
    };
}

function percentage(percentageValue: number, totalValue: number) {
    return (totalValue / 100) * percentageValue;
}

/**
 * Calculates the width in px of characters from 0 to 9 and '.'
 */
function getCharacterWidth(character: string) {
    const defaultWidth = 8;
    if (character === '.') {
        return percentage(25, defaultWidth);
    }
    const number = +character;

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

function getAmountWidth(amount: string): number {
    let width = 0;
    for (let i = 0; i < amount.length; i++) {
        width += getCharacterWidth(amount.charAt(i));
    }
    return width;
}

const staticStyleUtils = {
    positioning,
    combineStyles,
    displayIfTrue,
    getAmountFontSizeAndLineHeight,
    getAutoCompleteSuggestionContainerStyle,
    getAvatarBorderRadius,
    getAvatarBorderStyle,
    getAvatarBorderWidth,
    getAvatarExtraFontSizeStyle,
    getAvatarSize,
    getAvatarWidthStyle,
    getBackgroundAndBorderStyle,
    getBackgroundColorStyle,
    getBackgroundColorWithOpacityStyle,
    getPaddingLeft,
    getPaddingRight,
    hasSafeAreas,
    getHeight,
    getMinimumHeight,
    getMinimumWidth,
    getMaximumHeight,
    getMaximumWidth,
    fade,
    getHorizontalStackedAvatarBorderStyle,
    getHorizontalStackedAvatarStyle,
    getHorizontalStackedOverlayAvatarStyle,
    getReportWelcomeBackgroundImageStyle,
    getReportWelcomeBackgroundContainerStyle,
    getBaseAutoCompleteSuggestionContainerStyle,
    getBorderColorStyle,
    getCheckboxPressableStyle,
    getComposeTextAreaPadding,
    getColorStyle,
    getDefaultWorkspaceAvatarColor,
    getBackgroundColorAndFill,
    getDirectionStyle,
    getDropDownButtonHeight,
    getEmojiPickerListHeight,
    getEmojiPickerStyle,
    getEmojiReactionBubbleTextStyle,
    getTransformScaleStyle,
    getCodeFontSize,
    getFontSizeStyle,
    getLineHeightStyle,
    getMenuItemTextContainerStyle,
    getModalPaddingStyles,
    getOuterModalStyle,
    getPaymentMethodMenuWidth,
    getSafeAreaMargins,
    getSafeAreaPadding,
    getSignInWordmarkWidthStyle,
    getTextColorStyle,
    getTransparentColor,
    getWidthAndHeightStyle,
    getWidthStyle,
    getWrappingStyle,
    getZoomSizingStyle,
    parseStyleAsArray,
    parseStyleFromFunction,
    getEReceiptColorStyles,
    getEReceiptColorCode,
    getFileExtensionColorCode,
    getNavigationModalCardStyle,
    getCardStyles,
    getOpacityStyle,
    getMultiGestureCanvasContainerStyle,
    getSignInBgStyles,
    getIconWidthAndHeightStyle,
    getButtonStyleWithIcon,
    getCharacterWidth,
    getAmountWidth,
    getBorderRadiusStyle,
    getHighResolutionInfoWrapperStyle,
};

const createStyleUtils = (theme: ThemeColors, styles: ThemeStyles) => ({
    ...staticStyleUtils,
    ...createModalStyleUtils({theme, styles}),
    ...createTooltipStyleUtils({theme, styles}),
    ...createReportActionContextMenuStyleUtils({theme, styles}),

    getCompactContentContainerStyles: () => compactContentContainerStyles(styles),
    getContextMenuItemStyles: (windowWidth?: number) => getContextMenuItemStyles(styles, windowWidth),
    getContainerComposeStyles: () => containerComposeStyles(styles),

    /**
     * Gets styles for AutoCompleteSuggestion row
     */
    getAutoCompleteSuggestionItemStyle: (highlightedEmojiIndex: number, rowHeight: number, isHovered: boolean, currentEmojiIndex: number): ViewStyle[] => {
        let backgroundColor;

        if (currentEmojiIndex === highlightedEmojiIndex) {
            backgroundColor = theme.activeComponentBG;
        } else if (isHovered) {
            backgroundColor = theme.hoverComponentBG;
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
    },

    /**
     * Returns auto grow height text input style
     */
    getAutoGrowHeightInputStyle: (textInputHeight: number, maxHeight: number): ViewStyle => {
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
    },

    /**
     * Return the style from an avatar size constant
     */
    getAvatarStyle: (size: AvatarSizeName): AvatarStyle => {
        const avatarSize = getAvatarSize(size);
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
    getBadgeColorStyle: (isSuccess: boolean, isError: boolean, isPressed = false, isAdHoc = false): ViewStyle => {
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
    },

    getIconColorStyle: (isSuccess: boolean, isError: boolean): string => {
        if (isSuccess) {
            return theme.iconSuccessFill;
        }
        if (isError) {
            return theme.iconDangerFill;
        }
        return theme.icon;
    },

    getEnvironmentBadgeStyle: (isSuccess: boolean, isError: boolean, isAdhoc: boolean): ViewStyle => {
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
    getButtonBackgroundColorStyle: (buttonState: ButtonStateName = CONST.BUTTON_STATES.DEFAULT, isMenuItem = false): ViewStyle => {
        switch (buttonState) {
            case CONST.BUTTON_STATES.PRESSED:
                return {backgroundColor: theme.buttonPressedBG};
            case CONST.BUTTON_STATES.ACTIVE:
                return isMenuItem ? {backgroundColor: theme.border} : {backgroundColor: theme.buttonHoveredBG};
            case CONST.BUTTON_STATES.DISABLED:
            case CONST.BUTTON_STATES.DEFAULT:
            default:
                return {};
        }
    },

    /**
     * Returns the checkbox container style
     */
    getCheckboxContainerStyle: (size: number, borderRadius = 4): ViewStyle => ({
        backgroundColor: theme.componentBG,
        height: size,
        width: size,
        borderColor: theme.borderLighter,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius,
    }),

    /**
     * Select the correct color for text.
     */
    getColoredBackgroundStyle: (isColored: boolean): StyleProp<TextStyle> => ({backgroundColor: isColored ? theme.mentionBG : undefined}),

    /**
     * Returns link styles based on whether the link is disabled or not
     */
    getDisabledLinkStyles: (isDisabled = false): TextStyle => {
        const disabledLinkStyles = {
            color: theme.textSupporting,
            ...styles.cursorDisabled,
        };

        return {
            ...styles.link,
            ...(isDisabled ? disabledLinkStyles : {}),
        };
    },

    /**
     * Get the style for the AM and PM buttons in the TimePicker
     */
    getStatusAMandPMButtonStyle: (amPmValue: string): {styleForAM: StyleProp<ViewStyle>; styleForPM: StyleProp<ViewStyle>} => {
        const computedStyleForAM: ViewStyle = amPmValue !== CONST.TIME_PERIOD.AM ? {backgroundColor: theme.componentBG} : {};
        const computedStyleForPM: ViewStyle = amPmValue !== CONST.TIME_PERIOD.PM ? {backgroundColor: theme.componentBG} : {};

        return {
            styleForAM: [styles.timePickerWidth100, computedStyleForAM],
            styleForPM: [styles.timePickerWidth100, computedStyleForPM],
        };
    },

    /**
     * Get the styles of the text next to dot indicators
     */
    getDotIndicatorTextStyles: (isErrorText = true): TextStyle => (isErrorText ? {...styles.offlineFeedback.text, color: styles.formError.color} : {...styles.offlineFeedback.text}),

    getEmojiReactionBubbleStyle: (isHovered: boolean, hasUserReacted: boolean, isContextMenu = false): ViewStyle => {
        let backgroundColor = theme.border;

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
                backgroundColor,
            };
        }

        return {
            paddingVertical: 2,
            paddingHorizontal: 8,
            backgroundColor,
        };
    },

    getEmojiReactionCounterTextStyle: (hasUserReacted: boolean): TextStyle => {
        if (hasUserReacted) {
            return {color: theme.reactionActiveText};
        }

        return {color: theme.text};
    },

    getErrorPageContainerStyle: (safeAreaPaddingBottom = 0): ViewStyle => ({
        backgroundColor: theme.componentBG,
        paddingBottom: 40 + safeAreaPaddingBottom,
    }),

    getGoogleListViewStyle: (shouldDisplayBorder: boolean): ViewStyle => {
        if (shouldDisplayBorder) {
            return {
                ...styles.borderTopRounded,
                ...styles.borderBottomRounded,
                marginTop: 4,
                paddingVertical: 6,
            };
        }

        return {
            transform: 'scale(0)',
        };
    },

    /**
     * Return the height of magic code input container
     */
    getHeightOfMagicCodeInput: (): ViewStyle => ({height: styles.magicCodeInputContainer.minHeight - styles.textInputContainer.borderBottomWidth}),

    /**
     * Generate fill color of an icon based on its state.
     *
     * @param buttonState - One of {'default', 'hovered', 'pressed'}
     * @param isMenuIcon - whether this icon is apart of a list
     * @param isPane - whether this icon is in a pane, e.g. Account or Workspace Settings
     */
    getIconFillColor: (buttonState: ButtonStateName = CONST.BUTTON_STATES.DEFAULT, isMenuIcon = false, isPane = false): string => {
        switch (buttonState) {
            case CONST.BUTTON_STATES.ACTIVE:
            case CONST.BUTTON_STATES.PRESSED:
                if (isPane) {
                    return theme.iconMenu;
                }
                return theme.iconHovered;
            case CONST.BUTTON_STATES.COMPLETE:
                return theme.iconSuccessFill;
            case CONST.BUTTON_STATES.DEFAULT:
            case CONST.BUTTON_STATES.DISABLED:
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
    getMentionStyle: (isOurMention: boolean): TextStyle => {
        const backgroundColor = isOurMention ? theme.ourMentionBG : theme.mentionBG;
        return {
            backgroundColor,
            borderRadius: variables.componentBorderRadiusSmall,
            paddingHorizontal: 2,
        };
    },

    /**
     * Returns text color for the user mention text based on whether the mention is ours or not.
     */
    getMentionTextColor: (isOurMention: boolean): string => (isOurMention ? theme.ourMentionText : theme.mentionText),

    /**
     * Generate the wrapper styles for the mini ReportActionContextMenu.
     */
    getMiniReportActionContextMenuWrapperStyle: (isReportActionItemGrouped: boolean): ViewStyle => ({
        ...(isReportActionItemGrouped ? positioning.tn8 : positioning.tn4),
        ...positioning.r4,
        ...styles.cursorDefault,
        ...styles.userSelectNone,
        overflowAnchor: 'none',
        position: 'absolute',
        zIndex: 8,
    }),

    /**
     * Generate the styles for the ReportActionItem wrapper view.
     */
    getReportActionItemStyle: (isHovered = false, isClickable = false): ViewStyle => ({
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: isHovered
            ? theme.hoverComponentBG
            : // Warning: Setting this to a non-transparent color will cause unread indicator to break on Android
              theme.transparent,
        opacity: 1,
        ...(isClickable ? styles.cursorPointer : styles.cursorInitial),
    }),

    /**
     * Determines the theme color for a modal based on the app's background color,
     * the modal's backdrop, and the backdrop's opacity.
     *
     * @param bgColor - theme background color
     * @returns The theme color as an RGB value.
     */
    getThemeBackgroundColor: (bgColor: string): string => {
        const backdropOpacity = variables.overlayOpacity;

        const [backgroundRed, backgroundGreen, backgroundBlue] = extractValuesFromRGB(bgColor) ?? hexadecimalToRGBArray(bgColor) ?? [];
        const [backdropRed, backdropGreen, backdropBlue] = hexadecimalToRGBArray(theme.overlay) ?? [];
        const normalizedBackdropRGB = convertRGBToUnitValues(backdropRed, backdropGreen, backdropBlue);
        const normalizedBackgroundRGB = convertRGBToUnitValues(backgroundRed, backgroundGreen, backgroundBlue);
        const [red, green, blue] = convertRGBAToRGB(normalizedBackdropRGB, normalizedBackgroundRGB, backdropOpacity);
        const themeRGB = convertUnitValuesToRGB(red, green, blue);

        return `rgb(${themeRGB.join(', ')})`;
    },

    getZoomCursorStyle: (isZoomed: boolean, isDragging: boolean): ViewStyle => {
        if (!isZoomed) {
            return styles.cursorZoomIn;
        }

        return isDragging ? styles.cursorGrabbing : styles.cursorZoomOut;
    },

    getSearchTableColumnStyles: (columnName: string, shouldExtendDateColumn = false): ViewStyle => {
        let columnWidth;
        switch (columnName) {
            case CONST.SEARCH.TABLE_COLUMNS.RECEIPT:
                columnWidth = {...getWidthStyle(variables.w36), ...styles.alignItemsCenter};
                break;
            case CONST.SEARCH.TABLE_COLUMNS.DATE:
                columnWidth = getWidthStyle(shouldExtendDateColumn ? variables.w92 : variables.w52);
                break;
            case CONST.SEARCH.TABLE_COLUMNS.MERCHANT:
            case CONST.SEARCH.TABLE_COLUMNS.FROM:
            case CONST.SEARCH.TABLE_COLUMNS.TO:
                columnWidth = styles.flex1;
                break;
            case CONST.SEARCH.TABLE_COLUMNS.CATEGORY:
            case CONST.SEARCH.TABLE_COLUMNS.TAG:
                columnWidth = {...getWidthStyle(variables.w36), ...styles.flex1};
                break;
            case CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT:
            case CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT:
                columnWidth = {...getWidthStyle(variables.w96), ...styles.alignItemsEnd};
                break;
            case CONST.SEARCH.TABLE_COLUMNS.TYPE:
                columnWidth = {...getWidthStyle(variables.w20), ...styles.alignItemsCenter};
                break;
            case CONST.SEARCH.TABLE_COLUMNS.ACTION:
                columnWidth = {...getWidthStyle(variables.w80), ...styles.alignItemsCenter};
                break;
            default:
                columnWidth = styles.flex1;
        }

        return columnWidth;
    },

    getTextOverflowStyle: (overflow: string): TextStyle => ({
        textOverflow: overflow,
    }),

    /**
     * Returns container styles for showing the icons in MultipleAvatars/SubscriptAvatar
     */
    getContainerStyles: (size: string, isInReportAction = false): ViewStyle[] => {
        let containerStyles: ViewStyle[];

        switch (size) {
            case CONST.AVATAR_SIZE.SMALL:
                containerStyles = [styles.emptyAvatarSmall, styles.emptyAvatarMarginSmall];
                break;
            case CONST.AVATAR_SIZE.SMALLER:
                containerStyles = [styles.emptyAvatarSmaller, styles.emptyAvatarMarginSmaller];
                break;
            case CONST.AVATAR_SIZE.MEDIUM:
                containerStyles = [styles.emptyAvatarMedium, styles.emptyAvatarMargin];
                break;
            case CONST.AVATAR_SIZE.LARGE:
                containerStyles = [styles.emptyAvatarLarge, styles.mb2, styles.mr2];
                break;
            default:
                containerStyles = [styles.emptyAvatar, isInReportAction ? styles.emptyAvatarMarginChat : styles.emptyAvatarMargin];
        }

        return containerStyles;
    },

    getUpdateRequiredViewStyles: (isSmallScreenWidth: boolean): ViewStyle[] => [
        {
            alignItems: 'center',
            justifyContent: 'center',
            ...(isSmallScreenWidth ? {} : styles.pb40),
        },
    ],

    /**
     * Returns a style that sets the maximum height of the composer based on the number of lines and whether the composer is full size or not.
     */
    getComposerMaxHeightStyle: (maxLines: number | undefined, isComposerFullSize: boolean): TextStyle => {
        if (isComposerFullSize || maxLines == null) {
            return {};
        }

        const composerLineHeight = styles.textInputCompose.lineHeight ?? 0;

        return {
            maxHeight: maxLines * composerLineHeight,
        };
    },

    getFullscreenCenteredContentStyles: () => [StyleSheet.absoluteFill, styles.justifyContentCenter, styles.alignItemsCenter],

    /**
     * Returns the styles for the Tools modal
     */
    getTestToolsModalStyle: (windowWidth: number): ViewStyle[] => [styles.settingsPageBody, styles.p5, {width: windowWidth * 0.9}],

    getMultiselectListStyles: (isSelected: boolean, isDisabled: boolean): ViewStyle => ({
        ...(isSelected && styles.checkedContainer),
        ...(isSelected && styles.borderColorFocus),
        ...(isDisabled && styles.cursorDisabled),
        ...(isDisabled && styles.buttonOpacityDisabled),
    }),

    /**
     * When adding a new prefix character, adjust this method to add expected character width.
     * This is because character width isn't known before it's rendered to the screen, and once it's rendered,
     * it's too late to calculate it's width because the change in padding would cause a visible jump.
     * Some characters are wider than the others when rendered, e.g. '@' vs '#'. Chosen font-family and font-size
     * also have an impact on the width of the character, but as long as there's only one font-family and one font-size,
     * this method will produce reliable results.
     */
    getCharacterPadding: (prefix: string): number => {
        let padding = 0;
        prefix.split('').forEach((char) => {
            if (char.match(/[a-z]/i) && char === char.toUpperCase()) {
                padding += 11;
            } else {
                padding += 8;
            }
        });

        return padding;
    },

    // TODO: remove it when we'll implement the callback to handle this toggle in Expensify/Expensify#368335
    getWorkspaceWorkflowsOfflineDescriptionStyle: (descriptionTextStyle: TextStyle | TextStyle[]): StyleProp<TextStyle> => ({
        ...StyleSheet.flatten(descriptionTextStyle),
        opacity: styles.opacitySemiTransparent.opacity,
    }),

    getTripReservationIconContainer: (isSmallIcon: boolean): StyleProp<ViewStyle> => ({
        width: isSmallIcon ? variables.avatarSizeSmallNormal : variables.avatarSizeNormal,
        height: isSmallIcon ? variables.avatarSizeSmallNormal : variables.avatarSizeNormal,
        borderRadius: isSmallIcon ? variables.avatarSizeSmallNormal : variables.componentBorderRadiusXLarge,
        backgroundColor: theme.border,
        alignItems: 'center',
        justifyContent: 'center',
    }),
});

type StyleUtilsType = ReturnType<typeof createStyleUtils>;

const DefaultStyleUtils = createStyleUtils(defaultTheme, defaultStyles);

export default createStyleUtils;
export {DefaultStyleUtils};
export type {StyleUtilsType, AvatarSizeName};
