import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {Pressable, Linking} from 'react-native';
import Text from './Text';
import styles from '../styles/styles';

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
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),

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
        <Pressable
            onPress={(e) => {
                e.preventDefault();
                if (props.onPress) {
                    props.onPress();
                    return;
                }

                Linking.openURL(props.href);
            }}
            accessibilityRole="link"
            href={props.href}
        >
            {({hovered, pressed}) => (
                <Text style={[styles.link, (hovered || pressed) ? styles.linkHovered : undefined, ...additionalStyles]}>
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
