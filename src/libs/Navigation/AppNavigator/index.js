import React from 'react';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import ROUTES from '../../../ROUTES';
import SharedScreens from './SharedScreens';
import PublicScreens from './PublicScreens';
import AuthScreens from './AuthScreens';

const propTypes = {
    /** The current URL to display */
    currentURL: PropTypes.string.isRequired,

    /** If we have an authToken this is true */
    authenticated: PropTypes.bool.isRequired,
};

const AppNavigator = (props) => {
    if (Str.startsWith(props.currentURL, ROUTES.TRANSITION)) {
        return <SharedScreens />;
    }

    return props.authenticated
        ? (

            // These are the protected screens and only accessible when an authToken is present
            <AuthScreens />
        )
        : (
            <PublicScreens />
        );
};

AppNavigator.propTypes = propTypes;
AppNavigator.displayName = 'AppNavigator';
export default AppNavigator;
