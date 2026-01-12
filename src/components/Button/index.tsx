import {useIsFocused} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import type {GestureResponderEvent, LayoutChangeEvent, StyleProp, TextStyle, ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Icon from '@components/Icon';
import type {PressableRef} from '@components/Pressable/GenericPressable/types';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import withNavigationFallback from '@components/withNavigationFallback';
import useActiveElementRole from '@hooks/useActiveElementRole';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import HapticFeedback from '@libs/HapticFeedback';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import {getButtonRole} from './utils';
import validateSubmitShortcut from './validateSubmitShortcut';

type ButtonProps = Partial<ChildrenProps> &
    WithSentryLabel & {
        /** Should the press event bubble across multiple instances when Enter key triggers it. */
        allowBubble?: boolean;

        /** The icon asset to display to the right of the text */
        iconRight?: IconAsset;

        /** The fill color to pass into the icon. */
        iconFill?: string;

        /** The fill color to pass into the icon when the button is hovered. */
        iconHoverFill?: string;

        /** Any additional styles to pass to the left icon container. */
        iconStyles?: StyleProp<ViewStyle>;

        /** Any additional styles to pass to the right icon container. */
        iconRightStyles?: StyleProp<ViewStyle>;

        /** Any additional styles to pass to the icon wrapper container. */
        iconWrapperStyles?: StyleProp<ViewStyle>;

        /** Extra-small sized button */
        extraSmall?: boolean;

        /** Small sized button */
        small?: boolean;

        /** Large sized button */
        large?: boolean;

        /** Medium sized button */
        medium?: boolean;

        /** Indicates whether the button should be disabled and in the loading state */
        isLoading?: boolean;

        /** Indicates whether the button should be disabled */
        isDisabled?: boolean;

        /** Invoked on mount and layout changes */
        onLayout?: (event: LayoutChangeEvent) => void;

        /** A function that is called when the button is clicked on */
        onPress?: (event?: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

        /** A function that is called when the button is long pressed */
        onLongPress?: (event?: GestureResponderEvent) => void;

        /** A function that is called when the button is pressed */
        onPressIn?: (event: GestureResponderEvent) => void;

        /** A function that is called when the button is released */
        onPressOut?: (event: GestureResponderEvent) => void;

        /** Callback that is called when mousedown is triggered. */
        onMouseDown?: (e: React.MouseEvent<Element, MouseEvent>) => void;

        /** Call the onPress function when Enter key is pressed */
        pressOnEnter?: boolean;

        /** The priority to assign the enter key event listener. 0 is the highest priority. */
        enterKeyEventListenerPriority?: number;

        /** Additional styles to add after local styles. Applied to Pressable portion of button */
        style?: StyleProp<ViewStyle>;

        /** Additional styles to add to the component when it's disabled */
        disabledStyle?: StyleProp<ViewStyle>;

        /** Additional button styles. Specific to the OpacityView of the button */
        innerStyles?: StyleProp<ViewStyle>;

        /** Additional text styles */
        textStyles?: StyleProp<TextStyle>;

        /** Additional text styles when the button is hovered */
        textHoverStyles?: StyleProp<TextStyle>;

        /** The number of lines to display for the primary text */
        primaryTextNumberOfLines?: number;

        /** Whether we should use the default hover style */
        shouldUseDefaultHover?: boolean;

        /** Additional hover styles */
        hoverStyles?: StyleProp<ViewStyle>;

        /** Whether we should use the success theme color */
        success?: boolean;

        /** Whether we should use the danger theme color */
        danger?: boolean;

        /** Whether we should display the button as a link */
        link?: boolean;

        /** Should we remove the right border radius top + bottom? */
        shouldRemoveRightBorderRadius?: boolean;

        /** Should we remove the left border radius top + bottom? */
        shouldRemoveLeftBorderRadius?: boolean;

        /** Should enable the haptic feedback? */
        shouldEnableHapticFeedback?: boolean;

        /** Should disable the long press? */
        isLongPressDisabled?: boolean;

        /** Id to use for this button */
        id?: string;

        /** Accessibility label for the component */
        accessibilityLabel?: string;

        /** The icon asset to display to the left of the text */
        icon?: IconAsset | null;

        /** The text for the button label */
        text?: string;

        /** Boolean whether to display the right icon */
        shouldShowRightIcon?: boolean;

        /** Whether the button should use split style or not */
        isSplitButton?: boolean;

        /** Whether button's content should be centered */
        isContentCentered?: boolean;

        /** Whether the Enter keyboard listening is active whether or not the screen that contains the button is focused */
        isPressOnEnterActive?: boolean;

        /** The testID of the button. Used to locate this view in end-to-end tests. */
        testID?: string;

        /** Whether is a nested button inside other button, since nesting buttons isn't valid html */
        isNested?: boolean;

        /** The text displays under the first line */
        secondLineText?: string;

        /**
         * Whether the button should have a background layer in the color of theme.appBG.
         * This is needed for buttons that allow content to display under them.
         */
        shouldBlendOpacity?: boolean;

        /**
         * Reference to the outer element.
         */
        ref?: ForwardedRef<View>;

        /**
         * Whether the button should stay visually normal even when disabled.
         */
        shouldStayNormalOnDisable?: boolean;
    };

type KeyboardShortcutComponentProps = Pick<ButtonProps, 'isDisabled' | 'isLoading' | 'onPress' | 'pressOnEnter' | 'allowBubble' | 'enterKeyEventListenerPriority' | 'isPressOnEnterActive'>;

const accessibilityRoles: string[] = Object.values(CONST.ROLE);

function KeyboardShortcutComponent({
    isDisabled = false,
    isLoading = false,
    onPress = () => {},
    pressOnEnter,
    allowBubble,
    enterKeyEventListenerPriority,
    isPressOnEnterActive = false,
}: KeyboardShortcutComponentProps) {
    const isFocused = useIsFocused();
    const activeElementRole = useActiveElementRole();

    const shouldDisableEnterShortcut = useMemo(() => accessibilityRoles.includes(activeElementRole ?? '') && activeElementRole !== CONST.ROLE.PRESENTATION, [activeElementRole]);

    const keyboardShortcutCallback = useCallback(
        (event?: GestureResponderEvent | KeyboardEvent) => {
            if (!validateSubmitShortcut(isDisabled, isLoading, event)) {
                return;
            }
            onPress();
        },
        [isDisabled, isLoading, onPress],
    );

    const config = useMemo(
        () => ({
            isActive: pressOnEnter && !shouldDisableEnterShortcut && (isFocused || isPressOnEnterActive),
            shouldBubble: allowBubble,
            priority: enterKeyEventListenerPriority,
            shouldPreventDefault: false,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [shouldDisableEnterShortcut, isFocused],
    );

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, keyboardShortcutCallback, config);

    return null;
}

function Button({
    allowBubble = false,

    iconRight,
    iconFill,
    iconHoverFill,
    icon = null,
    iconStyles = [],
    iconRightStyles = [],
    iconWrapperStyles = [],
    text = '',

    extraSmall = false,
    small = false,
    large = false,
    medium = !extraSmall && !small && !large,

    isLoading = false,
    isDisabled = false,

    onLayout = () => {},
    onPress = () => {},
    onLongPress = () => {},
    onPressIn = () => {},
    onPressOut = () => {},
    onMouseDown = undefined,

    pressOnEnter = false,
    enterKeyEventListenerPriority = 0,

    style = [],
    disabledStyle,
    innerStyles = [],
    textStyles = [],
    textHoverStyles = [],
    primaryTextNumberOfLines = 1,

    shouldUseDefaultHover = true,
    hoverStyles = undefined,
    success = false,
    danger = false,

    shouldRemoveRightBorderRadius = false,
    shouldRemoveLeftBorderRadius = false,
    shouldEnableHapticFeedback = false,
    isLongPressDisabled = false,
    shouldShowRightIcon = false,

    id = '',
    testID = undefined,
    accessibilityLabel = '',
    isSplitButton = false,
    link = false,
    isContentCentered = false,
    isPressOnEnterActive,
    isNested = false,
    secondLineText = '',
    shouldBlendOpacity = false,
    shouldStayNormalOnDisable = false,
    sentryLabel,
    ref,
    ...rest
}: ButtonProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isHovered, setIsHovered] = useState(false);

    const renderContent = () => {
        if ('children' in rest) {
            return rest.children;
        }

        const primaryText = (
            <Text
                numberOfLines={primaryTextNumberOfLines}
                style={[
                    primaryTextNumberOfLines !== 1 && styles.breakAll,
                    isLoading && styles.opacity0,
                    styles.pointerEventsNone,
                    styles.buttonText,
                    extraSmall && styles.buttonExtraSmallText,
                    small && styles.buttonSmallText,
                    medium && styles.buttonMediumText,
                    large && styles.buttonLargeText,
                    success && styles.buttonSuccessText,
                    danger && styles.buttonDangerText,
                    !!icon && styles.textAlignLeft,
                    !!secondLineText && styles.noPaddingBottom,
                    isHovered && textHoverStyles,
                    link && styles.fontWeightNormal,
                    link && styles.fontSizeLabel,
                    textStyles,
                    link && styles.link,
                    link && isHovered && StyleUtils.getColorStyle(theme.linkHover),
                ]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            >
                {text}
            </Text>
        );

        const textComponent = secondLineText ? (
            <View style={[styles.alignItemsCenter, styles.flexColumn, styles.flexShrink1, styles.mw100]}>
                {primaryText}
                <Text
                    style={[
                        isLoading && styles.opacity0,
                        styles.pointerEventsNone,
                        styles.fontWeightNormal,
                        styles.textDoubleDecker,
                        !!secondLineText && styles.textExtraSmallSupporting,
                        styles.textWhite,
                        styles.textBold,
                    ]}
                    numberOfLines={1}
                >
                    {secondLineText}
                </Text>
            </View>
        ) : (
            primaryText
        );

        const defaultFill = success || danger ? theme.textLight : theme.icon;

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (icon || shouldShowRightIcon) {
            return (
                <View style={[isContentCentered ? styles.justifyContentCenter : styles.justifyContentBetween, styles.flexRow, iconWrapperStyles, styles.mw100]}>
                    <View style={[styles.alignItemsCenter, styles.flexRow, styles.flexShrink1]}>
                        {!!icon && (
                            <View style={[extraSmall ? styles.mr1 : styles.mr2, !text && styles.mr0, iconStyles]}>
                                <Icon
                                    src={icon}
                                    fill={isHovered ? (iconHoverFill ?? defaultFill) : (iconFill ?? defaultFill)}
                                    extraSmall={extraSmall}
                                    small={small}
                                    medium={medium}
                                    large={large}
                                    isButtonIcon
                                />
                            </View>
                        )}
                        {!!text && textComponent}
                    </View>
                    {shouldShowRightIcon && (
                        <View style={[styles.justifyContentCenter, large ? styles.ml2 : styles.ml1, iconRightStyles]}>
                            {!isSplitButton ? (
                                <Icon
                                    src={iconRight ?? icons.ArrowRight}
                                    fill={isHovered ? (iconHoverFill ?? defaultFill) : (iconFill ?? defaultFill)}
                                    extraSmall={extraSmall}
                                    small={small}
                                    medium={medium}
                                    large={large}
                                    isButtonIcon
                                />
                            ) : (
                                <Icon
                                    src={iconRight ?? icons.ArrowRight}
                                    fill={isHovered ? (iconHoverFill ?? defaultFill) : (iconFill ?? defaultFill)}
                                    extraSmall={extraSmall}
                                    small={small}
                                    medium={medium}
                                    large={large}
                                    isButtonIcon
                                />
                            )}
                        </View>
                    )}
                </View>
            );
        }

        return textComponent;
    };

    const buttonStyles = useMemo<StyleProp<ViewStyle>>(
        () => [
            styles.button,
            StyleUtils.getButtonStyleWithIcon(styles, extraSmall, small, medium, large, !!icon, !!(text?.length > 0), shouldShowRightIcon),
            success ? styles.buttonSuccess : undefined,
            danger ? styles.buttonDanger : undefined,
            isDisabled && !shouldStayNormalOnDisable ? styles.buttonOpacityDisabled : undefined,
            isDisabled && !danger && !success && !shouldStayNormalOnDisable ? styles.buttonDisabled : undefined,
            shouldRemoveRightBorderRadius ? styles.noRightBorderRadius : undefined,
            shouldRemoveLeftBorderRadius ? styles.noLeftBorderRadius : undefined,
            text && shouldShowRightIcon ? styles.alignItemsStretch : undefined,
            innerStyles,
            link && styles.bgTransparent,
        ],
        [
            StyleUtils,
            danger,
            icon,
            innerStyles,
            isDisabled,
            large,
            link,
            medium,
            shouldRemoveLeftBorderRadius,
            shouldRemoveRightBorderRadius,
            shouldShowRightIcon,
            small,
            extraSmall,
            styles,
            success,
            text,
            shouldStayNormalOnDisable,
        ],
    );

    const buttonContainerStyles = useMemo<StyleProp<ViewStyle>>(
        () => [buttonStyles, shouldBlendOpacity && styles.buttonBlendContainer],
        [buttonStyles, shouldBlendOpacity, styles.buttonBlendContainer],
    );

    const buttonBlendForegroundStyle = useMemo<StyleProp<ViewStyle>>(() => {
        if (!shouldBlendOpacity) {
            return undefined;
        }

        const {backgroundColor, opacity} = StyleSheet.flatten(buttonStyles);

        return {
            backgroundColor,
            opacity,
        };
    }, [buttonStyles, shouldBlendOpacity]);

    return (
        <>
            {pressOnEnter && (
                <KeyboardShortcutComponent
                    isDisabled={isDisabled}
                    isLoading={isLoading}
                    allowBubble={allowBubble}
                    onPress={onPress}
                    pressOnEnter={pressOnEnter}
                    enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                    isPressOnEnterActive={isPressOnEnterActive}
                />
            )}
            <PressableWithFeedback
                dataSet={{
                    listener: pressOnEnter ? CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey : undefined,
                }}
                ref={ref as PressableRef}
                onLayout={onLayout}
                onPress={(event) => {
                    if (event?.type === 'click') {
                        const currentTarget = event?.currentTarget as HTMLElement;
                        currentTarget?.blur();
                    }

                    if (shouldEnableHapticFeedback) {
                        HapticFeedback.press();
                    }

                    if (isDisabled || isLoading) {
                        return; // Prevent the onPress from being triggered when the button is disabled or in a loading state
                    }
                    return onPress(event);
                }}
                onLongPress={(event) => {
                    if (isLongPressDisabled) {
                        return;
                    }
                    if (shouldEnableHapticFeedback) {
                        HapticFeedback.longPress();
                    }
                    onLongPress(event);
                }}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onMouseDown={onMouseDown}
                shouldBlendOpacity={shouldBlendOpacity}
                disabled={isLoading || isDisabled}
                wrapperStyle={[
                    isDisabled && !shouldStayNormalOnDisable ? {...styles.cursorDisabled, ...styles.noSelect} : {},
                    styles.buttonContainer,
                    shouldRemoveRightBorderRadius ? styles.noRightBorderRadius : undefined,
                    shouldRemoveLeftBorderRadius ? styles.noLeftBorderRadius : undefined,
                    style,
                ]}
                style={buttonContainerStyles}
                isNested={isNested}
                hoverStyle={
                    !isDisabled || !shouldStayNormalOnDisable
                        ? [
                              shouldUseDefaultHover && !isDisabled ? styles.buttonDefaultHovered : undefined,
                              success && !isDisabled ? styles.buttonSuccessHovered : undefined,
                              danger && !isDisabled ? styles.buttonDangerHovered : undefined,
                              hoverStyles,
                          ]
                        : []
                }
                disabledStyle={!shouldStayNormalOnDisable ? disabledStyle : undefined}
                id={id}
                testID={testID}
                accessibilityLabel={accessibilityLabel}
                role={getButtonRole(isNested)}
                hoverDimmingValue={1}
                onHoverIn={!isDisabled || !shouldStayNormalOnDisable ? () => setIsHovered(true) : undefined}
                onHoverOut={!isDisabled || !shouldStayNormalOnDisable ? () => setIsHovered(false) : undefined}
                sentryLabel={sentryLabel}
            >
                {shouldBlendOpacity && <View style={[StyleSheet.absoluteFill, buttonBlendForegroundStyle]} />}
                {renderContent()}
                {isLoading && (
                    <ActivityIndicator
                        color={success || danger ? theme.textLight : theme.text}
                        style={[styles.pAbsolute, styles.l0, styles.r0]}
                        size={extraSmall ? 12 : undefined}
                    />
                )}
            </PressableWithFeedback>
        </>
    );
}

export default withNavigationFallback(Button);

export type {ButtonProps};
