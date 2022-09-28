import _ from 'underscore';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import * as BankAccounts from '../../libs/actions/BankAccounts';
import Navigation from '../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import AddPlaidBankAccount from '../../components/AddPlaidBankAccount';
import * as ReimbursementAccount from '../../libs/actions/ReimbursementAccount';
import ReimbursementAccountForm from './ReimbursementAccountForm';
import * as ReimbursementAccountUtils from '../../libs/ReimbursementAccountUtils';

const propTypes = {
    /** The OAuth URI + stateID needed to re-initialize the PlaidLink after the user logs into their bank */
    receivedRedirectURI: PropTypes.string,

    /** During the OAuth flow we need to use the plaidLink token that we initially connected with */
    plaidLinkOAuthToken: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    receivedRedirectURI: null,
    plaidLinkOAuthToken: '',
};

class BankAccountPlaidStep extends React.Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
    }

    submit() {
        const selectedPlaidBankAccount = this.props.plaidData.selectedPlaidBankAccount;
        if (!selectedPlaidBankAccount) {
            return;
        }

        ReimbursementAccount.updateReimbursementAccountDraft({
            routingNumber: selectedPlaidBankAccount.routingNumber,
            accountNumber: selectedPlaidBankAccount.accountNumber,
            plaidMask: selectedPlaidBankAccount.mask,
            isSavings: selectedPlaidBankAccount.isSavings,
            bankName: selectedPlaidBankAccount.bankName,
            plaidAccountID: selectedPlaidBankAccount.plaidAccountID,
            plaidAccessToken: selectedPlaidBankAccount.plaidAccessToken,
        });

        const bankAccountID = ReimbursementAccountUtils.getDefaultStateForField(this.props, 'bankAccountID', 0);
        BankAccounts.connectBankAccountWithPlaid(bankAccountID, selectedPlaidBankAccount);
    }

    render() {
        const bankAccountID = ReimbursementAccountUtils.getDefaultStateForField(this.props, 'bankAccountID', 0);

        return (
            <>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.common.bankAccount')}
                    stepCounter={{step: 1, total: 5}}
                    shouldShowGetAssistanceButton
                    guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_BANK_ACCOUNT}
                    shouldShowBackButton
                    onBackButtonPress={() => BankAccounts.setBankAccountSubStep(null)}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <ReimbursementAccountForm onSubmit={this.submit} hideSubmitButton={_.isUndefined(this.props.plaidData.selectedPlaidBankAccount)}>
                    <AddPlaidBankAccount
                        text={this.props.translate('bankAccount.plaidBodyCopy')}
                        onSelect={(params) => {
                            BankAccounts.updatePlaidData({selectedPlaidBankAccount: params.selectedPlaidBankAccount});
                        }}
                        onExitPlaid={() => BankAccounts.setBankAccountSubStep(null)}
                        receivedRedirectURI={this.props.receivedRedirectURI}
                        plaidLinkOAuthToken={this.props.plaidLinkOAuthToken}
                        allowDebit
                        bankAccountID={bankAccountID}
                    />
                </ReimbursementAccountForm>
            </>
        );
    }
}

BankAccountPlaidStep.propTypes = propTypes;
BankAccountPlaidStep.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccountDraft: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
        },
        plaidData: {
            key: ONYXKEYS.PLAID_DATA,
        },
    }),
)(BankAccountPlaidStep);
