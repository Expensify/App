import React from 'react';
import {TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    // The URL to open
    href: PropTypes.string.isRequired,

    // Any additional styles to apply
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,
};

const defaultProps = {
    style: {},
};

// eslint-disable-next-line react/jsx-props-no-spreading
const TouchableOpacityNewTab = ({
    href,
    style,
    props
// eslint-disable-next-line react/jsx-props-no-spreading
}) => (<TouchableOpacity onPress={() => window.open(href, '_blank')} style={style} {...props} />);

TouchableOpacityNewTab.displayName = 'TouchableOpacityNewTab';

TouchableOpacityNewTab.propTypes = propTypes;
TouchableOpacityNewTab.defaultProps = defaultProps;
export default TouchableOpacityNewTab;
