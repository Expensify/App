import lodashGet from 'lodash.get';
import React from 'react';
import {View, Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import * as Wallet from '../../libs/actions/Wallet';
import * as API from '../../libs/API';

// Step Components
import OnfidoStep from './OnfidoStep';
import AdditionalDetailsStep from './AdditionalDetailsStep';
import TermsStep from './TermsStep';

const STEPS = {
    ONFIDO: 'OnfidoStep',
    ADDITIONAL_DETAILS: 'AdditionalDetailsStep',
    TERMS: 'TermsStep',
};

const VIEWS = {
    [STEPS.ONFIDO]: OnfidoStep,
    [STEPS.ADDITIONAL_DETAILS]: AdditionalDetailsStep,
    [STEPS.TERMS]: TermsStep,
};

class EnablePaymentsPage extends React.Component {
    constructor(props) {
        super(props);

        // When this component mounts we should already know if the wallet is active by looking at the result of
        // getUserWallet()

        // We'll take a "step based" approach here and save each step's data as we go in case the user is caught
        // on any single step. We'll just use an NVP for this "expensify_enableUserWalletProgress" to tell what
        // step they are on so far
        this.enablePayments = this.enablePayments.bind(this);
    }

    componentDidMount() {
        BankAccounts.getBankAccountList();
        Wallet.getUserWallet();
    }

    // This should be replaced by an action to call the API with whatever information we need
    enablePayments(data) {
        API.Wallet_EnablePayments({
            data: JSON.stringify({
                ...data,
                currentStep: lodashGet(this.props, 'userWallet.currentStep') || STEPS.ONFIDO,
            }),
        })
            .then((response) => {
                console.debug(response);
            });
    }

    render() {
        console.debug({userWallet: this.props.userWallet});
        const hasGoldWallet = lodashGet(this.props, 'userWallet.status') === 'GOLD';
        if (hasGoldWallet) {
            return (
                <View>
                    <Text>Your wallet is activated!</Text>
                </View>
            );
        }

        const currentStep = lodashGet(this.props, 'userWallet.currentStep') || STEPS.ONFIDO;
        const StepComponent = VIEWS[currentStep];
        return (
            <View style={{flex: 1}}>
                <StepComponent
                    onSubmit={this.enablePayments}
                />
            </View>
        );
    }
}

export default withOnyx({
    userWallet: {
        key: ONYXKEYS.USER_WALLET,
    },
})(EnablePaymentsPage);
