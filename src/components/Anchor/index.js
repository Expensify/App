import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {Text} from 'react-native';

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
}) => {
    // If the style prop is an array of styles, we need to mix them all together
    const mergedStyles = !_.isArray(style) ? style : _.reduce(style, (finalStyles, s) => ({
        ...finalStyles,
        ...s
    }), {});

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Text style={mergedStyles} onPress={() => window.open(href, '_blank')} {...props}>
            {children}
        </Text>
    );
};

Anchor.propTypes = propTypes;
Anchor.defaultProps = defaultProps;
Anchor.displayName = 'Anchor';

export default Anchor;
