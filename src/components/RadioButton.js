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

function RadioButton(props) {
    return (
        <PressableWithFeedback
            disabled={props.disabled}
            onPress={props.onPress}
            hoverDimmingValue={1}
            pressDimmingValue={1}
            accessibilityLabel={props.accessibilityLabel}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.RADIO}
        >
            <View style={[styles.radioButtonContainer, props.isChecked && styles.checkedContainer, props.hasError && styles.borderColorDanger, props.disabled && styles.cursorDisabled]}>
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

RadioButton.propTypes = propTypes;
RadioButton.defaultProps = defaultProps;
RadioButton.displayName = 'RadioButton';

export default RadioButton;
