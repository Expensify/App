import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

const propTypes = {
    /** Specifies if the arrow icon should be disabled or not. */
    disabled: PropTypes.bool,

    /** Specifies direction of icon */
    direction: PropTypes.oneOf([CONST.DIRECTION.LEFT, CONST.DIRECTION.RIGHT]),
};

const defaultProps = {
    disabled: false,
    direction: CONST.DIRECTION.RIGHT,
};

function ArrowIcon(props) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.p1, StyleUtils.getDirectionStyle(props.direction), props.disabled ? styles.buttonOpacityDisabled : {}]}>
            <Icon src={Expensicons.ArrowRight} />
        </View>
    );
}

ArrowIcon.displayName = 'ArrowIcon';
ArrowIcon.propTypes = propTypes;
ArrowIcon.defaultProps = defaultProps;

export default ArrowIcon;
