import React from 'react';
import {GoogleOAuthProvider} from '@react-oauth/google';

import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {
    children: null,
};

const GoogleProvider = props => <GoogleOAuthProvider clientId="921154746561-gpsoaqgqfuqrfsjdf8l7vohfkfj7b9up.apps.googleusercontent.com">{props.children}</GoogleOAuthProvider>;

GoogleProvider.displayName = 'GoogleProvider';
GoogleProvider.propTypes = propTypes;
GoogleProvider.defaultProps = defaultProps;

export default GoogleProvider;
