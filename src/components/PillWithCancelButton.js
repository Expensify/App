import React from 'react';
import PropTypes from 'prop-types';
import {Text, Image, TouchableOpacity} from 'react-native';
import styles from '../styles/styles';
import iconX from '../../assets/images/icon-x.png';

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
            selectable={false}
        >
            {props.text}
        </Text>
        <Image
            resizeMode="contain"
            style={[styles.pillCancelIcon]}
            source={iconX}
        />
    </TouchableOpacity>
);

PillWithCancelButton.displayName = 'PillWithCancelButton';
PillWithCancelButton.propTypes = propTypes;
export default PillWithCancelButton;
