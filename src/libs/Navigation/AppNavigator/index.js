import React from 'react';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import ROUTES from '../../../ROUTES';
import PublicScreens from './PublicScreens';
import AuthScreens from './AuthScreens';
import SharedScreens from './SharedScreens';

const propTypes = {
    /** If we have an authToken this is true */
    authenticated: PropTypes.bool.isRequired,

    /** The current URL to render */
    currentURL: PropTypes.string.isRequired,
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
