import {useFocusEffect} from '@react-navigation/native';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Navigation from '@libs/Navigation/Navigation';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user authToken */
        authToken: PropTypes.string,
    }),
};

const defaultProps = {
    session: {
        authToken: null,
    },
};

/*
 * This is a "utility page", that does this:
 *     - If the user is authenticated, find their concierge chat and re-route to it
 *     - Else re-route to the login page
 */
function ConciergePage(props) {
    useFocusEffect(() => {
        if (_.has(props.session, 'authToken')) {
            // Pop the concierge loading page before opening the concierge report.
            Navigation.isNavigationReady().then(() => {
                Navigation.goBack(ROUTES.HOME);
                Report.navigateToConciergeChat();
            });
        } else {
            Navigation.navigate();
        }
    });

    return <FullScreenLoadingIndicator />;
}

ConciergePage.propTypes = propTypes;
ConciergePage.defaultProps = defaultProps;
ConciergePage.displayName = 'ConciergePage';

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ConciergePage);
