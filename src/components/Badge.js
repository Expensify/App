import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import Text from './Text';
import CONST from '../CONST';

const propTypes = {
    /** Is Success type */
    success: PropTypes.bool,

    /** Is Error type */
    error: PropTypes.bool,

    /** Text to display in the Badge */
    text: PropTypes.string.isRequired,

    /** Text to display in the Badge */
    environment: PropTypes.string,

    /** Styles for Badge */
    // eslint-disable-next-line react/forbid-prop-types
    badgeStyles: PropTypes.arrayOf(PropTypes.object),

    /** Styles for Badge Text */
    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),

    /** Callback to be called on onPress */
    onPress: PropTypes.func,
};

const defaultProps = {
    success: false,
    error: false,
    badgeStyles: [],
    textStyles: [],
    onPress: undefined,
    environment: CONST.ENVIRONMENT.DEV,
};

function Badge(props) {
    const textStyles = props.success || props.error ? styles.textWhite : undefined;
    const wrapperStyles = [styles.badge, styles.ml2, StyleUtils.getBadgeColorStyle(props.success, props.error, props.environment === CONST.ENVIRONMENT.ADHOC), ...props.badgeStyles];

    return (
        <View
            style={wrapperStyles}
            onPress={props.onPress}
        >
            <Text
                style={[styles.badgeText, textStyles, ...props.textStyles]}
                numberOfLines={1}
            >
                {props.text}
            </Text>
        </View>
    );
}

Badge.displayName = 'Badge';
Badge.propTypes = propTypes;
Badge.defaultProps = defaultProps;
export default Badge;
