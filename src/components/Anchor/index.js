import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet} from 'react-native';

/**
 * Text based component that is passed a URL to open onPress
 */

const propTypes = {
    // The URL to open
    href: PropTypes.string.isRequired,

    // Any children to display
    children: PropTypes.node,

    // Any additional styles to apply
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,
};

const defaultProps = {
    children: null,
    style: {},
};

const Anchor = ({
    href,
    children,
    style,
    ...props
}) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <a style={StyleSheet.flatten(style)} href={href} {...props}>{children}</a>
);

Anchor.propTypes = propTypes;
Anchor.defaultProps = defaultProps;
Anchor.displayName = 'Anchor';

export default Anchor;
