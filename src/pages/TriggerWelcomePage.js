import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';

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

class TriggerWelcomePage extends Component {
    componentDidMount() {
        debugger;
        const test = this.props.route;
    }

    render() {
        // Don't render anything here since we will redirect the user once we've attempted to validate their login
        return null;
    }
}

TriggerWelcomePage.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(TriggerWelcomePage);
