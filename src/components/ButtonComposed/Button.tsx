import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import {getButtonRole} from '@components/Button/utils';
import validateSubmitShortcut from '@components/Button/validateSubmitShortcut';
import type {PressableRef} from '@components/Pressable/GenericPressable/types';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useActiveElementRole from '@hooks/useActiveElementRole';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import HapticFeedback from '@libs/HapticFeedback';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import {ButtonContext} from './context';
import type {ButtonProps, KeyboardShortcutComponentProps} from './types';

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
    children,
    allowBubble = false,
    contentContainerStyle = [],
    size = CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
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
    isPressOnEnterActive,
    isNested = false,
    shouldBlendOpacity = false,
    shouldStayNormalOnDisable = false,
    sentryLabel,
    ref,
    accessibilityState,
}: ButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isHovered, setIsHovered] = useState(false);
    const buttonLoadingReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'Button',
    };

    const contextValue = useMemo(
        () => ({
            isHovered,
            isLoading,
            variant,
            size,
        }),
        [isHovered, isLoading, variant, size],
    );

    const buttonVariantStyles = useMemo(() => {
        const shouldUseDisabledStyles = isDisabled && !shouldStayNormalOnDisable;
        if (!variant) {
            return shouldUseDisabledStyles ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined;
        }

        const {normal: defaultStyles, disabled: disabledStyles} = StyleUtils.getButtonVariantStyles(styles);
        return [defaultStyles[variant], shouldUseDisabledStyles && disabledStyles[variant]];
    }, [isDisabled, shouldStayNormalOnDisable, styles, variant, StyleUtils]);

    const buttonSizeStyle = useMemo<StyleProp<ViewStyle>>(() => {
        const allButtonSizeStyles = {
            [CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL]: styles.buttonExtraSmall,
            [CONST.DROPDOWN_BUTTON_SIZE.SMALL]: styles.buttonSmall,
            [CONST.DROPDOWN_BUTTON_SIZE.MEDIUM]: styles.buttonMedium,
            [CONST.DROPDOWN_BUTTON_SIZE.LARGE]: styles.buttonLarge,
        };
        return allButtonSizeStyles[size];
    }, [size, styles.buttonExtraSmall, styles.buttonLarge, styles.buttonMedium, styles.buttonSmall]);

    const borderRadiusStyles = useMemo<Record<'left' | 'right' | 'all', StyleProp<ViewStyle>>>(
        () => ({
            right: styles.noRightBorderRadius,
            left: styles.noLeftBorderRadius,
            all: [styles.noRightBorderRadius, styles.noLeftBorderRadius],
        }),
        [styles.noRightBorderRadius, styles.noLeftBorderRadius],
    );

    const buttonStyles = useMemo<StyleProp<ViewStyle>>(
        () => [
            styles.button,
            buttonSizeStyle,
            buttonVariantStyles,
            shouldRemoveBorderRadius ? borderRadiusStyles[shouldRemoveBorderRadius] : undefined,
            styles.alignItemsStretch,
            innerStyles,
            variant === 'link' && styles.bgTransparent,
        ],
        [styles.button, styles.alignItemsStretch, styles.bgTransparent, buttonSizeStyle, buttonVariantStyles, shouldRemoveBorderRadius, borderRadiusStyles, innerStyles, variant],
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
                id={id}
                testID={testID}
                accessibilityLabel={accessibilityLabel}
                accessibilityState={accessibilityState}
                sentryLabel={sentryLabel}
                role={getButtonRole(isNested)}
                isNested={isNested}
                disabled={isLoading || isDisabled}
                disabledStyle={!shouldStayNormalOnDisable ? disabledStyle : undefined}
                shouldBlendOpacity={shouldBlendOpacity}
                style={buttonContainerStyles}
                wrapperStyle={[
                    isDisabled && !shouldStayNormalOnDisable ? {...styles.cursorDisabled, ...styles.noSelect} : {},
                    styles.buttonContainer,
                    shouldRemoveBorderRadius ? borderRadiusStyles[shouldRemoveBorderRadius] : undefined,
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
                {shouldBlendOpacity && <View style={[StyleSheet.absoluteFill, buttonBlendForegroundStyle]} />}
                <ButtonContext.Provider value={contextValue}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, contentContainerStyle, styles.mw100]}>{children}</View>
                </ButtonContext.Provider>
                {isLoading && (
                    <ActivityIndicator
                        color={variant === 'success' || variant === 'danger' ? theme.textLight : theme.text}
                        style={[styles.pAbsolute, styles.l0, styles.r0]}
                        size={size === CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL ? 12 : undefined}
                        reasonAttributes={buttonLoadingReasonAttributes}
                    />
                )}
            </PressableWithFeedback>
        </>
    );
}

export default Button;
