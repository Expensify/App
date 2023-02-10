import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import Navigation from '../libs/Navigation/Navigation';
import * as Report from '../libs/actions/Report';

const propTypes = {
    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user authToken */
        authToken: PropTypes.string,

        /** Currently logged in user email */
        email: PropTypes.string,
    }).isRequired,
};

/*
 * This is a "utility page", that does this:
 *     - If the user is authenticated, find their concierge chat and re-route to it
 *     - Else re-route to the login page
 */
const ConciergePage = (props) => {
    if (_.has(props.session, 'authToken')) {
        Navigation.isDrawerReady().then(() => {
            Report.navigateToConciergeChat();
        });
    } else {
        Navigation.navigate();
    }

    return <FullScreenLoadingIndicator />;
};

ConciergePage.propTypes = propTypes;
ConciergePage.displayName = 'ConciergePage';

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ConciergePage);
