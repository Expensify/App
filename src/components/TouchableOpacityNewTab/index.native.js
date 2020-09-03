import React from 'react';
import {TouchableOpacity, Linking} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    // The URL to open
    href: PropTypes.string.isRequired,
};

// eslint-disable-next-line react/jsx-props-no-spreading
const TouchableOpacityNewTab = ({
    href,
    ...props
// eslint-disable-next-line react/jsx-props-no-spreading
}) => (<TouchableOpacity onPress={() => Linking.openURL(href)} {...props} />);

TouchableOpacityNewTab.displayName = 'TouchableOpacityNewTab';

TouchableOpacityNewTab.propTypes = propTypes;
export default TouchableOpacityNewTab;
