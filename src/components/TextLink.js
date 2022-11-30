import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {Linking} from 'react-native';
import Text from './Text';
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

    /** Callback that is called when mousedown is triggered */
    onMouseDown: PropTypes.func,
};

const defaultProps = {
    href: undefined,
    style: [],
    onPress: undefined,
    onMouseDown: undefined,
};

const TextLink = (props) => {
    const additionalStyles = _.isArray(props.style) ? props.style : [props.style];

    /**
   * @param {Event} event
   */
    const openLink = (event) => {
        event.preventDefault();
        if (props.onPress) {
            props.onPress();
            return;
        }

        Linking.openURL(props.href);
    };

    /**
   * @param {Event} event
   */
    const openLinkIfEnterKeyPressed = (event) => {
        if (event.key !== 'Enter') {
            return;
        }
        openLink(event);
    };

    return (
        <Text
            style={[styles.link, ...additionalStyles]}
            accessibilityRole="link"
            href={props.href}
            onPress={openLink}
            onMouseDown={props.onMouseDown}
            onKeyDown={openLinkIfEnterKeyPressed}
        >
            {props.children}
        </Text>
    );
};

TextLink.defaultProps = defaultProps;
TextLink.propTypes = propTypes;
TextLink.displayName = 'TextLink';
export default TextLink;
