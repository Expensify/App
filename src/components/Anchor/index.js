import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet} from 'react-native';

/**
 * Text based component that is passed a URL to open onPress
 */

const propTypes = {
    // The URL to open
    href: PropTypes.string.isRequired,

    // What headers to send to the linked page (usually noopener and noreferrer)
    rel: PropTypes.string,

    // Used to determine where to open a link ("_blank" is passed for a new tab)
    target: PropTypes.string,

    // Any children to display
    children: PropTypes.node,

    // Any additional styles to apply
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,
};

const defaultProps = {
    rel: '',
    target: '',
    children: null,
    style: {},
};

const Anchor = ({
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

Anchor.propTypes = propTypes;
Anchor.defaultProps = defaultProps;
Anchor.displayName = 'Anchor';

export default Anchor;
