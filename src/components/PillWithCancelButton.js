import React from 'react';
import PropTypes from 'prop-types';
import {Text, TouchableOpacity} from 'react-native';
import styles from '../styles/styles';
import Icon from './Icon';
import {Close} from './Icon/Expensicons';
import variables from '../styles/variables';

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
        <Icon src={Close} width={variables.iconSizeSmall} height={variables.iconSizeSmall} />
    </TouchableOpacity>
);

PillWithCancelButton.displayName = 'PillWithCancelButton';
PillWithCancelButton.propTypes = propTypes;
export default PillWithCancelButton;
