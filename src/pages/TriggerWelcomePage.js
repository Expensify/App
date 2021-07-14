import React from 'react';
import PropTypes from 'prop-types';
import Onyx, {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import * as API from '../libs/API';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import {navigateToConciergeDMReport} from "../libs/actions/Report";
import FullScreenLoadingIndicator from "../components/FullscreenLoadingIndicator";

const propTypes = {
    /* Onyx Props */

    /** The accountID and validateCode are passed via the URL */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Location passed via route trigger/welcome/:location */
            location: PropTypes.string,
        }),
    }).isRequired,

    ...withLocalizePropTypes,
};

class TriggerWelcomePage extends React.Component {
    componentDidMount() {
        debugger;
        const location = lodashGet(this.props.route.params, 'location', '');

        if (this.props.session.authToken) {
            if (_.contains(['sfo', 'pdx'], location)) {
                // navigateToConciergeDMReport();
                API.TriggerWelcome({location})
                    .then(data => Navigation.navigate(ROUTES.getReportRoute(data.chatReportID)));
                //
            }
        } else {
            Onyx.merge(ONYXKEYS.TRIGGER_WELCOME_LOCATION, location);
            Navigation.navigate(ROUTES.HOME);
        }
    }

    componentDidUpdate(prevProps) {
        debugger;
        const test = prevProps;
    }

    render() {
        // Don't render anything here since we will redirect the user once we've attempted to validate their login
        return <FullScreenLoadingIndicator visible />;
    }
}

TriggerWelcomePage.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
        account: {key: ONYXKEYS.ACCOUNT},
        session: {key: ONYXKEYS.SESSION},
        triggerWelcome: {key: ONYXKEYS.TRIGGER_WELCOME_LOCATION},
    }),
)(TriggerWelcomePage);
