import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import * as Expensicons from '../Icon/Expensicons';
import Icon from '../Icon';

const propTypes = {
    /** Specifies if the arrow icon should be disabled or not. */
    disabled: PropTypes.bool,

    /** Specifies direction or icon */
    direction: PropTypes.oneOf(['left', 'right']),
};

const defaultProps = {
    disabled: false,
    direction: 'right',
};

const ArrowIcon = props => (
    <View style={[
        styles.p1,
        props.direction === 'left' ? {transform: [{rotate: '180deg'}]} : {},
        props.disabled ? styles.calendarButtonDisabled : {},
    ]}
    >
        <Icon src={Expensicons.ArrowRight} />
    </View>
);

ArrowIcon.displayName = 'ArrowIcon';
ArrowIcon.propTypes = propTypes;
ArrowIcon.defaultProps = defaultProps;

export default ArrowIcon;
