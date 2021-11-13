
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
    addPersonalBankAccount, setBankAccountSubStep,
} from '../../libs/actions/BankAccounts';
import AddPlaidBankAccount from '../../components/AddPlaidBankAccount';
import ROUTES from "../../ROUTES";

const propTypes = {
    /** Plaid SDK token to use to initialize the widget */
    plaidLinkToken: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const onSubmit = (params, bankAccountType) => {
    bankAccountType === CONST.BANK_ACCOUNT.BUSINESS
        ? addPlaidBusinessBankAccount(params) : ({account, password, plaidLinkToken}) => {
            addPersonalBankAccount(account, password, plaidLinkToken);
        };
    Navigation.navigate(ROUTES.getWorkspaceBankAccountRoute('420CE21A85AC96F0'));
};

const PlaidOAuthPage = (props) => {
    let receivedRedirectURI = window.location.href;
    const receivedRedirectSearchParams = (new URL(receivedRedirectURI)).searchParams;
    const oauthStateID = receivedRedirectSearchParams.get('oauth_state_id');
    const bankAccountType = lodashGet(props.route, ['params', 'bankAccountType']);

    // If there's no stateID passed, then return user to start of Plaid flow by setting the redirectURI to null
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
                onSubmit={params => onSubmit(params, bankAccountType)}
                receivedRedirectURI={receivedRedirectURI}
                onExitPlaid={() => {
                    setBankAccountSubStep(null);
                    Navigation.dismissModal();
                }}
                plaidLinkToken={props.plaidLinkToken}
            />
            {/*<AddPlaidBankAccount*/}
            {/*    onSubmit={addPlaidBusinessBankAccount}*/}
            {/*    receivedRedirectURI={receivedRedirectURI}*/}
            {/*    onExitPlaid={Navigation.dismissModal}*/}
            {/*    plaidLinkToken={props.plaidLinkToken}*/}
            {/*/>*/}
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
