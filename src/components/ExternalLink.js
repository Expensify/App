import React from 'react';
import {Text} from 'react-native';
import PropTypes from 'prop-types';
import openURLInNewTab from '../libs/openURLInNewTab';

const propTypes = {
    /** External URL we want to link */
    href: PropTypes.string.isRequired,

    /** Any children to display */
    children: PropTypes.node,
};

const defaultProps = {
    children: null,
};

const ExternalLink = ({
    href,
    children,
    ...props
}) => (
    <Text
        accessibilityRole="link"
        onPress={(e) => { openURLInNewTab(href); e.preventDefault(); }}
        href={href}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    >
        {children}
    </Text>
);

ExternalLink.propTypes = propTypes;
ExternalLink.defaultProps = defaultProps;
ExternalLink.displayName = 'ExternalLink';

export default ExternalLink;
