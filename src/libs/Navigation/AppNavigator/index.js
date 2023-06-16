import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    /** If we have an authToken this is true */
    authenticated: PropTypes.bool.isRequired,
};

function AppNavigator(props) {
    const AuthScreens = require('./AuthScreens').default;
    return <AuthScreens authenticated={props.authenticated}/>;
}

AppNavigator.propTypes = propTypes;
AppNavigator.displayName = 'AppNavigator';
export default AppNavigator;
