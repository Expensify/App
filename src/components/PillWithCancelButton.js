import React from 'react';
import PropTypes from 'prop-types';
import {Text, TouchableOpacity} from 'react-native';
import styles from '../styles/styles';
import Icon from './Icon';
import {Close} from './Icon/Expensicons';

const propTypes = {
    text: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
};

const PillWithCancelButton = props => (
    <TouchableOpacity
        style={[styles.pill]}
        onPress={props.onCancel}
    >
        <Text
            style={styles.pillText}
            numberOfLines={1}
        >
            {props.text}
        </Text>
        <Icon icon={Close} width={12} height={12} />
    </TouchableOpacity>
);

PillWithCancelButton.displayName = 'PillWithCancelButton';
PillWithCancelButton.propTypes = propTypes;
export default PillWithCancelButton;
