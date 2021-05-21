import React from 'react';
import PropTypes from 'prop-types';
import {Text, Pressable} from 'react-native';
import openURLInNewTab from '../libs/openURLInNewTab';
import styles from '../styles/styles';

const propTypes = {
    href: PropTypes.string.isRequired,
    children: PropTypes.string.isRequired,
};

const TextLink = props => (
    <Pressable
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

TextLink.propTypes = propTypes;
export default TextLink;
