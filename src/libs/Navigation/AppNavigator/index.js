import React from 'react';
import PropTypes from 'prop-types';
import PublicScreens from './PublicScreens';
import AuthScreens from './AuthScreens';

const propTypes = {
    /** If we have an authToken this is true */
    authenticated: PropTypes.bool.isRequired,
};

const AppNavigator = props => (
    props.authenticated
        ? (

            // These are the protected screens and only accessible when an authToken is present
            <AuthScreens />
        )
        : (
            <PublicScreens />
        )
);

AppNavigator.propTypes = propTypes;
AppNavigator.displayName = 'AppNavigator';
export default AppNavigator;
