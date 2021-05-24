import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {Text, Pressable} from 'react-native';
import openURLInNewTab from '../libs/openURLInNewTab';
import styles from '../styles/styles';

const propTypes = {
    /** Link to open in new tab */
    href: PropTypes.string.isRequired,

    /** Text content child */
    children: PropTypes.string.isRequired,

    /** Additional style props (optional) */
    style: PropTypes.oneOf([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),
};

const defaultProps = {
    style: [],
};

const TextLink = (props) => {
    const additionalStyles = _.isArray(props.style) ? props.style : [props.style];
    return (
        <Pressable
            style={additionalStyles}
            onPress={() => {
                openURLInNewTab(props.href);
            }}
        >
            {(pressed, hovered) => (
                <Text style={[styles.link, hovered ? styles.linkHovered : undefined]}>
                    {props.children}
                </Text>
            )}
        </Pressable>
    );
};

TextLink.defaultProps = defaultProps;
TextLink.propTypes = propTypes;
export default TextLink;
