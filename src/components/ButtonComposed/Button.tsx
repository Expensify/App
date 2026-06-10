import React, {useMemo, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {StyleSheet, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import ActivityIndicator from '@components/ActivityIndicator';
import {getButtonRole} from '@components/Button/utils';
import type {PressableRef} from '@components/Pressable/GenericPressable/types';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import HapticFeedback from '@libs/HapticFeedback';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import {ButtonContext} from './context';
import type {ButtonProps} from './types';

function Button({
    children,
    contentContainerStyle = [],
    size = CONST.BUTTON_SIZE.MEDIUM,
    isLoading = false,
    isDisabled = false,
    onLayout = () => {},
    onPress = () => {},
    onLongPress = () => {},
    onPressIn = () => {},
    onPressOut = () => {},
    onMouseDown = undefined,
    style = [],
    disabledStyle,
    innerStyles = [],
    hoverStyles,
    useDefaultHover = true,
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
    const buttonLoadingReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'Button',
    };

    const contextValue = useMemo(
        () => ({
            isHovered,
            variant,
            size,
        }),
        [isHovered, variant, size],
    );

    const buttonVariantStyles = useMemo(() => {
        const shouldUseDisabledStyles = isDisabled && !stayNormalOnDisable;
        if (!variant) {
            return shouldUseDisabledStyles ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined;
        }

        const {normal: defaultStyles, disabled: disabledStyles} = StyleUtils.getButtonVariantStyles(styles);
        return [defaultStyles[variant], shouldUseDisabledStyles && disabledStyles[variant]];
    }, [isDisabled, stayNormalOnDisable, styles, variant, StyleUtils]);

    const borderRadiusStyles = useMemo<Record<'left' | 'right' | 'all', StyleProp<ViewStyle>>>(
        () => ({
            right: styles.noRightBorderRadius,
            left: styles.noLeftBorderRadius,
            all: [styles.noRightBorderRadius, styles.noLeftBorderRadius],
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
    if (variant === 'danger') {
        loadingIndicatorColor = theme.buttonDangerText;
    } else if (variant === 'success') {
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
            blendOpacity={blendOpacity}
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
                          useDefaultHover && !isDisabled ? styles.buttonDefaultHovered : undefined,
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
            onHoverIn={!isDisabled || !stayNormalOnDisable ? () => setIsHovered(true) : undefined}
            onHoverOut={!isDisabled || !stayNormalOnDisable ? () => setIsHovered(false) : undefined}
            onPress={(event) => {
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
                return onPress(event);
            }}
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
            <ButtonContext.Provider value={contextValue}>
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
            </ButtonContext.Provider>
            {isLoading && (
                <ActivityIndicator
                    color={loadingIndicatorColor}
                    style={[styles.pAbsolute, styles.l0, styles.r0]}
                    reasonAttributes={buttonLoadingReasonAttributes}
                />
            )}
        </PressableWithFeedback>
    );
}

export default Button;
