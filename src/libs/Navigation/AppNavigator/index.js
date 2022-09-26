import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    /** If we have an authToken this is true */
    authenticated: PropTypes.bool.isRequired,
};

const AppNavigator = (props) => {
    if (props.authenticated) {
        const AuthScreens = require('./AuthScreens').default;

        // These are the protected screens and only accessible when an authToken is present
        return (
            <AuthScreens />
        );
    }
    const PublicScreens = require('./PublicScreens').default;
    return (
        <PublicScreens />
    );
};

AppNavigator.propTypes = propTypes;
AppNavigator.displayName = 'AppNavigator';
export default AppNavigator;
