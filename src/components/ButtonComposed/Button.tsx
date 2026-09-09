import ActivityIndicator from '@components/ActivityIndicator';
import {getButtonRole} from '@components/Button/utils';
import type {PressableRef} from '@components/Pressable/GenericPressable/types';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';

import usePressLoading from '@hooks/usePressLoading';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import HapticFeedback from '@libs/HapticFeedback';

import CONST from '@src/CONST';

import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React, {useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import type {ButtonProps} from './types';

import {ButtonActionsContext, ButtonStateContext} from './context';

function Button({
    children,
    contentContainerStyle = [],
    size = CONST.BUTTON_SIZE.MEDIUM,
    isLoading: isOnyxLoading,
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

    // Merges the consumer's isLoading with the pressed state into the single flag that drives the spinner.
    const {isLoading, startWithLoading} = usePressLoading({isLoading: isOnyxLoading});

    // Shared by a pointer press and the Enter shortcut, so both take the same route into onPress.
    const runPress = (event?: GestureResponderEvent | KeyboardEvent) => {
        if (isDisabled || isLoading) {
            return;
        }
        if (shouldShowLoadingImmediatelyOnPress) {
            return startWithLoading(() => onPress(event));
        }
        return onPress(event, startWithLoading);
    };

    // Entry point for a pointer press: drops focus from the pressed element and fires haptic feedback before the shared press logic.
    const handlePress = (event?: GestureResponderEvent | KeyboardEvent) => {
        if (event?.type === 'click') {
            const currentTarget = event?.currentTarget as HTMLElement;
            currentTarget?.blur();
        }

        if (enableHapticFeedback) {
            HapticFeedback.press();
        }

        return runPress(event);
    };

    // Entry point for the Enter shortcut: same press logic as a pointer press, without the mouse-only blur and haptic feedback.
    const handleEnterPress = () => runPress();

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
