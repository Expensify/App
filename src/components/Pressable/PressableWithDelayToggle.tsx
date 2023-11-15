/* eslint-disable react-native-a11y/has-valid-accessibility-descriptors */
import React, {ForwardedRef, forwardRef} from 'react';
import {Text as RNText, StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import {SvgProps} from 'react-native-svg';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useThrottledButtonState from '@hooks/useThrottledButtonState';
import getButtonState from '@libs/getButtonState';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import variables from '@styles/variables';
import PressableProps from './GenericPressable/types';
import PressableWithoutFeedback from './PressableWithoutFeedback';

type PressableWithDelayToggleProps = PressableProps & {
    /** The text to display */
    text: string;

    /** The text to display once the pressable is pressed */
    textChecked: string;

    /** The tooltip text to display */
    tooltipText: string;

    /** The tooltip text to display once the pressable is pressed */
    tooltipTextChecked: string;

    /** Styles to apply to the container */
    styles?: StyleProp<ViewStyle>;

    // /** Styles to apply to the text */
    textStyles?: StyleProp<TextStyle>;

    /** Styles to apply to the icon */
    iconStyles?: StyleProp<ViewStyle>;

    /** The icon to display */
    icon?: React.FC<SvgProps>;

    /** The icon to display once the pressable is pressed */
    iconChecked?: React.FC<SvgProps>;

    /**
     * Should be set to `true` if this component is being rendered inline in
     * another `Text`. This is due to limitations in RN regarding the
     * vertical text alignment of non-Text elements
     */
    inline?: boolean;
};

function PressableWithDelayToggle(
    {
        iconChecked = Expensicons.Checkmark,
        inline = true,
        onPress,
        text,
        textChecked,
        tooltipText,
        tooltipTextChecked,
        styles: pressableStyle,
        textStyles,
        iconStyles,
        icon,
    }: PressableWithDelayToggleProps,
    ref: ForwardedRef<RNText | View>,
) {
    const [isActive, temporarilyDisableInteractions] = useThrottledButtonState();

    const updatePressState = () => {
        if (!isActive) {
            return;
        }
        temporarilyDisableInteractions();
        onPress();
    };

    // Due to limitations in RN regarding the vertical text alignment of non-Text elements,
    // for elements that are supposed to be inline, we need to use a Text element instead
    // of a Pressable
    const PressableView = inline ? Text : PressableWithoutFeedback;
    const tooltipTexts = !isActive ? tooltipTextChecked : tooltipText;
    const labelText = (
        <Text
            suppressHighlighting
            style={textStyles}
        >
            {!isActive && textChecked ? textChecked : text}
            &nbsp;
        </Text>
    );

    return (
        <PressableView
            // Using `ref as any` due to variable component (Text or View) based on 'inline' prop; TypeScript workaround.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={ref as any}
            onPress={updatePressState}
            accessibilityLabel={tooltipTexts}
            suppressHighlighting={inline ? true : undefined}
        >
            <>
                {inline && labelText}
                <Tooltip
                    containerStyles={[styles.flexRow]}
                    text={tooltipTexts}
                    shouldRender
                >
                    <PressableWithoutFeedback
                        tabIndex={-1}
                        accessible={false}
                        onPress={updatePressState}
                        style={[styles.flexRow, pressableStyle, !isActive && styles.cursorDefault]}
                    >
                        {({hovered, pressed}) => (
                            <>
                                {!inline && labelText}
                                {icon && (
                                    <Icon
                                        src={!isActive ? iconChecked : icon}
                                        fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, !isActive))}
                                        additionalStyles={iconStyles}
                                        width={variables.iconSizeSmall}
                                        height={variables.iconSizeSmall}
                                        inline={inline}
                                    />
                                )}
                            </>
                        )}
                    </PressableWithoutFeedback>
                </Tooltip>
            </>
        </PressableView>
    );
}

PressableWithDelayToggle.displayName = 'PressableWithDelayToggle';

export default forwardRef(PressableWithDelayToggle);
