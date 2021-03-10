import React from 'react';
import PropTypes from 'prop-types';
import PublicScreens from './PublicScreens';
import AuthScreens from './AuthScreens';

const propTypes = {
    // If we have an authToken this is true
    authenticated: PropTypes.bool.isRequired,

    // Whem responsive is true we will use a custom navigator for our modals so they present in a custom way when at
    // larger screen widths or on web and desktop platforms. Only native platforms with small screen widths use the
    // react-navigation style modal presentation.
    responsive: PropTypes.bool,

    // Whether the drawer should be open on init
    isDrawerOpenByDefault: PropTypes.bool.isRequired,
};

const defaultProps = {
    responsive: false,
};

const AppNavigator = props => (
    props.authenticated
        ? (

            // These are the protected screens and only accessible when an authToken is present
            <AuthScreens responsive={props.responsive} isDrawerOpenByDefault={props.isDrawerOpenByDefault} />
        )
        : (
            <PublicScreens />
        )
);

AppNavigator.defaultProps = defaultProps;
AppNavigator.propTypes = propTypes;
AppNavigator.displayName = 'AppNavigator';
export default AppNavigator;
