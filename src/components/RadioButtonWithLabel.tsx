import type {ReactNode} from 'react';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import FormHelpMessage from './FormHelpMessage';
import * as Pressables from './Pressable';
import RadioButton from './RadioButton';
import Text from './Text';

type RadioButtonWithLabelProps = {
    /** Whether the radioButton is checked */
    isChecked: boolean;

    /** Called when the radioButton or label is pressed */
    onPress: () => void;

    /** Container styles */
    style?: StyleProp<ViewStyle>;

    /** Text that appears next to check box */
    label?: string;

    /** React element to display for the label */
    labelElement?: ReactNode;

    /** Should the input be styled for errors */
    hasError?: boolean;

    /** Error text to display */
    errorText?: string;

    /** Additional styles to apply to the wrapper */
    wrapperStyle?: StyleProp<ViewStyle>;

    /**
     * Whether the button should have a background layer in the color of theme.appBG.
     * This is needed for buttons that allow content to display under them.
     */
    shouldBlendOpacity?: boolean;
};

const PressableWithFeedback = Pressables.PressableWithFeedback;

function RadioButtonWithLabel({labelElement, style, label = '', hasError = false, errorText = '', isChecked, onPress, wrapperStyle, shouldBlendOpacity}: RadioButtonWithLabelProps) {
    const styles = useThemeStyles();
    const defaultStyles = [styles.flexRow, styles.alignItemsCenter];

    if (!label && !labelElement) {
        throw new Error('Must provide at least label or labelComponent prop');
    }
    return (
        <>
            <PressableWithFeedback
                tabIndex={-1}
                accessible={false}
                style={[defaultStyles, styles.flexRow, styles.alignItemsCenter, style]}
                wrapperStyle={[wrapperStyle]}
                hoverDimmingValue={1}
                hoverStyle={styles.hoveredComponentBG}
                shouldBlendOpacity={shouldBlendOpacity}
                isNested
                onPress={onPress}
            >
                <View style={[styles.flex1]}>
                    {!!label && <Text style={[styles.ml1]}>{label}</Text>}
                    {!!labelElement && labelElement}
                </View>
                <RadioButton
                    isChecked={isChecked}
                    onPress={onPress}
                    accessibilityLabel={label}
                    hasError={hasError}
                    shouldUseNewStyle
                />
            </PressableWithFeedback>
            <FormHelpMessage message={errorText} />
        </>
    );
}

RadioButtonWithLabel.displayName = 'RadioButtonWithLabel';

export default RadioButtonWithLabel;

export type {RadioButtonWithLabelProps};
