import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from './styles';

const propTypes = {
    isPointingDown: PropTypes.bool
};

const defaultProps = {
    isPointingDown: false
};

const Triangle = ({isPointingDown}) => (
    <View style={[styles.triangle, isPointingDown ? styles.down : {}]} />
);

Triangle.propTypes = propTypes;
Triangle.defaultProps = defaultProps;

export default Triangle;
