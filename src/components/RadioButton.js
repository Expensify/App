import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

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
    const theme = useTheme();
    const styles = useThemeStyles();
    return (
        <PressableWithFeedback
            disabled={props.disabled}
            onPress={props.onPress}
            hoverDimmingValue={1}
            pressDimmingValue={1}
            accessibilityLabel={props.accessibilityLabel}
            role={CONST.ROLE.RADIO}
        >
            <View style={[styles.radioButtonContainer, props.hasError && styles.borderColorDanger, props.disabled && styles.cursorDisabled]}>
                {props.isChecked && (
                    <Icon
                        src={Expensicons.Checkmark}
                        fill={theme.checkBox}
                        height={14}
                        width={14}
                    />
                )}
            </View>
        </PressableWithFeedback>
    );
}

RadioButton.propTypes = propTypes;
RadioButton.defaultProps = defaultProps;
RadioButton.displayName = 'RadioButton';

export default RadioButton;
