import React from 'react';
import {withOnyx} from 'react-native-onyx';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import Navigation from '../../libs/Navigation/Navigation';
import {
    addPersonalBankAccount, showBankAccountErrorModal,
} from '../../libs/actions/BankAccounts';
import AddPlaidBankAccount from '../../components/AddPlaidBankAccount';
import ROUTES from "../../ROUTES";

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
    const oauthStateID = receivedRedirectSearchParams.get('oauth_state_id');
    let receivedRedirectURI = window.location.href;

    // If there's no stateID passed, then setting the redirectURI to null
    // will return the user to the start of the PLaid flow
    if (!oauthStateID) {
        receivedRedirectURI = null;
    }

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
                // onSubmit={({account, password, plaidLinkToken}) => {
                //     addPersonalBankAccount(account, password, plaidLinkToken);
                // }}
                receivedRedirectURI={receivedRedirectURI}
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
