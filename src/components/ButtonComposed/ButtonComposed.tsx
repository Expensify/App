import {useIsFocused} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import type {GestureResponderEvent, LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import {getButtonRole} from '@components/Button/utils';
import validateSubmitShortcut from '@components/Button/validateSubmitShortcut';
import type {PressableRef} from '@components/Pressable/GenericPressable/types';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useActiveElementRole from '@hooks/useActiveElementRole';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import HapticFeedback from '@libs/HapticFeedback';
import CONST from '@src/CONST';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import ButtonComposedContext from './ButtonComposedContext';

type ButtonComposedProps = WithSentryLabel & {
    /** Sub-components to render inside the button */
    children: React.ReactNode;

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

    /** Invoked on mount and layout changes */
    onLayout?: (event: LayoutChangeEvent) => void;

    /** Indicates whether the button should be disabled and in the loading state */
    isLoading?: boolean;

    /** Indicates whether the button should be disabled */
    isDisabled?: boolean;

    /** Extra-small sized button */
    extraSmall?: boolean;

    /** Small sized button */
    small?: boolean;

    /** Medium sized button */
    medium?: boolean;

    /** Large sized button */
    large?: boolean;

    /** Whether we should use the success theme color */
    success?: boolean;

    /** Whether we should use the danger theme color */
    danger?: boolean;

    /** Whether we should display the button as a link */
    link?: boolean;

    /** Whether button's content should be centered */
    isContentCentered?: boolean;

    /** Call the onPress function when Enter key is pressed */
    pressOnEnter?: boolean;

    /** The priority to assign the enter key event listener. 0 is the highest priority. */
    enterKeyEventListenerPriority?: number;

    /** Whether the Enter keyboard listening is active whether or not the screen that contains the button is focused */
    isPressOnEnterActive?: boolean;

    /** Should the press event bubble across multiple instances when Enter key triggers it. */
    allowBubble?: boolean;

    /** Additional styles to add after local styles. Applied to Pressable portion of button */
    style?: StyleProp<ViewStyle>;

    /** Additional button styles. Specific to the OpacityView of the button */
    innerStyles?: StyleProp<ViewStyle>;

    /** Any additional styles to pass to the icon wrapper container. */
    iconWrapperStyles?: StyleProp<ViewStyle>;

    /** Should we remove the right border radius top + bottom? */
    shouldRemoveRightBorderRadius?: boolean;

    /** Should we remove the left border radius top + bottom? */
    shouldRemoveLeftBorderRadius?: boolean;

    /** Should enable the haptic feedback? */
    shouldEnableHapticFeedback?: boolean;

    /** Should disable the long press? */
    isLongPressDisabled?: boolean;

    /**
     * Whether the button should have a background layer in the color of theme.appBG.
     * This is needed for buttons that allow content to display under them.
     */
    shouldBlendOpacity?: boolean;

    /** Id to use for this button */
    id?: string;

    /** The testID of the button. Used to locate this view in end-to-end tests. */
    testID?: string;

    /** Accessibility label for the component */
    accessibilityLabel?: string;

    /** Whether is a nested button inside other button, since nesting buttons isn't valid html */
    isNested?: boolean;

    /** Whether we should use the default hover style */
    shouldUseDefaultHover?: boolean;

    /** Additional hover styles */
    hoverStyles?: StyleProp<ViewStyle>;

    /** Additional styles to add to the component when it's disabled */
    disabledStyle?: StyleProp<ViewStyle>;

    /**
     * Whether the button should stay visually normal even when disabled.
     */
    shouldStayNormalOnDisable?: boolean;

    /**
     * Reference to the outer element.
     */
    ref?: ForwardedRef<View>;
};

type KeyboardShortcutComponentProps = Pick<
    ButtonComposedProps,
    'isDisabled' | 'isLoading' | 'onPress' | 'pressOnEnter' | 'allowBubble' | 'enterKeyEventListenerPriority' | 'isPressOnEnterActive'
>;

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

function ButtonComposed({
    children,
    allowBubble = false,
    iconWrapperStyles = [],
    extraSmall = false,
    small = false,
    large = false,
    medium: mediumProp,
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
    shouldUseDefaultHover = true,
    hoverStyles = undefined,
    success = false,
    danger = false,
    shouldRemoveRightBorderRadius = false,
    shouldRemoveLeftBorderRadius = false,
    shouldEnableHapticFeedback = false,
    isLongPressDisabled = false,
    id = '',
    testID = undefined,
    accessibilityLabel = '',
    link = false,
    isContentCentered = false,
    isPressOnEnterActive,
    isNested = false,
    shouldBlendOpacity = false,
    shouldStayNormalOnDisable = false,
    sentryLabel,
    ref,
}: ButtonComposedProps) {
    const medium = mediumProp ?? (!extraSmall && !small && !large);
    const theme = useTheme();
    const styles = useThemeStyles();
    const [isHovered, setIsHovered] = useState(false);

    const contextValue = useMemo(
        () => ({
            isHovered,
            isLoading,
            success,
            danger,
            extraSmall,
            small,
            medium,
            large,
            link,
        }),
        [isHovered, isLoading, success, danger, extraSmall, small, medium, large, link],
    );

    const buttonStyles = useMemo<StyleProp<ViewStyle>>(
        () => [
            styles.button,
            styles.buttonMedium,
            success ? styles.buttonSuccess : undefined,
            danger ? styles.buttonDanger : undefined,
            isDisabled && !shouldStayNormalOnDisable ? styles.buttonOpacityDisabled : undefined,
            isDisabled && !danger && !success && !shouldStayNormalOnDisable ? styles.buttonDisabled : undefined,
            shouldRemoveRightBorderRadius ? styles.noRightBorderRadius : undefined,
            shouldRemoveLeftBorderRadius ? styles.noLeftBorderRadius : undefined,
            innerStyles,
            link && styles.bgTransparent,
        ],
        [danger, innerStyles, isDisabled, link, shouldRemoveLeftBorderRadius, shouldRemoveRightBorderRadius, styles, success, shouldStayNormalOnDisable],
    );

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
                        return;
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
                style={buttonStyles}
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
                <ButtonComposedContext.Provider value={contextValue}>
                    <View
                        style={[
                            styles.flexRow,
                            styles.alignItemsCenter,
                            isContentCentered ? styles.justifyContentCenter : styles.justifyContentBetween,
                            iconWrapperStyles,
                            styles.mw100,
                            isLoading && styles.opacity0,
                        ]}
                    >
                        {children}
                    </View>
                </ButtonComposedContext.Provider>
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

export default ButtonComposed;
export type {ButtonComposedProps};
