import type {ComponentType} from 'react';
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

    /** Component to display for label */
    LabelComponent?: ComponentType;

    /** Should the input be styled for errors  */
    hasError?: boolean;

    /** Error text to display */
    errorText?: string;
};

const PressableWithFeedback = Pressables.PressableWithFeedback;

function RadioButtonWithLabel({LabelComponent, style, label = '', hasError = false, errorText = '', isChecked, onPress}: RadioButtonWithLabelProps) {
    const styles = useThemeStyles();
    const defaultStyles = [styles.flexRow, styles.alignItemsCenter];

    if (!label && !LabelComponent) {
        throw new Error('Must provide at least label or LabelComponent prop');
    }
    return (
        <>
            <View style={[defaultStyles, style]}>
                <RadioButton
                    isChecked={isChecked}
                    onPress={onPress}
                    accessibilityLabel={label}
                    hasError={hasError}
                />
                <PressableWithFeedback
                    tabIndex={-1}
                    accessible={false}
                    onPress={onPress}
                    style={[styles.flexRow, styles.flexWrap, styles.flexShrink1, styles.alignItemsCenter]}
                    wrapperStyle={[styles.flex1, styles.ml3, styles.pr2]}
                    // disable hover style when disabled
                    hoverDimmingValue={0.8}
                    pressDimmingValue={0.5}
                >
                    {!!label && <Text style={[styles.ml1]}>{label}</Text>}
                    {!!LabelComponent && <LabelComponent />}
                </PressableWithFeedback>
            </View>
            <FormHelpMessage message={errorText} />
        </>
    );
}

RadioButtonWithLabel.displayName = 'RadioButtonWithLabel';

export default RadioButtonWithLabel;

export type {RadioButtonWithLabelProps};
