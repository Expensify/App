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
    direction: PropTypes.oneOf(['left', 'right']),
};

const defaultProps = {
    direction: 'right',
};

const ArrowIcon = props => (
    <View style={[styles.icon, props.direction === 'left' ? {transform: [{rotate: '180deg'}]} : undefined]}>
        <Icon src={Expensicons.ArrowRight} />
    </View>
);

ArrowIcon.displayName = 'ArrowIcon';
ArrowIcon.propTypes = propTypes;
ArrowIcon.defaultProps = defaultProps;

export default ArrowIcon;
