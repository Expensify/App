import Button from '@components/ButtonComposed/Button';
import ButtonDoubleLineText from '@components/ButtonComposed/primitives/ButtonDoubleLineText';
import ButtonIcon from '@components/ButtonComposed/primitives/ButtonIcon';
import ButtonKeyboardShortcut from '@components/ButtonComposed/primitives/ButtonKeyboardShortcut';
import ButtonText from '@components/ButtonComposed/primitives/ButtonText';
import type {BaseButtonProps, ButtonKeyboardShortcutProps} from '@components/ButtonComposed/types';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import React from 'react';

type ButtonWithIconsProps = BaseButtonProps &
    ButtonKeyboardShortcutProps & {
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
    variant,
    removeBorderRadius,
    enableHapticFeedback = false,
    isLongPressDisabled = false,
    id = '',
    testID = undefined,
    accessibilityLabel = '',
    accessibilityState,
    isPressOnEnterActive,
    isNested = false,
    blendOpacity = false,
    stayNormalOnDisable = false,
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
    return (
        <Button
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
            style={style}
            disabledStyle={disabledStyle}
            innerStyles={innerStyles}
            variant={variant}
            removeBorderRadius={removeBorderRadius}
            enableHapticFeedback={enableHapticFeedback}
            isLongPressDisabled={isLongPressDisabled}
            id={id}
            testID={testID}
            accessibilityLabel={accessibilityLabel}
            accessibilityState={accessibilityState}
            isNested={isNested}
            blendOpacity={blendOpacity}
            stayNormalOnDisable={stayNormalOnDisable}
            sentryLabel={sentryLabel}
            ref={ref}
        >
            {!!pressOnEnter && (
                <ButtonKeyboardShortcut
                    pressOnEnter={pressOnEnter}
                    allowBubble={allowBubble}
                    enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                    isPressOnEnterActive={isPressOnEnterActive}
                />
            )}
            {!!iconLeft && (
                <ButtonIcon
                    src={iconLeft}
                    fill={iconLeftFill}
                    hoverFill={iconLeftHoverFill}
                    style={iconLeftStyles}
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
                        style={textStyles}
                        numberOfLines={textNumberOfLines}
                    >
                        {text}
                    </ButtonText>
                )
            )}
            {!!iconRight && (
                <ButtonIcon
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
