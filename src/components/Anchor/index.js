import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

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
}) => {
    // If the style prop is an array of styles, we need to mix them all together
    const mergedStyles = !_.isArray(style) ? style : _.reduce(style, (finalStyles, s) => ({
        ...finalStyles,
        ...s
    }), {});

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <a style={mergedStyles} href={href} rel={rel} target={target} {...props}>{children}</a>
    );
};

Anchor.propTypes = propTypes;
Anchor.defaultProps = defaultProps;
Anchor.displayName = 'Anchor';

export default Anchor;
