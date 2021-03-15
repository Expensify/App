import React from 'react';
import {View, Pressable, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Icon from './Icon';
import {Checkmark} from './Icon/Expensicons';

const propTypes = {
    // Whether checkbox is checked
    isChecked: PropTypes.bool.isRequired,

    // A function that is called when the box/label is clicked on
    onCheckboxClick: PropTypes.func.isRequired,

    // Text that appears next to check box
    label: PropTypes.string,
};

const defaultProps = {
    label: '',
};

const Checkbox = ({
    isChecked,
    onCheckboxClick,
    label,
}) => (
    <View style={styles.flexRow}>
        <Pressable onPress={() => onCheckboxClick(!isChecked)}>
            <View style={[styles.checkboxContainer, isChecked && styles.checkedContainer]}>
                <Icon src={Checkmark} fill="white" height={14} width={14} />
            </View>
        </Pressable>
        {label && (
            <Pressable onPress={() => onCheckboxClick(!isChecked)}>
                <Text style={[styles.ml2, styles.textP]}>
                    {label}
                </Text>
            </Pressable>
        )}
    </View>
);

Checkbox.defaultProps = defaultProps;
Checkbox.propTypes = propTypes;
Checkbox.displayName = 'Checkbox';

export default Checkbox;
