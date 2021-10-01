import React, {memo} from 'react';
import PropTypes from 'prop-types';
import ROUTES from '../../../ROUTES';
import PublicScreens from './PublicScreens';
import AuthScreens from './AuthScreens';
import SharedScreens from './SharedScreens';

const propTypes = {
    /** If we have an authToken this is true */
    authenticated: PropTypes.bool.isRequired,

    /** The current URL to render */
    currentURL: PropTypes.string,
};

const defaultProps = {
    currentURL: null,
};

const AppNavigator = (props) => {
    console.log('RORY_DEBUG currentURL:', props.currentURL);
    if (ROUTES.isSharedRoute(props.currentURL)) {
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

/**
 * We do not want to re-render the full navigator every time the currentURL changes, so only re-render this component if:
 *   1. The route changes from shared to not shared (or vice versa), OR
 *   2. Authenticated prop changes
 *
 * @param {Object} prevProps
 * @param {Object} nextProps
 * @returns {boolean}
 */
function areEqual(prevProps, nextProps) {
    return ROUTES.isSharedRoute(prevProps.initialURL) === ROUTES.isSharedRoute(nextProps.initialURL)
        && prevProps.authenticated === nextProps.authenticated;
}

AppNavigator.propTypes = propTypes;
AppNavigator.defaultProps = defaultProps;
AppNavigator.displayName = 'AppNavigator';
export default AppNavigator;
