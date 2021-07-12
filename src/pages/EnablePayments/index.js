import _ from 'underscore';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import ScreenWrapper from '../../components/ScreenWrapper';
import {fetchUserWallet} from '../../libs/actions/BankAccounts';
import ONYXKEYS from '../../ONYXKEYS';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import CONST from '../../CONST';
import userWalletPropTypes from './userWalletPropTypes';

// Steps
import OnfidoStep from './OnfidoStep';
import AdditionalDetailsStep from './AdditionalDetailsStep';
import TermsStep from './TermsStep';
import ActivateStep from './ActivateStep';

const propTypes = {
    ...userWalletPropTypes,
};

const defaultProps = {
    userWallet: {},
};

class EnablePaymentsPage extends React.Component {
    componentDidMount() {
        fetchUserWallet();
    }

    render() {
        if (_.isEmpty(this.props.userWallet)) {
            return <FullScreenLoadingIndicator />;
        }

        const currentStep = this.props.userWallet.currentStep || CONST.WALLET.STEP.ONFIDO;
        return (
            <ScreenWrapper>
                {currentStep === CONST.WALLET.STEP.ONFIDO && <OnfidoStep />}
                {currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS && <AdditionalDetailsStep />}
                {currentStep === CONST.WALLET.STEP.TERMS && <TermsStep />}
                {currentStep === CONST.WALLET.STEP.ACTIVATE && <ActivateStep userWallet={this.props.userWallet} />}
            </ScreenWrapper>
        );
    }
}

EnablePaymentsPage.propTypes = propTypes;
EnablePaymentsPage.defaultProps = defaultProps;

export default withOnyx({
    userWallet: {
        key: ONYXKEYS.USER_WALLET,

        // We want to refresh the wallet each time the user attempts to activate the wallet so we won't use the
        // stored values here.
        initWithStoredValues: false,
    },
})(EnablePaymentsPage);
