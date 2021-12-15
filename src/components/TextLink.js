import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {Linking} from 'react-native';
import ExpensifyText from './ExpensifyText';
import styles from '../styles/styles';
import stylePropTypes from '../styles/stylePropTypes';

const propTypes = {
    /** Link to open in new tab */
    href: PropTypes.string,

    /** Text content child */
    children: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
        PropTypes.object,
    ]).isRequired,

    /** Additional style props */
    style: stylePropTypes,

    /** Overwrites the default link behavior with a custom callback */
    onPress: PropTypes.func,
};

const defaultProps = {
    href: '',
    style: [],
    onPress: undefined,
};

const TextLink = (props) => {
    const additionalStyles = _.isArray(props.style) ? props.style : [props.style];
    return (
        <ExpensifyText
            style={[styles.link, ...additionalStyles]}
            accessibilityRole="link"
            href={props.href}
            onPress={(e) => {
                e.preventDefault();
                if (props.onPress) {
                    props.onPress();
                    return;
                }

                Linking.openURL(props.href);
            }}
        >
            {props.children}
        </ExpensifyText>
    );
};

TextLink.defaultProps = defaultProps;
TextLink.propTypes = propTypes;
TextLink.displayName = 'TextLink';
export default TextLink;
