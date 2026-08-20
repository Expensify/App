import ActivityIndicator from '@components/ActivityIndicator';
import {getButtonRole} from '@components/Button/utils';
import type {PressableRef} from '@components/Pressable/GenericPressable/types';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import HapticFeedback from '@libs/HapticFeedback';

import CONST from '@src/CONST';

import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {NavigationContext} from '@react-navigation/core';
import React, {useContext, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import type {ButtonProps, PressLoadingController} from './types';

import {ButtonActionsContext, ButtonStateContext} from './context';

function Button({
    children,
    contentContainerStyle = [],
    size = CONST.BUTTON_SIZE.MEDIUM,
    isLoading: isOnyxLoading = false,
    shouldShowLoadingImmediatelyOnPress = false,
    isDisabled = false,
    onLayout = () => {},
    onPress = () => {},
    onLongPress = () => {},
    onPressIn = () => {},
    onPressOut = () => {},
    onMouseDown = undefined,
    onFocus = undefined,
    onBlur = undefined,
    style = [],
    disabledStyle,
    innerStyles = [],
    hoverStyles,
    variant,
    removeBorderRadius,
    enableHapticFeedback = false,
    isLongPressDisabled = false,
    id = '',
    testID = undefined,
    accessibilityLabel = '',
    isNested = false,
    blendOpacity = false,
    stayNormalOnDisable = false,
    sentryLabel,
    ref,
    accessibilityState,
}: ButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isHovered, setIsHovered] = useState(false);

    // Local flag set the instant the button is pressed, used only when the immediate-loading mechanism is engaged.
    const [isPressed, setIsPressed] = useState(false);
    const navigationContext = useContext(NavigationContext);

    // Hand the loading state over from the local press flag to the external isOnyxLoading once it turns true, so the spinner doesn't flip off and back on.
    if (isPressed && isOnyxLoading) {
        setIsPressed(false);
    }

    // Combined loading used for rendering, the press guard and the disabled state.
    const isLoading = isPressed || isOnyxLoading;

    // Reset the pressed state when the screen regains focus, covering flows that navigate away and return without an external
    // isOnyxLoading to hand off to. Subscribed lazily: only while a press is pending, so buttons that never use the mechanism add no listener.
    // Note: this Button is not wrapped in withNavigationFallback, so outside a navigator navigationContext is undefined and reset is simply skipped.
    useEffect(() => {
        if (!isPressed || !navigationContext) {
            return;
        }
        return navigationContext.addListener('focus', () => setIsPressed(false));
    }, [isPressed, navigationContext]);

    // Show the spinner immediately, let React paint it, then run the real work one macrotask later so a JS-blocking onPress doesn't delay the feedback.
    const startWithLoading = async (runAfterPaint: () => void | Promise<void>) => {
        setIsPressed(true);
        await new Promise((resolve) => {
            setTimeout(resolve, 0);
        });
        try {
            await runAfterPaint();
        } catch (error) {
            setIsPressed(false);
            throw error;
        }
    };

    // Passed to onPress so a handler can enter the loading state itself, after its own validation/branching.
    const loadingController: PressLoadingController = {run: startWithLoading};

    const handlePress = (event?: GestureResponderEvent | KeyboardEvent) => {
        if (event?.type === 'click') {
            const currentTarget = event?.currentTarget as HTMLElement;
            currentTarget?.blur();
        }

        if (enableHapticFeedback) {
            HapticFeedback.press();
        }

        if (isDisabled || isLoading) {
            return;
        }
        // Simple tier: wrap the whole handler. Otherwise hand the controller to onPress so it can opt in per branch.
        if (shouldShowLoadingImmediatelyOnPress) {
            return startWithLoading(() => onPress(event, loadingController));
        }
        return onPress(event, loadingController);
    };

    // Route the Enter shortcut (fired by ButtonKeyboardShortcut via the actions context) through the same paths as a pointer
    // press, minus the mouse-only blur/haptic handling — so the immediate spinner works on Enter too. Living in the actions
    // context (functions only) keeps it clear of rulesdir/context-provider-split-values.
    const handleEnterPress = () => {
        if (isDisabled || isLoading) {
            return;
        }
        if (shouldShowLoadingImmediatelyOnPress) {
            return startWithLoading(() => onPress(undefined, loadingController));
        }
        return onPress(undefined, loadingController);
    };

    const buttonVariantStyles = useMemo(() => {
        const shouldUseDisabledStyles = isDisabled && !stayNormalOnDisable;
        if (!variant) {
            return shouldUseDisabledStyles ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined;
        }

        const {normal: defaultStyles, disabled: disabledStyles} = StyleUtils.getButtonVariantStyles(styles);
        return [defaultStyles[variant], shouldUseDisabledStyles && disabledStyles[variant]];
    }, [isDisabled, stayNormalOnDisable, styles, variant, StyleUtils]);

    const borderRadiusStyles = useMemo<Record<ValueOf<typeof CONST.BUTTON_REMOVE_BORDER_RADIUS>, StyleProp<ViewStyle>>>(
        () => ({
            [CONST.BUTTON_REMOVE_BORDER_RADIUS.RIGHT]: styles.noRightBorderRadius,
            [CONST.BUTTON_REMOVE_BORDER_RADIUS.LEFT]: styles.noLeftBorderRadius,
            [CONST.BUTTON_REMOVE_BORDER_RADIUS.ALL]: [styles.noRightBorderRadius, styles.noLeftBorderRadius],
        }),
        [styles.noRightBorderRadius, styles.noLeftBorderRadius],
    );

    const horizontalPaddingBySize = useMemo<Record<ValueOf<typeof CONST.BUTTON_SIZE>, ViewStyle>>(
        () => ({
            [CONST.BUTTON_SIZE.SMALL]: styles.ph2,
            [CONST.BUTTON_SIZE.MEDIUM]: styles.ph3,
            [CONST.BUTTON_SIZE.LARGE]: styles.ph4,
        }),
        [styles.ph2, styles.ph3, styles.ph4],
    );

    const buttonStyles = useMemo<StyleProp<ViewStyle>>(
        () => [
            styles.button,
            StyleUtils.getButtonSizeStyle(styles, size),
            horizontalPaddingBySize[size],
            buttonVariantStyles,
            removeBorderRadius ? borderRadiusStyles[removeBorderRadius] : undefined,
            styles.alignItemsStretch,
            innerStyles,
        ],
        [styles, StyleUtils, size, horizontalPaddingBySize, buttonVariantStyles, removeBorderRadius, borderRadiusStyles, innerStyles],
    );

    const buttonContainerStyles = useMemo<StyleProp<ViewStyle>>(() => [buttonStyles, blendOpacity && styles.buttonBlendContainer], [buttonStyles, blendOpacity, styles.buttonBlendContainer]);

    const buttonBlendForegroundStyle = useMemo<StyleProp<ViewStyle>>(() => {
        if (!blendOpacity) {
            return undefined;
        }

        const {backgroundColor, opacity} = StyleSheet.flatten(buttonStyles);

        return {
            backgroundColor,
            opacity,
        };
    }, [buttonStyles, blendOpacity]);

    let loadingIndicatorColor = theme.text;
    if (variant === CONST.BUTTON_VARIANT.DANGER) {
        loadingIndicatorColor = theme.buttonDangerText;
    } else if (variant === CONST.BUTTON_VARIANT.SUCCESS) {
        loadingIndicatorColor = theme.textLight;
    }

    return (
        <PressableWithFeedback
            ref={ref as PressableRef}
            id={id}
            testID={testID}
            accessibilityLabel={accessibilityLabel}
            accessibilityState={accessibilityState}
            sentryLabel={sentryLabel}
            role={getButtonRole(isNested)}
            isNested={isNested}
            disabled={isLoading || isDisabled}
            disabledStyle={!stayNormalOnDisable ? disabledStyle : undefined}
            shouldBlendOpacity={blendOpacity}
            style={buttonContainerStyles}
            wrapperStyle={[
                isDisabled && !stayNormalOnDisable ? {...styles.cursorDisabled, ...styles.noSelect} : {},
                styles.buttonContainer,
                removeBorderRadius ? borderRadiusStyles[removeBorderRadius] : undefined,
                style,
            ]}
            hoverDimmingValue={1}
            hoverStyle={
                !isDisabled || !stayNormalOnDisable
                    ? [
                          !isDisabled ? styles.buttonDefaultHovered : undefined,
                          variant === CONST.BUTTON_VARIANT.SUCCESS && !isDisabled ? styles.buttonSuccessHovered : undefined,
                          variant === CONST.BUTTON_VARIANT.DANGER && !isDisabled ? styles.buttonDangerHovered : undefined,
                          hoverStyles,
                      ]
                    : []
            }
            onLayout={onLayout}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onMouseDown={onMouseDown}
            onFocus={onFocus}
            onBlur={onBlur}
            onHoverIn={!isDisabled || !stayNormalOnDisable ? () => setIsHovered(true) : undefined}
            onHoverOut={!isDisabled || !stayNormalOnDisable ? () => setIsHovered(false) : undefined}
            onPress={handlePress}
            onLongPress={(event) => {
                if (isLongPressDisabled) {
                    return;
                }
                if (enableHapticFeedback) {
                    HapticFeedback.longPress();
                }
                onLongPress(event);
            }}
        >
            {blendOpacity && <View style={[StyleSheet.absoluteFill, buttonBlendForegroundStyle]} />}
            <ButtonStateContext.Provider value={{isHovered, variant, size, isDisabled, isLoading}}>
                <ButtonActionsContext.Provider value={{onPress: handleEnterPress}}>
                    <View
                        style={[
                            styles.flexRow,
                            styles.alignItemsCenter,
                            styles.justifyContentCenter,
                            contentContainerStyle,
                            styles.mw100,
                            size !== CONST.BUTTON_SIZE.SMALL && styles.gap1,
                            isLoading && styles.opacity0,
                        ]}
                    >
                        {children}
                    </View>
                </ButtonActionsContext.Provider>
            </ButtonStateContext.Provider>
            {isLoading && (
                <ActivityIndicator
                    color={loadingIndicatorColor}
                    style={[styles.pAbsolute, styles.l0, styles.r0]}
                />
            )}
        </PressableWithFeedback>
    );
}

export default Button;
