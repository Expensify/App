import React from 'react';
import {StyleSheet, Text} from 'react-native';
import anchorForCommentsOnlyPropTypes from './anchorForCommentsOnlyPropTypes';

const defaultProps = {
    href: '',
    rel: '',
    target: '',
    children: null,
    style: {},
};

const AnchorForCommentsOnly = ({
    href,
    rel,
    target,
    children,
    style,
    ...props
}) => (
    <Text
        style={StyleSheet.flatten(style)}
        accessibilityRole="link"
        href={href}
        rel={rel}
        target={target}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    >
        {children}
    </Text>
);

AnchorForCommentsOnly.propTypes = anchorForCommentsOnlyPropTypes;
AnchorForCommentsOnly.defaultProps = defaultProps;
AnchorForCommentsOnly.displayName = 'AnchorForCommentsOnly';

export default AnchorForCommentsOnly;
