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
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import ButtonComposedContext from './ButtonComposedContext';
import type {ButtonComposedAppearanceProps} from './ButtonComposedContext';

type ButtonComposedEventsProps = {
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
};

type ButtonComposedBehaviorProps = {
    /** Indicates whether the button should be disabled and in the loading state */
    isLoading?: boolean;

    /** Indicates whether the button should be disabled */
    isDisabled?: boolean;

    /** Call the onPress function when Enter key is pressed */
    pressOnEnter?: boolean;

    /** The priority to assign the enter key event listener. 0 is the highest priority. */
    enterKeyEventListenerPriority?: number;

    /** Whether the Enter keyboard listening is active whether or not the screen that contains the button is focused */
    isPressOnEnterActive?: boolean;

    /** Should the press event bubble across multiple instances when Enter key triggers it. */
    allowBubble?: boolean;

    /** Whether button's content should be centered */
    isContentCentered?: boolean;

    /** Should enable the haptic feedback? */
    shouldEnableHapticFeedback?: boolean;

    /** Should disable the long press? */
    isLongPressDisabled?: boolean;

    /**
     * Whether the button should have a background layer in the color of theme.appBG.
     * This is needed for buttons that allow content to display under them.
     */
    shouldBlendOpacity?: boolean;

    /** Whether is a nested button inside other button, since nesting buttons isn't valid html */
    isNested?: boolean;

    /** Whether we should use the default hover style */
    shouldUseDefaultHover?: boolean;

    /** Should enable the haptic feedback? */
    shouldStayNormalOnDisable?: boolean;
};

type ButtonComposedStyleProps = ButtonComposedAppearanceProps & {
    /** Additional styles to add after local styles. Applied to Pressable portion of button */
    style?: StyleProp<ViewStyle>;

    /** Additional button styles. Specific to the OpacityView of the button */
    innerStyles?: StyleProp<ViewStyle>;

    /** Any additional styles to pass to the content container wrapping all children (icons + text). */
    contentContainerStyle?: StyleProp<ViewStyle>;

    /** Additional hover styles */
    hoverStyles?: StyleProp<ViewStyle>;

    /** Additional styles to add to the component when it's disabled */
    disabledStyle?: StyleProp<ViewStyle>;

    /** Should we remove the border radius on a specific side? */
    shouldRemoveBorderRadius?: 'left' | 'right' | 'all';
};

