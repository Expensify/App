import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {Text, Pressable, Linking} from 'react-native';
import styles from '../styles/styles';

const propTypes = {
    /** Link to open in new tab */
    href: PropTypes.string.isRequired,

    /** Text content child */
    children: PropTypes.string.isRequired,

    /** Additional style props */
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),

    /** Link hovered style  */
    hoveredStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),
};

const defaultProps = {
    style: [],
    hoveredStyle: [],
};

const TextLink = (props) => {
    const additionalStyles = _.isArray(props.style) ? props.style : [props.style];
    return (
        <Pressable
            onPress={(e) => {
                e.preventDefault();
                Linking.openURL(props.href);
            }}
            accessibilityRole="link"
            href={props.href}
        >
            {({hovered, pressed}) => (
                <Text style={[
                    styles.link,
                    ...additionalStyles,
                    (hovered || pressed) ? styles.linkHovered : undefined,
                    (hovered || pressed) ? props.hoveredStyle : undefined,
                ]}
                >
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
