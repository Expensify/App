import React from 'react';
import {StyleSheet} from 'react-native';
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
    <a
        style={StyleSheet.flatten(style)}
        href={href}
        rel={rel}
        target={target}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    >
        {children}
    </a>
);

AnchorForCommentsOnly.propTypes = anchorForCommentsOnlyPropTypes;
AnchorForCommentsOnly.defaultProps = defaultProps;
AnchorForCommentsOnly.displayName = 'AnchorForCommentsOnly';

export default AnchorForCommentsOnly;
