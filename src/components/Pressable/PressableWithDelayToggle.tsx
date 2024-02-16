/* eslint-disable react-native-a11y/has-valid-accessibility-descriptors */
import React, {forwardRef} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useThrottledButtonState from '@hooks/useThrottledButtonState';
import getButtonState from '@libs/getButtonState';
import variables from '@styles/variables';
import type IconAsset from '@src/types/utils/IconAsset';
import type {PressableRef} from './GenericPressable/types';
import type PressableProps from './GenericPressable/types';
import PressableWithoutFeedback from './PressableWithoutFeedback';

type PressableWithDelayToggleProps = PressableProps & {
    /** The text to display */
    text: string;

    /** The text to display once the pressable is pressed */
    textChecked?: string;

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
    icon?: IconAsset;

    /** The icon to display once the pressable is pressed */
    iconChecked?: IconAsset;

    /**
     * Should be set to `true` if this component is being rendered inline in
     * another `Text`. This is due to limitations in RN regarding the
     * vertical text alignment of non-Text elements
     */
    inline?: boolean;
    accessibilityRole?: string;
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
        accessibilityRole,
    }: PressableWithDelayToggleProps,
    ref: PressableRef,
) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isActive, temporarilyDisableInteractions] = useThrottledButtonState();

    const updatePressState = () => {
        if (!isActive) {
            return;
        }
        temporarilyDisableInteractions();
        onPress?.();
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
            accessibilityRole={accessibilityRole}
        >
            <>
                {inline && labelText}
                <Tooltip
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
