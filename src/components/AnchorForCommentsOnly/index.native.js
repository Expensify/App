import React from 'react';
import {Linking, StyleSheet, Text} from 'react-native';
import propTypes from './propTypes';

const defaultProps = {
    href: '',
    rel: null,
    target: null,
    children: null,
    style: {},
};

const AnchorForCommentsOnly = ({
    href,
    children,
    style,
    ...props
}) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Text style={StyleSheet.flatten(style)} onPress={() => Linking.openURL(href)} {...props}>{children}</Text>
);

AnchorForCommentsOnly.propTypes = propTypes;
AnchorForCommentsOnly.defaultProps = defaultProps;
AnchorForCommentsOnly.displayName = 'AnchorForCommentsOnly';

export default AnchorForCommentsOnly;
