import React from 'react';
import {Pressable, View} from 'react-native';
import PropTypes from 'prop-types';
import styles, {getBadgeColorStyle} from '../styles/styles';
import Text from './Text';

const propTypes = {
    /** Is success type */
    success: PropTypes.bool,

    /** Is success type */
    error: PropTypes.bool,

    /** Whether badge is clickable */
    pressable: PropTypes.bool,

    /** Text to display in the Badge */
    text: PropTypes.string.isRequired,

    /** Styles for Badge */
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
        getBadgeColorStyle(props.success, props.error, pressed),
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

Badge.displayName = 'EnvironmentBadge';
Badge.propTypes = propTypes;
Badge.defaultProps = defaultProps;
export default Badge;
