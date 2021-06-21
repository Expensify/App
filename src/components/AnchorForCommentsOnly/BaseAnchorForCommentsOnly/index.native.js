import React from 'react';
import {Linking, StyleSheet, Text} from 'react-native';
import {propTypes, defaultProps} from '../anchorForCommentsOnlyPropTypes';
import fileDownload from '../../../libs/fileDownload';

/*
 * This is a default anchor component for regular links.
 */
const BaseAnchorForCommentsOnly = ({
    href,
    children,
    style,
    shouldDownloadFile,
    ...props
}) => (
    <Text
        style={StyleSheet.flatten(style)}
        onPress={() => (shouldDownloadFile ? fileDownload(href) : Linking.openURL(href))}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    >
        {children}
    </Text>
);

BaseAnchorForCommentsOnly.propTypes = propTypes;
BaseAnchorForCommentsOnly.defaultProps = defaultProps;
BaseAnchorForCommentsOnly.displayName = 'BaseAnchorForCommentsOnly';

export default BaseAnchorForCommentsOnly;
