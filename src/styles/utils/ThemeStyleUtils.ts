import {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {type ThemeStyles} from '@styles/styles';
import {type ThemeColors} from '@styles/themes/types';
import cursor from '@styles/utilities/cursor';
import positioning from '@styles/utilities/positioning';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {hexadecimalToRGBArray} from './functions';
import StyleUtils from './StyleUtils';
import {AvatarSizeName, AvatarStyle, ButtonStateName} from './types';

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

const createThemeStyleUtils = (theme: ThemeColors, styles: ThemeStyles) => ({
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
    },

    /**
     * Return the style from an avatar size constant
     */
    getAvatarStyle: (size: AvatarSizeName): AvatarStyle => {
        const avatarSize = StyleUtils.getAvatarSize(size);
        return {
            height: avatarSize,
            width: avatarSize,
            borderRadius: avatarSize,
            backgroundColor: theme.offline,
        };
    },

    /**
     * Generate a style for the background color of the Badge
     */
    getBadgeColorStyle: (isSuccess: boolean, isError: boolean, isPressed = false, isAdHoc = false): ViewStyle => {
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
        // eslint-disable-next-line object-shorthand
        borderRadius: borderRadius,
    }),

    /**
     * Select the correct color for text.
     */
    getColoredBackgroundStyle: (isColored: boolean): StyleProp<TextStyle> => ({backgroundColor: isColored ? theme.link : undefined}),

    /**
     * Returns link styles based on whether the link is disabled or not
     */
    getDisabledLinkStyles: (isDisabled = false): ViewStyle => {
        const disabledLinkStyles = {
            color: theme.textSupporting,
            ...cursor.cursorDisabled,
        };

        // TODO: Remove this "eslint-disable-next" once the theme switching migration is done and styles are fully typed (GH Issue: https://github.com/Expensify/App/issues/27337)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return {
            ...styles.link,
            ...(isDisabled ? disabledLinkStyles : {}),
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
     */
    getIconFillColor: (buttonState: ButtonStateName = CONST.BUTTON_STATES.DEFAULT, isMenuIcon = false): string => {
        switch (buttonState) {
            case CONST.BUTTON_STATES.ACTIVE:
            case CONST.BUTTON_STATES.PRESSED:
                return theme.iconHovered;
            case CONST.BUTTON_STATES.COMPLETE:
                return theme.iconSuccessFill;
            case CONST.BUTTON_STATES.DEFAULT:
            case CONST.BUTTON_STATES.DISABLED:
            default:
                if (isMenuIcon) {
                    return theme.iconMenu;
                }
                return theme.icon;
        }
    },

    /**
     * Returns style object for the user mention component based on whether the mention is ours or not.
     */
    getMentionStyle: (isOurMention: boolean): ViewStyle => {
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
    getMiniReportActionContextMenuWrapperStyle: (isReportActionItemGrouped: boolean): ViewStyle =>
        // TODO: Remove this "eslint-disable-next" once the theme switching migration is done and styles are fully typed (GH Issue: https://github.com/Expensify/App/issues/27337)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        ({
            ...(isReportActionItemGrouped ? positioning.tn8 : positioning.tn4),
            ...positioning.r4,
            ...styles.cursorDefault,
            position: 'absolute',
            zIndex: 8,
        }),

    /**
     * Generate the styles for the ReportActionItem wrapper view.
     */
    getReportActionItemStyle: (isHovered = false): ViewStyle =>
        // TODO: Remove this "eslint-disable-next" once the theme switching migration is done and styles are fully typed (GH Issue: https://github.com/Expensify/App/issues/27337)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        ({
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: isHovered
                ? theme.hoverComponentBG
                : // Warning: Setting this to a non-transparent color will cause unread indicator to break on Android
                  theme.transparent,
            opacity: 1,
            ...styles.cursorInitial,
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
            // TODO: Remove this "eslint-disable-next" once the theme switching migration is done and styles are fully typed (GH Issue: https://github.com/Expensify/App/issues/27337)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return styles.cursorZoomIn;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return isDragging ? styles.cursorGrabbing : styles.cursorZoomOut;
    },

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
});

type ThemeStyleUtilsType = ReturnType<typeof createThemeStyleUtils>;

export default createThemeStyleUtils;
export type {ThemeStyleUtilsType};
