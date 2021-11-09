import React from 'react';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ONYXKEYS from '../../ONYXKEYS';
import {withOnyx} from 'react-native-onyx';
import compose from '../../libs/compose';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import Navigation from '../../libs/Navigation/Navigation';
import {
    addPersonalBankAccount,
} from '../../libs/actions/BankAccounts';
import AddPlaidBankAccount from '../../components/AddPlaidBankAccount';

const propTypes = {
    ...withLocalizePropTypes,
};

const PlaidOAuthPage = ({
    plaidLinkToken,
    translate,
    plaidBankAccounts,
    reimbursementAccount,
}) => {
    const receivedRedirectSearchParams = (new URL(window.location.href)).searchParams;
    const oauth_state_id = receivedRedirectSearchParams.get('oauth_state_id');
    console.log("in PlaidOAuthPage", oauth_state_id);

    // Add validation check for stateID or errors

    // Need to differentiate between personal and business bank account
    // if personal then addPersonalBankAccount(account, password, plaidLinkToken);
    // if business then bankAccountStep -> addPlaidAccount

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={translate('bankAccount.addBankAccount')}
                onCloseButtonPress={Navigation.dismissModal}
            />
            <AddPlaidBankAccount
                onSubmit={({account, password, plaidLinkToken}) => {
                    addPersonalBankAccount(account, password, plaidLinkToken);
                }}
                receivedRedirectURI={window.location.href}
                onExitPlaid={Navigation.dismissModal}
                plaidLinkToken={plaidLinkToken}
            />
        </ScreenWrapper>
    );
};

PlaidOAuthPage.propTypes = propTypes;
PlaidOAuthPage.displayName = 'PlaidOAuthPage';
export default compose(
    withLocalize,
    withOnyx({
        plaidLinkToken: {
            // If we hit here we've been redirected to reinitialize the PlaidLink
            key: ONYXKEYS.PLAID_LINK_TOKEN,
        },
        plaidBankAccounts: {
            key: ONYXKEYS.PLAID_BANK_ACCOUNTS,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(PlaidOAuthPage);
