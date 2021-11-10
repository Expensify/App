import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import Navigation from '../../libs/Navigation/Navigation';
import {
    addPlaidBusinessBankAccount,
    addPersonalBankAccount,
} from '../../libs/actions/BankAccounts';
import AddPlaidBankAccount from '../../components/AddPlaidBankAccount';

const propTypes = {
    /** Plaid SDK token to use to initialize the widget */
    plaidLinkToken: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const PlaidOAuthPage = (props) => {
    const receivedRedirectSearchParams = (new URL(window.location.href)).searchParams;
    const oauthStateID = receivedRedirectSearchParams.get('oauth_state_id');
    const bankAccountType = lodashGet(props.route, ['params', 'bankAccountType']);
    let receivedRedirectURI = window.location.href;

    // If there's no stateID passed, then setting the redirectURI to null
    // will return the user to the start of the Plaid flow
    if (!oauthStateID) {
        receivedRedirectURI = null;
    }

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('bankAccount.addBankAccount')}
                onCloseButtonPress={Navigation.dismissModal}
            />
            <AddPlaidBankAccount
                onSubmit={bankAccountType === CONST.BANK_ACCOUNT.BUSINESS
                    ? addPlaidBusinessBankAccount : ({account, password, plaidLinkToken}) => {
                        addPersonalBankAccount(account, password, plaidLinkToken);
                    }}
                receivedRedirectURI={receivedRedirectURI}
                onExitPlaid={Navigation.dismissModal}
                plaidLinkToken={props.plaidLinkToken}
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
    }),
)(PlaidOAuthPage);