type ButtonComposedProps = WithSentryLabel &
    ButtonComposedEventsProps &
    ButtonComposedBehaviorProps &
    ButtonComposedStyleProps & {
        /** Sub-components to render inside the button */
        children: React.ReactNode;

        /** Id to use for this button */
        id?: string;

        /** The testID of the button. Used to locate this view in end-to-end tests. */
        testID?: string;

        /** Accessibility label for the component */
        accessibilityLabel?: string;

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
    contentContainerStyle = [],
    size,
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
    variant,
    shouldRemoveBorderRadius,
    shouldEnableHapticFeedback = false,
    isLongPressDisabled = false,
    id = '',
    testID = undefined,
    accessibilityLabel = '',
    isContentCentered = false,
    isPressOnEnterActive,
    isNested = false,
    shouldBlendOpacity = false,
    shouldStayNormalOnDisable = false,
    sentryLabel,
    ref,
}: ButtonComposedProps) {
    const resolvedSize = size ?? CONST.DROPDOWN_BUTTON_SIZE.MEDIUM;
    const theme = useTheme();
    const styles = useThemeStyles();
    const [isHovered, setIsHovered] = useState(false);
    const buttonLoadingReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'Button',
    };

    const contextValue = useMemo(
        () => ({
            isHovered,
            isLoading,
            variant,
            size: resolvedSize,
        }),
        [isHovered, isLoading, variant, resolvedSize],
    );

    const buttonVariantStyles = useMemo(() => {
        const shouldUseDisabledStyles = isDisabled && !shouldStayNormalOnDisable;
        if (!variant) {
            return shouldUseDisabledStyles ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined;
        }

        const defaultButtonVariantStyles = {
            success: styles.buttonSuccess,
            danger: styles.buttonDanger,
            link: styles.bgTransparent,
        };

        const disabledButtonVariantStyles = {
            success: [styles.buttonOpacityDisabled],
            danger: [styles.buttonOpacityDisabled],
            link: [styles.buttonOpacityDisabled, styles.buttonDisabled],
        };

        return [defaultButtonVariantStyles[variant], shouldUseDisabledStyles && disabledButtonVariantStyles[variant]];
    }, [isDisabled, shouldStayNormalOnDisable, styles, variant]);

    const buttonStyles = useMemo<StyleProp<ViewStyle>>(() => {
        return [
            styles.button,
            styles.buttonMedium,
            buttonVariantStyles,
            shouldRemoveBorderRadius === 'right' || shouldRemoveBorderRadius === 'all' ? styles.noRightBorderRadius : undefined,
            shouldRemoveBorderRadius === 'left' || shouldRemoveBorderRadius === 'all' ? styles.noLeftBorderRadius : undefined,
            innerStyles,
        ];
    }, [styles, shouldRemoveBorderRadius, innerStyles, buttonVariantStyles]);

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
                id={id}
                testID={testID}
                accessibilityLabel={accessibilityLabel}
                sentryLabel={sentryLabel}
                role={getButtonRole(isNested)}
                isNested={isNested}
                disabled={isLoading || isDisabled}
                disabledStyle={!shouldStayNormalOnDisable ? disabledStyle : undefined}
                shouldBlendOpacity={shouldBlendOpacity}
                style={[buttonStyles, {backgroundColor: 'red'}]}
                wrapperStyle={[
                    isDisabled && !shouldStayNormalOnDisable ? {...styles.cursorDisabled, ...styles.noSelect} : {},
                    styles.buttonContainer,
                    shouldRemoveBorderRadius === 'right' || shouldRemoveBorderRadius === 'all' ? styles.noRightBorderRadius : undefined,
                    shouldRemoveBorderRadius === 'left' || shouldRemoveBorderRadius === 'all' ? styles.noLeftBorderRadius : undefined,
                    style,
                ]}
                hoverDimmingValue={1}
                hoverStyle={
                    !isDisabled || !shouldStayNormalOnDisable
                        ? [
                              shouldUseDefaultHover && !isDisabled ? styles.buttonDefaultHovered : undefined,
                              variant === 'success' && !isDisabled ? styles.buttonSuccessHovered : undefined,
                              variant === 'danger' && !isDisabled ? styles.buttonDangerHovered : undefined,
                              hoverStyles,
                          ]
                        : []
                }
                onLayout={onLayout}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onMouseDown={onMouseDown}
                onHoverIn={!isDisabled || !shouldStayNormalOnDisable ? () => setIsHovered(true) : undefined}
                onHoverOut={!isDisabled || !shouldStayNormalOnDisable ? () => setIsHovered(false) : undefined}
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
            >
                <ButtonComposedContext.Provider value={contextValue}>
                    <View
                        style={[
                            styles.flexRow,
                            styles.alignItemsCenter,
                            isContentCentered ? styles.justifyContentCenter : styles.justifyContentBetween,
                            contentContainerStyle,
                            styles.mw100,
                            isLoading && styles.opacity0,
                        ]}
                    >
                        {children}
                    </View>
                </ButtonComposedContext.Provider>
                {isLoading && (
                    <ActivityIndicator
                        color={variant === 'success' || variant === 'danger' ? theme.textLight : theme.text}
                        style={[styles.pAbsolute, styles.l0, styles.r0]}
                        size={resolvedSize === CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL ? 12 : undefined}
                        reasonAttributes={buttonLoadingReasonAttributes}
                    />
                )}
            </PressableWithFeedback>
        </>
    );
}

export default ButtonComposed;
export type {ButtonComposedProps};
