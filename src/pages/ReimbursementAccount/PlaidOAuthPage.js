import React from "react";
import {View} from 'react-native';
import OAuthLink from "../../components/PlaidOAuth/oauth";
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ONYXKEYS from "../../ONYXKEYS";
import {withOnyx} from "react-native-onyx";
import ReimbursementAccountForm from "./ReimbursementAccountForm";
import _ from "underscore";
import Text from "../../components/Text";
import styles from "../../styles/styles";
import Icon from "../../components/Icon";
import ExpensiPicker from "../../components/ExpensiPicker";
import lodashGet from "lodash/get";
import compose from '../../libs/compose';
import getBankIcon from "../../components/Icon/BankIcons";
import GenericBank from '../../../assets/images/bankicons/generic-bank-account.svg';
import variables from "../../styles/variables";
import Log from "../../libs/Log";
import {getPlaidBankAccounts} from "../../libs/actions/BankAccounts";
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

    // Need to differentiate between personal and business bank account

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
