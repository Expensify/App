import {CSSProperties} from 'react';
import {Animated, DimensionValue, ImageStyle, PressableStateCallbackType, TextStyle, ViewStyle} from 'react-native';
import {EdgeInsets} from 'react-native-safe-area-context';
import {ValueOf} from 'type-fest';
import CONST from '../CONST';
import * as Browser from '../libs/Browser';
import * as UserUtils from '../libs/UserUtils';
import colors from './colors';
import fontFamily from './fontFamily';
import styles from './styles';
import themeColors from './themes/default';
import cursor from './utilities/cursor';
import positioning from './utilities/positioning';
import spacing from './utilities/spacing';
import variables from './variables';
import {Transaction} from '../types/onyx';

type AllStyles = ViewStyle | TextStyle | ImageStyle;
type ParsableStyle = AllStyles | ((state: PressableStateCallbackType) => AllStyles);

type ColorValue = ValueOf<typeof colors>;
type AvatarSizeName = ValueOf<typeof CONST.AVATAR_SIZE>;
type EReceiptColorName = ValueOf<typeof CONST.ERECEIPT_COLORS>;
type AvatarSizeValue = ValueOf<
    Pick<
        typeof variables,
        | 'avatarSizeNormal'
        | 'avatarSizeSmallSubscript'
        | 'avatarSizeMidSubscript'
        | 'avatarSizeSubscript'
        | 'avatarSizeSmall'
        | 'avatarSizeSmaller'
        | 'avatarSizeXLarge'
        | 'avatarSizeLarge'
        | 'avatarSizeMedium'
        | 'avatarSizeLargeBordered'
        | 'avatarSizeHeader'
        | 'avatarSizeMentionIcon'
        | 'avatarSizeSmallNormal'
    >
>;
type ButtonSizeValue = ValueOf<typeof CONST.DROPDOWN_BUTTON_SIZE>;
type EmptyAvatarSizeName = ValueOf<Pick<typeof CONST.AVATAR_SIZE, 'SMALL' | 'MEDIUM' | 'LARGE'>>;
type ButtonStateName = ValueOf<typeof CONST.BUTTON_STATES>;
type AvatarSize = {width: number};

type WorkspaceColorStyle = {backgroundColor: ColorValue; fill: ColorValue};
type EreceiptColorStyle = {backgroundColor: ColorValue; color: ColorValue};

type ModalPaddingStylesParams = {
    shouldAddBottomSafeAreaMargin: boolean;
    shouldAddTopSafeAreaMargin: boolean;
    shouldAddBottomSafeAreaPadding: boolean;
    shouldAddTopSafeAreaPadding: boolean;
    safeAreaPaddingTop: number;
    safeAreaPaddingBottom: number;
    safeAreaPaddingLeft: number;
    safeAreaPaddingRight: number;
    modalContainerStyleMarginTop: number;
    modalContainerStyleMarginBottom: number;
    modalContainerStylePaddingTop: number;
    modalContainerStylePaddingBottom: number;
    insets: EdgeInsets;
};

type AvatarBorderStyleParams = {
    isHovered: boolean;
    isPressed: boolean;
    isInReportAction: boolean;
    shouldUseCardBackground: boolean;
};

type GetBaseAutoCompleteSuggestionContainerStyleParams = {
    left: number;
    bottom: number;
    width: number;
};

