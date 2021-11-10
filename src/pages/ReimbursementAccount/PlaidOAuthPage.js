import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from "prop-types";
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import Navigation from '../../libs/Navigation/Navigation';
import {
    addPersonalBankAccount, setupWithdrawalAccount,
} from '../../libs/actions/BankAccounts';
import AddPlaidBankAccount from '../../components/AddPlaidBankAccount';
import CONST from "../../CONST";

const propTypes = {
    /** Plaid SDK token to use to initialize the widget */
    plaidLinkToken: PropTypes.string,

    ...withLocalizePropTypes,
};

function addPlaidAccount(params) {
    console.log(params);
    setupWithdrawalAccount({
        acceptTerms: true,
        setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,

        // Params passed via the Plaid callback when an account is selected
        plaidAccessToken: params.plaidLinkToken,
        accountNumber: params.account.accountNumber,
        routingNumber: params.account.routingNumber,
        plaidAccountID: params.account.plaidAccountID,
        ownershipType: params.account.ownershipType,
        isSavings: params.account.isSavings,
        bankName: params.bankName,
        addressName: params.account.addressName,

        // Note: These are hardcoded as we're not supporting AU bank accounts for the free plan
        country: CONST.COUNTRY.US,
        currency: CONST.CURRENCY.USD,
        fieldsType: CONST.BANK_ACCOUNT.FIELDS_TYPE.LOCAL,
    });
}

const PlaidOAuthPage = ({
    plaidLinkToken,
    translate,
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
                onSubmit={addPlaidAccount}
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
