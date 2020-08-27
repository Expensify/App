import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {Linking, Text} from 'react-native';

/**
 * Text based component that is passed a URL to open onPress
 */

const propTypes = {
    // The URL to open
    href: PropTypes.string.isRequired,

    // What headers to send to the linked page (usually noopener and noreferrer)
    // This is unused in native, but is here for parity with web
    rel: PropTypes.string,

    // Used to determine where to open a link ("_blank" is passed for a new tab)
    // This is unused in native, but is here for parity with web
    target: PropTypes.string,


    // Any children to display
    children: PropTypes.node,

    // Any additional styles to apply
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,
};

const defaultProps = {
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
}) => {
    // If the style prop is an array of styles, we need to mix them all together
    const mergedStyles = !_.isArray(style) ? style : _.reduce(style, (finalStyles, s) => ({
        ...finalStyles,
        ...s
    }), {});

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Text style={[mergedStyles]} onPress={() => Linking.openURL(href)} {...props}>{children}</Text>
    );
};

AnchorForCommentsOnly.propTypes = propTypes;
AnchorForCommentsOnly.defaultProps = defaultProps;
AnchorForCommentsOnly.displayName = 'Anchor';

export default AnchorForCommentsOnly;
