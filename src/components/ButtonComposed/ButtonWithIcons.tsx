import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type {ButtonProps} from './Button';
import Button from './Button';
import ButtonDoubleLineText from './primitives/ButtonDoubleLineText';
import {ButtonIconLeft, ButtonIconRight} from './primitives/ButtonIcons';
import ButtonText from './primitives/ButtonText';

type ButtonWithIconsProps = ButtonProps & {
    // Icon Left Props
    iconLeft?: IconAsset;
    iconLeftFill?: string;
    iconLeftHoverFill?: string;
    iconLeftStyles?: StyleProp<ViewStyle>;
    // Text Props
    text?: string;
    secondLineText?: string;
    textHoverStyles?: StyleProp<TextStyle>;
    textStyles?: StyleProp<TextStyle>;
    textNumberOfLines?: number;
    // Icon Right Props
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
    iconLeft,
    iconLeftFill,
    iconLeftHoverFill,
    iconLeftStyles = [],
    text = '',
    secondLineText,
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
    const buttonStyle = StyleUtils.getButtonStyleWithIcon(styles, size, !!iconLeft, text?.length > 0, !!iconRight);
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
            {secondLineText ? (
                <ButtonDoubleLineText
                    primaryText={text}
                    secondLineText={secondLineText}
                    hoverStyle={textHoverStyles}
                    textStyle={textStyles}
                    primaryTextNumberOfLines={textNumberOfLines}
                />
            ) : (
                !!text && (
                    <ButtonText
                        hoverStyle={textHoverStyles}
                        style={[!!iconLeft && styles.textAlignLeft, textStyles]}
                        numberOfLines={textNumberOfLines}
                    >
                        {text}
                    </ButtonText>
                )
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
