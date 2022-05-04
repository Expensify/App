import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import CheckboxButton from './CheckboxButton';

const propTypes = {
    /** Whether checkbox is checked */
    isChecked: PropTypes.bool.isRequired,

    /** A function that is called when the box/label is pressed */
    onPress: PropTypes.func.isRequired,

    /** Should the input be styled for errors  */
    hasError: PropTypes.bool,

    /** Should the input be disabled  */
    disabled: PropTypes.bool,

    /** A ref to forward to the Pressable */
    forwardedRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
    ]),
};

const defaultProps = {
    hasError: false,
    disabled: false,
    forwardedRef: undefined,
};

const Checkbox = props => (
    <CheckboxButton
        disabled={props.disabled}
        onPress={() => props.onPress(!props.isChecked)}
        ref={props.forwardedRef}
    >
        <View
            style={[
                styles.checkboxContainer,
                props.isChecked && styles.checkedContainer,
                props.hasError && styles.borderColorDanger,
                props.disabled && styles.cursorDisabled,
            ]}
        >
            <Icon src={Expensicons.Checkmark} fill="white" height={14} width={14} />
        </View>
    </CheckboxButton>
);

Checkbox.propTypes = propTypes;
Checkbox.defaultProps = defaultProps;
Checkbox.displayName = 'Checkbox';

export default Checkbox;