const workspaceColorOptions: WorkspaceColorStyle[] = [
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

const emptyAvatarStyles: Record<EmptyAvatarSizeName, ViewStyle> = {
    [CONST.AVATAR_SIZE.SMALL]: styles.emptyAvatarSmall,
    [CONST.AVATAR_SIZE.MEDIUM]: styles.emptyAvatarMedium,
    [CONST.AVATAR_SIZE.LARGE]: styles.emptyAvatarLarge,
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
    [CONST.AVATAR_SIZE.SMALL_SUBSCRIPT]: 1,
    [CONST.AVATAR_SIZE.MID_SUBSCRIPT]: 2,
    [CONST.AVATAR_SIZE.SUBSCRIPT]: 2,
    [CONST.AVATAR_SIZE.SMALL]: 2,
    [CONST.AVATAR_SIZE.SMALLER]: 2,
    [CONST.AVATAR_SIZE.LARGE]: 4,
    [CONST.AVATAR_SIZE.MEDIUM]: 3,
    [CONST.AVATAR_SIZE.LARGE_BORDERED]: 4,
};

/**
 * Return the style size from an avatar size constant
 */
function getAvatarSize(size: AvatarSizeName): number {
    return avatarSizes[size];
}

/**
 * Return the height of magic code input container
 */
function getHeightOfMagicCodeInput(): ViewStyle {
    return {height: styles.magicCodeInputContainer.minHeight - styles.textInputContainer.borderBottomWidth};
}

/**
 * Return the style from an empty avatar size constant
 */
function getEmptyAvatarStyle(size: EmptyAvatarSizeName): ViewStyle | undefined {
    return emptyAvatarStyles[size];
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
 * Return the style from an avatar size constant
 */
function getAvatarStyle(size: AvatarSizeName): ViewStyle {
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
function getAvatarBorderRadius(size: AvatarSizeName, type: string): ViewStyle {
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
function getDefaultWorkspaceAvatarColor(workspaceName: string): ViewStyle {
    const colorHash = UserUtils.hashText(workspaceName.trim(), workspaceColorOptions.length);

    return workspaceColorOptions[colorHash];
}

/**
 * Helper method to return eReceipt color code
 */
function getEReceiptColorCode(transaction: Transaction): EReceiptColorName {
    const transactionID = transaction.parentTransactionID ?? transaction.transactionID ?? '';

    const colorHash = UserUtils.hashText(transactionID.trim(), eReceiptColors.length);

    return eReceiptColors[colorHash];
}

/**
 * Helper method to return eReceipt color styles
 */
function getEReceiptColorStyles(colorCode: EReceiptColorName): EreceiptColorStyle | undefined {
    return eReceiptColorStyles[colorCode];
}

/**
 * Takes safe area insets and returns padding to use for a View
 */
function getSafeAreaPadding(insets?: EdgeInsets, insetsPercentage: number = variables.safeInsertPercentage): ViewStyle {
    return {
        paddingTop: insets?.top,
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

function getZoomCursorStyle(isZoomed: boolean, isDragging: boolean): ViewStyle {
    if (!isZoomed) {
        // TODO: Remove this "eslint-disable-next" once the theme switching migration is done and styles are fully typed (GH Issue: https://github.com/Expensify/App/issues/27337)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return styles.cursorZoomIn;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return isDragging ? styles.cursorGrabbing : styles.cursorZoomOut;
}

// NOTE: asserting some web style properties to a valid type, because it isn't possible to augment them.
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
    const top = `${Math.max((containerHeight - imgHeight) / 2, 0)}px` as DimensionValue;
    const left = `${Math.max((containerWidth - imgWidth) / 2, 0)}px` as DimensionValue;

    // Return different size and offset style based on zoomScale and isZoom.
    if (isZoomed) {
        // When both width and height are smaller than container(modal) size, set the height by multiplying zoomScale if it is zoomed in.
        if (zoomScale >= 1) {
            return {
                height: `${imgHeight * zoomScale}px` as DimensionValue,
                width: `${imgWidth * zoomScale}px` as DimensionValue,
            };
        }

        // If image height and width are bigger than container size, display image with original size because original size is bigger and position absolute.
        return {
            height: `${imgHeight}px` as DimensionValue,
            width: `${imgWidth}px` as DimensionValue,
            top,
            left,
        };
    }

    // If image is not zoomed in and image size is smaller than container size, display with original size based on offset and position absolute.
    if (zoomScale > 1) {
        return {
            height: `${imgHeight}px` as DimensionValue,
            width: `${imgWidth}px` as DimensionValue,
            top,
            left,
        };
    }

    // If image is bigger than container size, display full image in the screen with scaled size (fit by container size) and position absolute.
    // top, left offset should be different when displaying long or wide image.
    const scaledTop = `${Math.max((containerHeight - imgHeight * zoomScale) / 2, 0)}px` as DimensionValue;
    const scaledLeft = `${Math.max((containerWidth - imgWidth * zoomScale) / 2, 0)}px` as DimensionValue;
    return {
        height: `${imgHeight * zoomScale}px` as DimensionValue,
        width: `${imgWidth * zoomScale}px` as DimensionValue,
        top: scaledTop,
        left: scaledLeft,
    };
}

/**
 * Returns auto grow text input style
 */
function getWidthStyle(width: number): ViewStyle {
    return {
        width,
    };
}

/**
 * Returns auto grow height text input style
 */
function getAutoGrowHeightInputStyle(textInputHeight: number, maxHeight: number): ViewStyle {
    if (textInputHeight > maxHeight) {
        // TODO: Remove this "eslint-disable-next" once the theme switching migration is done and styles are fully typed (GH Issue: https://github.com/Expensify/App/issues/27337)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return {
            ...styles.pr0,
            ...styles.overflowAuto,
        };
    }

    // TODO: Remove this "eslint-disable-next" once the theme switching migration is done and styles are fully typed (GH Issue: https://github.com/Expensify/App/issues/27337)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
 */
function getBackgroundAndBorderStyle(backgroundColor: string): ViewStyle {
    return {
        backgroundColor,
        borderColor: backgroundColor,
    };
}

/**
 * Returns a style with the specified backgroundColor
 */
function getBackgroundColorStyle(backgroundColor: string): ViewStyle {
    return {
        backgroundColor,
    };
}

/**
 * Returns a style for text color
 */
function getTextColorStyle(color: string): TextStyle {
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
function getSignInWordmarkWidthStyle(environment: string, isSmallScreenWidth: boolean): ViewStyle {
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

/**
 * Generate a style for the background color of the Badge
 */
function getBadgeColorStyle(isSuccess: boolean, isError: boolean, isPressed = false, isAdHoc = false): ViewStyle {
    if (isSuccess) {
        if (isAdHoc) {
            // TODO: Remove this "eslint-disable-next" once the theme switching migration is done and styles are fully typed (GH Issue: https://github.com/Expensify/App/issues/27337)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return isPressed ? styles.badgeAdHocSuccessPressed : styles.badgeAdHocSuccess;
        }
        // TODO: Remove this "eslint-disable-next" once the theme switching migration is done and styles are fully typed (GH Issue: https://github.com/Expensify/App/issues/27337)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return isPressed ? styles.badgeSuccessPressed : styles.badgeSuccess;
    }
    if (isError) {
        // TODO: Remove this "eslint-disable-next" once the theme switching migration is done and styles are fully typed (GH Issue: https://github.com/Expensify/App/issues/27337)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return isPressed ? styles.badgeDangerPressed : styles.badgeDanger;
    }
    return {};
}

/**
 * Generate a style for the background color of the button, based on its current state.
 *
 * @param buttonState - One of {'default', 'hovered', 'pressed'}
 * @param isMenuItem - whether this button is apart of a list
 */
function getButtonBackgroundColorStyle(buttonState: ButtonStateName = CONST.BUTTON_STATES.DEFAULT, isMenuItem = false): ViewStyle {
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
 * @param buttonState - One of {'default', 'hovered', 'pressed'}
 * @param isMenuIcon - whether this icon is apart of a list
 */
function getIconFillColor(buttonState: ButtonStateName = CONST.BUTTON_STATES.DEFAULT, isMenuIcon = false): string {
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

function getAnimatedFABStyle(rotate: Animated.Value, backgroundColor: Animated.Value): Animated.WithAnimatedValue<ViewStyle> {
    return {
        transform: [{rotate}],
        backgroundColor,
    };
}

function getWidthAndHeightStyle(width: number, height?: number): ViewStyle {
    return {
        width,
        height: height ?? width,
    };
}

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
    const safeAreaPaddingBottomWithFallback = insets.bottom === 0 ? modalContainerStylePaddingTop ?? 0 : safeAreaPaddingBottom;
    return {
        marginTop: (modalContainerStyleMarginTop ?? 0) + (shouldAddTopSafeAreaMargin ? safeAreaPaddingTop : 0),
        marginBottom: (modalContainerStyleMarginBottom ?? 0) + (shouldAddBottomSafeAreaMargin ? safeAreaPaddingBottomWithFallback : 0),
        paddingTop: shouldAddTopSafeAreaPadding ? (modalContainerStylePaddingTop ?? 0) + safeAreaPaddingTop : modalContainerStylePaddingTop ?? 0,
        paddingBottom: shouldAddBottomSafeAreaPadding ? (modalContainerStylePaddingBottom ?? 0) + safeAreaPaddingBottomWithFallback : modalContainerStylePaddingBottom ?? 0,
        paddingLeft: safeAreaPaddingLeft ?? 0,
        paddingRight: safeAreaPaddingRight ?? 0,
    };
}

/**
 * Takes fontStyle and fontWeight and returns the correct fontFamily
 */
function getFontFamilyMonospace({fontStyle, fontWeight}: TextStyle): string {
    const italic = fontStyle === 'italic' && fontFamily.MONOSPACE_ITALIC;
    const bold = fontWeight === 'bold' && fontFamily.MONOSPACE_BOLD;
    const italicBold = italic && bold && fontFamily.MONOSPACE_BOLD_ITALIC;

    return italicBold || bold || italic || fontFamily.MONOSPACE;
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

/**
 * Generate the styles for the ReportActionItem wrapper view.
 */
function getReportActionItemStyle(isHovered = false): ViewStyle {
    // TODO: Remove this "eslint-disable-next" once the theme switching migration is done and styles are fully typed (GH Issue: https://github.com/Expensify/App/issues/27337)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: isHovered
            ? themeColors.hoverComponentBG
            : // Warning: Setting this to a non-transparent color will cause unread indicator to break on Android
              themeColors.transparent,
        opacity: 1,
        ...styles.cursorInitial,
    };
}

/**
 * Generate the wrapper styles for the mini ReportActionContextMenu.
 */
function getMiniReportActionContextMenuWrapperStyle(isReportActionItemGrouped: boolean): ViewStyle {
    // TODO: Remove this "eslint-disable-next" once the theme switching migration is done and styles are fully typed (GH Issue: https://github.com/Expensify/App/issues/27337)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...(isReportActionItemGrouped ? positioning.tn8 : positioning.tn4),
        ...positioning.r4,
        ...styles.cursorDefault,
        position: 'absolute',
        zIndex: 1,
    };
}

function getPaymentMethodMenuWidth(isSmallScreenWidth: boolean): ViewStyle {
    const margin = 20;
    return {width: !isSmallScreenWidth ? variables.sideBarWidth - margin * 2 : undefined};
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
 * Determines the theme color for a modal based on the app's background color,
 * the modal's backdrop, and the backdrop's opacity.
 *
 * @param bgColor - theme background color
 * @returns The theme color as an RGB value.
 */
function getThemeBackgroundColor(bgColor: string = themeColors.appBG): string {
    const backdropOpacity = variables.overlayOpacity;

    const [backgroundRed, backgroundGreen, backgroundBlue] = extractValuesFromRGB(bgColor) ?? hexadecimalToRGBArray(bgColor) ?? [];
    const [backdropRed, backdropGreen, backdropBlue] = hexadecimalToRGBArray(themeColors.overlay) ?? [];
    const normalizedBackdropRGB = convertRGBToUnitValues(backdropRed, backdropGreen, backdropBlue);
    const normalizedBackgroundRGB = convertRGBToUnitValues(backgroundRed, backgroundGreen, backgroundBlue);
    const [red, green, blue] = convertRGBAToRGB(normalizedBackdropRGB, normalizedBackgroundRGB, backdropOpacity);
    const themeRGB = convertUnitValuesToRGB(red, green, blue);

    return `rgb(${themeRGB.join(', ')})`;
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
function parseStyleFromFunction(style: ParsableStyle, state: PressableStateCallbackType): AllStyles[] {
    const functionAppliedStyle = typeof style === 'function' ? style(state) : style;
    return parseStyleAsArray(functionAppliedStyle);
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
function getMinimumWidth(minWidth: number): ViewStyle | CSSProperties {
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

function getHorizontalStackedAvatarBorderStyle({isHovered, isPressed, isInReportAction = false, shouldUseCardBackground = false}: AvatarBorderStyleParams): ViewStyle {
    let borderColor = shouldUseCardBackground ? themeColors.cardBG : themeColors.appBG;

    if (isHovered) {
        borderColor = isInReportAction ? themeColors.highlightBG : themeColors.border;
    }

    if (isPressed) {
        borderColor = isInReportAction ? themeColors.highlightBG : themeColors.buttonPressedBG;
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

function getErrorPageContainerStyle(safeAreaPaddingBottom = 0): ViewStyle {
    return {
        backgroundColor: themeColors.componentBG,
        paddingBottom: 40 + safeAreaPaddingBottom,
    };
}

/**
 * Gets the correct size for the empty state background image based on screen dimensions
 */
function getReportWelcomeBackgroundImageStyle(isSmallScreenWidth: boolean, isMoneyReport = false): ViewStyle {
    const emptyStateBackground = isMoneyReport ? CONST.EMPTY_STATE_BACKGROUND.MONEY_REPORT : CONST.EMPTY_STATE_BACKGROUND;

    if (isSmallScreenWidth) {
        return {
            height: emptyStateBackground.SMALL_SCREEN.IMAGE_HEIGHT,
            width: '200%',
            position: 'absolute',
        };
    }

    return {
        height: emptyStateBackground.WIDE_SCREEN.IMAGE_HEIGHT,
        width: '100%',
        position: 'absolute',
    };
}

/**
 * Gets the correct top margin size for the chat welcome message based on screen dimensions
 */
function getReportWelcomeTopMarginStyle(isSmallScreenWidth: boolean, isMoneyReport = false): ViewStyle {
    const emptyStateBackground = isMoneyReport ? CONST.EMPTY_STATE_BACKGROUND.MONEY_REPORT : CONST.EMPTY_STATE_BACKGROUND;
    if (isSmallScreenWidth) {
        return {
            marginTop: emptyStateBackground.SMALL_SCREEN.VIEW_HEIGHT,
        };
    }

    return {
        marginTop: emptyStateBackground.WIDE_SCREEN.VIEW_HEIGHT,
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

/**
 * Gets the correct size for the empty state container based on screen dimensions
 */
function getReportWelcomeContainerStyle(isSmallScreenWidth: boolean, isMoneyReport = false): ViewStyle {
    const emptyStateBackground = isMoneyReport ? CONST.EMPTY_STATE_BACKGROUND.MONEY_REPORT : CONST.EMPTY_STATE_BACKGROUND;
    if (isSmallScreenWidth) {
        return {
            minHeight: emptyStateBackground.SMALL_SCREEN.CONTAINER_MINHEIGHT,
            display: 'flex',
            justifyContent: 'space-between',
        };
    }

    return {
        minHeight: emptyStateBackground.WIDE_SCREEN.CONTAINER_MINHEIGHT,
        display: 'flex',
        justifyContent: 'space-between',
    };
}

/**
 * Gets styles for AutoCompleteSuggestion row
 */
function getAutoCompleteSuggestionItemStyle(highlightedEmojiIndex: number, rowHeight: number, isHovered: boolean, currentEmojiIndex: number): ViewStyle[] {
    let backgroundColor;

    if (currentEmojiIndex === highlightedEmojiIndex) {
        backgroundColor = themeColors.activeComponentBG;
    } else if (isHovered) {
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
 * Gets the correct position for the base auto complete suggestion container
 */
function getBaseAutoCompleteSuggestionContainerStyle({left, bottom, width}: GetBaseAutoCompleteSuggestionContainerStyleParams): ViewStyle {
    return {
        ...positioning.pFixed,
        bottom,
        left,
        width,
    };
}

/**
 * Gets the correct position for auto complete suggestion container
 */
function getAutoCompleteSuggestionContainerStyle(itemsHeight: number): ViewStyle {
    'worklet';

    const borderWidth = 2;
    const height = itemsHeight + 2 * CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTER_INNER_PADDING;

    // The suggester is positioned absolutely within the component that includes the input and RecipientLocalTime view (for non-expanded mode only). To position it correctly,
    // we need to shift it by the suggester's height plus its padding and, if applicable, the height of the RecipientLocalTime view.
    return {
        overflow: 'hidden',
        top: -(height + CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTER_PADDING + borderWidth),
        height,
    };
}

/**
 * Select the correct color for text.
 */
function getColoredBackgroundStyle(isColored: boolean): ViewStyle {
    return {backgroundColor: isColored ? themeColors.link : undefined};
}

function getEmojiReactionBubbleStyle(isHovered: boolean, hasUserReacted: boolean, isContextMenu = false): ViewStyle {
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

function getEmojiReactionCounterTextStyle(hasUserReacted: boolean): TextStyle {
    if (hasUserReacted) {
        return {color: themeColors.reactionActiveText};
    }

    return {color: themeColors.text};
}

/**
 * Returns a style object with a rotation transformation applied based on the provided direction prop.
 *
 * @param direction - The direction of the rotation (CONST.DIRECTION.LEFT or CONST.DIRECTION.RIGHT).
 */
function getDirectionStyle(direction: ValueOf<typeof CONST.DIRECTION>): ViewStyle {
    if (direction === CONST.DIRECTION.LEFT) {
        return {transform: [{rotate: '180deg'}]};
    }

    return {};
}

/**
 * Returns a style object with display flex or none basing on the condition value.
 */
function displayIfTrue(condition: boolean): ViewStyle {
    return {display: condition ? 'flex' : 'none'};
}

function getGoogleListViewStyle(shouldDisplayBorder: boolean): ViewStyle {
    if (shouldDisplayBorder) {
        // TODO: Remove this "eslint-disable-next" once the theme switching migration is done and styles are fully typed (GH Issue: https://github.com/Expensify/App/issues/27337)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
 */
function getEmojiPickerListHeight(hasAdditionalSpace: boolean, windowHeight: number): ViewStyle {
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
 */
function getMentionStyle(isOurMention: boolean): ViewStyle {
    const backgroundColor = isOurMention ? themeColors.ourMentionBG : themeColors.mentionBG;
    return {
        backgroundColor,
        borderRadius: variables.componentBorderRadiusSmall,
        paddingHorizontal: 2,
    };
}

/**
 * Returns text color for the user mention text based on whether the mention is ours or not.
 */
function getMentionTextColor(isOurMention: boolean): string {
    return isOurMention ? themeColors.ourMentionText : themeColors.mentionText;
}

/**
 * Returns padding vertical based on number of lines
 */
function getComposeTextAreaPadding(numberOfLines: number, isComposerFullSize: boolean): ViewStyle {
    let paddingValue = 5;
    // Issue #26222: If isComposerFullSize paddingValue will always be 5 to prevent padding jumps when adding multiple lines.
    if (!isComposerFullSize) {
        if (numberOfLines === 1) {
            paddingValue = 9;
        }
        // In case numberOfLines = 3, there will be a Expand Icon appearing at the top left, so it has to be recalculated so that the textArea can be full height
        else if (numberOfLines === 3) {
            paddingValue = 8;
        }
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
 * Returns link styles based on whether the link is disabled or not
 */
function getDisabledLinkStyles(isDisabled = false): ViewStyle {
    const disabledLinkStyles = {
        color: themeColors.textSupporting,
        ...cursor.cursorDisabled,
    };

    // TODO: Remove this "eslint-disable-next" once the theme switching migration is done and styles are fully typed (GH Issue: https://github.com/Expensify/App/issues/27337)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...styles.link,
        ...(isDisabled ? disabledLinkStyles : {}),
    };
}

/**
 * Returns color style
 */
function getColorStyle(color: string): ViewStyle | CSSProperties {
    return {color};
}

/**
 * Returns the checkbox pressable style
 */
function getCheckboxPressableStyle(borderRadius = 6): ViewStyle {
    return {
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        // eslint-disable-next-line object-shorthand
        borderRadius: borderRadius,
    };
}

/**
 * Returns the checkbox container style
 */
function getCheckboxContainerStyle(size: number, borderRadius = 4): ViewStyle {
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
function getAmountFontSizeAndLineHeight(baseFontSize: number, baseLineHeight: number, isSmallScreenWidth: boolean, windowWidth: number): TextStyle {
    let toSubtract = 0;

    if (isSmallScreenWidth) {
        const widthDifference = variables.mobileResponsiveWidthBreakpoint - windowWidth;
        switch (true) {
            case widthDifference > 450:
                toSubtract = 11;
                break;
            case widthDifference > 400:
                toSubtract = 8;
                break;
            case widthDifference > 350:
                toSubtract = 4;
                break;
            default:
                break;
        }
    }

    return {
        fontSize: baseFontSize - toSubtract,
        lineHeight: baseLineHeight - toSubtract,
    };
}

/**
 * Returns container styles for showing the icons in MultipleAvatars/SubscriptAvatar
 */
function getContainerStyles(size: string, isInReportAction = false): Array<ViewStyle | CSSProperties> {
    let containerStyles: Array<ViewStyle | CSSProperties>;

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
}

/**
 * Get transparent color by setting alpha value 0 of the passed hex(#xxxxxx) color code
 */
function getTransparentColor(color: string) {
    return `${color}00`;
}

export {
    combineStyles,
    displayIfTrue,
    getAmountFontSizeAndLineHeight,
    getAnimatedFABStyle,
    getAutoCompleteSuggestionContainerStyle,
    getAutoCompleteSuggestionItemStyle,
    getAutoGrowHeightInputStyle,
    getAvatarBorderRadius,
    getAvatarBorderStyle,
    getAvatarBorderWidth,
    getAvatarExtraFontSizeStyle,
    getAvatarSize,
    getAvatarStyle,
    getAvatarWidthStyle,
    getBackgroundAndBorderStyle,
    getBackgroundColorStyle,
    getBackgroundColorWithOpacityStyle,
    getBadgeColorStyle,
    getButtonBackgroundColorStyle,
    getPaddingLeft,
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
    getReportWelcomeTopMarginStyle,
    getReportWelcomeContainerStyle,
    getBaseAutoCompleteSuggestionContainerStyle,
    getBorderColorStyle,
    getCheckboxContainerStyle,
    getCheckboxPressableStyle,
    getColoredBackgroundStyle,
    getComposeTextAreaPadding,
    getColorStyle,
    getDefaultWorkspaceAvatarColor,
    getDirectionStyle,
    getDisabledLinkStyles,
    getDropDownButtonHeight,
    getEmojiPickerListHeight,
    getEmojiPickerStyle,
    getEmojiReactionBubbleStyle,
    getEmojiReactionBubbleTextStyle,
    getEmojiReactionCounterTextStyle,
    getEmptyAvatarStyle,
    getErrorPageContainerStyle,
    getFontFamilyMonospace,
    getFontSizeStyle,
    getGoogleListViewStyle,
    getHeightOfMagicCodeInput,
    getIconFillColor,
    getLineHeightStyle,
    getMentionStyle,
    getMentionTextColor,
    getMenuItemTextContainerStyle,
    getMiniReportActionContextMenuWrapperStyle,
    getModalPaddingStyles,
    getOuterModalStyle,
    getPaymentMethodMenuWidth,
    getReportActionItemStyle,
    getSafeAreaMargins,
    getSafeAreaPadding,
    getSignInWordmarkWidthStyle,
    getTextColorStyle,
    getThemeBackgroundColor,
    getTransparentColor,
    getWidthAndHeightStyle,
    getWidthStyle,
    getWrappingStyle,
    getZoomCursorStyle,
    getZoomSizingStyle,
    parseStyleAsArray,
    parseStyleFromFunction,
    getContainerStyles,
    getEReceiptColorStyles,
    getEReceiptColorCode,
};
