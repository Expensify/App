import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import CONST from '../CONST';

const propTypes = {
    /** Whether radioButton is checked */
    isChecked: PropTypes.bool.isRequired,

    /** A function that is called when the box/label is pressed */
    onPress: PropTypes.func.isRequired,

    /** Specifies the accessibility label for the radio button */
    accessibilityLabel: PropTypes.string.isRequired,

    /** Should the input be styled for errors  */
    hasError: PropTypes.bool,

    /** Should the input be disabled  */
    disabled: PropTypes.bool,
};

const defaultProps = {
    hasError: false,
    disabled: false,
};

type RadioButtonProps = {
    /** Whether radioButton is checked */
    isChecked: boolean;

    /** A function that is called when the box/label is pressed */
    onPress: () => void;

    /** Specifies the accessibility label for the radio button */
    accessibilityLabel: string;

    /** Should the input be styled for errors  */
    hasError?: boolean;

    /** Should the input be disabled  */
    disabled?: boolean;
}

function RadioButton({isChecked, onPress = () => undefined, accessibilityLabel, disabled = false, hasError = false}: RadioButtonProps) {
    return (
        <PressableWithFeedback
            disabled={disabled}
            onPress={onPress}
            hoverDimmingValue={1}
            pressDimmingValue={1}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.RADIO}
        >
            <View style={[styles.radioButtonContainer, isChecked && styles.checkedContainer, hasError && styles.borderColorDanger, disabled && styles.cursorDisabled]}>
                <Icon
                    src={Expensicons.Checkmark}
                    fill="white"
                    height={14}
                    width={14}
                />
            </View>
        </PressableWithFeedback>
    );
}

export default RadioButton;
