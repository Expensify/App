import React from 'react';
import {StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import * as Expensicons from '../Icon/Expensicons';
import Icon from '../Icon';

const styles = StyleSheet.create({
    icon: {
        padding: 5,
        paddingHorizontal: 8,
    },
});

const propTypes = {
    disabled: PropTypes.bool,
    direction: PropTypes.oneOf(['left', 'right']),
};

const defaultProps = {
    disabled: false,
    direction: 'right',
};

const ArrowIcon = props => (
    <View style={[styles.icon, props.direction === 'left' ? {transform: [{rotate: '180deg'}]} : undefined, props.disabled && {opacity: 0.25}]}>
        <Icon src={Expensicons.ArrowRight} />
    </View>
);

ArrowIcon.displayName = 'ArrowIcon';
ArrowIcon.propTypes = propTypes;
ArrowIcon.defaultProps = defaultProps;

export default ArrowIcon;
