import _ from 'underscore';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Onfido from '../../components/Onfido';
import FullscreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import ONYXKEYS from '../../ONYXKEYS';
import {fetchOnfidoToken} from '../../libs/actions/BankAccounts';

const propTypes = {
    onfidoApplicantInfo: PropTypes.shape({
        applicantID: PropTypes.string,
        sdkToken: PropTypes.string,
    }),
};

const defaultProps = {
    onfidoApplicantInfo: {},
};

class OnfidoStep extends React.Component {
    componentDidMount() {
        fetchOnfidoToken();
    }

    render() {
        if (_.isEmpty(this.props.onfidoApplicantInfo)) {
            return <FullscreenLoadingIndicator />;
        }

        return (
            <Onfido sdkToken={this.props.onfidoApplicantInfo.sdkToken} />
        );
    }
}

OnfidoStep.propTypes = propTypes;
OnfidoStep.defaultProps = defaultProps;

export default withOnyx({
    onfidoApplicantInfo: {
        key: ONYXKEYS.ONFIDO_APPLICANT_INFO,

        // Let's get a new onfido token each time the user hits this flow (as it should only be once)
        initWithStoredValues: false,
    },
})(OnfidoStep);
