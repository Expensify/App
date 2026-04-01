import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type {ButtonProps} from './Button';
import Button from './Button';
import {ButtonIconLeft, ButtonIconRight} from './ButtonIcons';
import ButtonText from './ButtonText';

type ButtonWithIconsProps = ButtonProps & {
    // ICON LEFT PROPS
    iconLeft?: IconAsset;
    iconLeftFill?: string;
    iconLeftHoverFill?: string;
    iconLeftStyles?: StyleProp<ViewStyle>;
    // TEXT PROPS
    text?: string;
    textHoverStyles?: StyleProp<TextStyle>;
    textStyles?: StyleProp<TextStyle>;
    textNumberOfLines?: number;
    // ICON RIGHT PROPS
    iconRight?: IconAsset;
    iconRightFill?: string;
    iconRightHoverFill?: string;
    iconRightStyles?: StyleProp<ViewStyle>;
};

function ButtonWithIcons({
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
    // USED ONLY HERE
    iconLeft,
    iconLeftFill,
    iconLeftHoverFill,
    iconLeftStyles = [],
    text = '',
    textHoverStyles = [],
    textStyles = [],
    textNumberOfLines = 1,
    iconRight,
    iconRightFill,
    iconRightHoverFill,
    iconRightStyles = [],
}: ButtonWithIconsProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const buttonStyle = StyleUtils.getButtonStyleWithIcon(
        styles,
        size === CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL,
        size === CONST.DROPDOWN_BUTTON_SIZE.SMALL,
        size === CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
        size === CONST.DROPDOWN_BUTTON_SIZE.LARGE,
        !!iconLeft,
        text?.length > 0,
        !!iconRight,
    );
    return (
        <Button
            allowBubble={allowBubble}
            contentContainerStyle={contentContainerStyle}
            size={size}
            isLoading={isLoading}
            isDisabled={isDisabled}
            onLayout={onLayout}
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onMouseDown={onMouseDown}
            pressOnEnter={pressOnEnter}
            enterKeyEventListenerPriority={enterKeyEventListenerPriority}
            style={style}
            disabledStyle={disabledStyle}
            innerStyles={[buttonStyle, !!text && !!iconRight && styles.alignItemsStretch, innerStyles]}
            shouldUseDefaultHover={shouldUseDefaultHover}
            hoverStyles={hoverStyles}
            variant={variant}
            shouldRemoveBorderRadius={shouldRemoveBorderRadius}
            shouldEnableHapticFeedback={shouldEnableHapticFeedback}
            isLongPressDisabled={isLongPressDisabled}
            id={id}
            testID={testID}
            accessibilityLabel={accessibilityLabel}
            isPressOnEnterActive={isPressOnEnterActive}
            isNested={isNested}
            shouldBlendOpacity={shouldBlendOpacity}
            shouldStayNormalOnDisable={shouldStayNormalOnDisable}
            sentryLabel={sentryLabel}
            ref={ref}
        >
            {!!iconLeft && (
                <ButtonIconLeft
                    src={iconLeft}
                    fill={iconLeftFill}
                    hoverFill={iconLeftHoverFill}
                    style={[!text && styles.mr0, iconLeftStyles]}
                />
            )}
            {!!text && (
                <ButtonText
                    hoverStyle={textHoverStyles}
                    style={[!!iconLeft && styles.textAlignLeft, textStyles]}
                    numberOfLines={textNumberOfLines}
                >
                    {text}
                </ButtonText>
            )}
            {!!iconRight && (
                <ButtonIconRight
                    src={iconRight}
                    fill={iconRightFill}
                    hoverFill={iconRightHoverFill}
                    style={iconRightStyles}
                />
            )}
        </Button>
    );
}

export default ButtonWithIcons;
export type {ButtonWithIconsProps};
