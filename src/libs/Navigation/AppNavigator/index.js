import PropTypes from 'prop-types';
import React from 'react';
import ThemeProvider from '@styles/themes/ThemeProvider';
import ThemeStylesProvider from '@styles/ThemeStylesProvider';

const propTypes = {
    /** If we have an authToken this is true */
    authenticated: PropTypes.bool.isRequired,
};

function AppNavigator(props) {
    if (props.authenticated) {
        const AuthScreens = require('./AuthScreens').default;

        // These are the protected screens and only accessible when an authToken is present
        return (
            <ThemeProvider>
                <ThemeStylesProvider>
                    <AuthScreens />;
                </ThemeStylesProvider>
            </ThemeProvider>
        );
    }
    const PublicScreens = require('./PublicScreens').default;
    return (
        <ThemeProvider theme="dark">
            <ThemeStylesProvider>
                <PublicScreens />;
            </ThemeStylesProvider>
        </ThemeProvider>
    );
}

AppNavigator.propTypes = propTypes;
AppNavigator.displayName = 'AppNavigator';
export default AppNavigator;
