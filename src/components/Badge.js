import React from 'react';
import {Pressable, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import * as StyleUtils from '../styles/StyleUtils';
import Text from './Text';

const propTypes = {
    /** Is Success type */
    success: PropTypes.bool,

    /** Is Error type */
    error: PropTypes.bool,

    /** Whether badge is clickable */
    pressable: PropTypes.bool,

    /** Text to display in the Badge */
    text: PropTypes.string.isRequired,

    /** Styles for Badge */
    // eslint-disable-next-line react/forbid-prop-types
    badgeStyles: PropTypes.arrayOf(PropTypes.object),

    /** Callback to be called on onPress */
    onPress: PropTypes.func,
};

const defaultProps = {
    success: false,
    error: false,
    pressable: false,
    badgeStyles: [],
    onPress: undefined,
};

const Badge = (props) => {
    const textStyles = props.success || props.error ? styles.textWhite : undefined;
    const Wrapper = props.pressable ? Pressable : View;
    const wrapperStyles = ({pressed}) => ([
        styles.badge,
        styles.ml2,
        StyleUtils.getBadgeColorStyle(props.success, props.error, pressed),
        ...props.badgeStyles,
    ]);

    return (
        <Wrapper
            style={props.pressable ? wrapperStyles : wrapperStyles(false)}
            onPress={props.onPress}
        >
            <Text
                style={[styles.badgeText, textStyles]}
                numberOfLines={1}
            >
                {props.text}
            </Text>
        </Wrapper>
    );
};

Badge.displayName = 'Badge';
Badge.propTypes = propTypes;
Badge.defaultProps = defaultProps;
export default Badge;
