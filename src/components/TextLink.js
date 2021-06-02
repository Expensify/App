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

    /** Additional style props */
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),
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
            {({hovered, pressed}) => (
                <Text style={[styles.link, (hovered || pressed) ? styles.linkHovered : undefined]}>
                    {props.children}
                </Text>
            )}
        </Pressable>
    );
};

TextLink.defaultProps = defaultProps;
TextLink.propTypes = propTypes;
TextLink.displayName = 'TextLink';
export default TextLink;
