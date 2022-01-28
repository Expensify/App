import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import ScreenWrapper from '../components/ScreenWrapper';
import Navigation from '../libs/Navigation/Navigation';
import * as BankAccounts from '../libs/actions/BankAccounts';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import AddPlaidBankAccount from '../components/AddPlaidBankAccount';
import getPlaidOAuthReceivedRedirectURI from '../libs/getPlaidOAuthReceivedRedirectURI';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import KeyboardAvoidingView from '../components/KeyboardAvoidingView';

const propTypes = {
    ...withLocalizePropTypes,

    /** Plaid SDK token to use to initialize the widget */
    plaidLinkToken: PropTypes.string,
};

const defaultProps = {
    plaidLinkToken: '',
};

const AddPersonalBankAccountPage = props => (
    <ScreenWrapper>
        <KeyboardAvoidingView>
            <HeaderWithCloseButton
                title={props.translate('bankAccount.addBankAccount')}
                onCloseButtonPress={() => Navigation.goBack()}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <AddPlaidBankAccount
                onSubmit={({account, password, plaidLinkToken}) => {
                    BankAccounts.addPersonalBankAccount(account, password, plaidLinkToken);
                }}
                onExitPlaid={() => Navigation.goBack()}
                receivedRedirectURI={getPlaidOAuthReceivedRedirectURI()}
                plaidLinkOAuthToken={props.plaidLinkToken}
                isPasswordRequired
            />
        </KeyboardAvoidingView>
    </ScreenWrapper>
);

AddPersonalBankAccountPage.propTypes = propTypes;
AddPersonalBankAccountPage.defaultProps = defaultProps;
AddPersonalBankAccountPage.displayName = 'AddPersonalBankAccountPage';

export default compose(
    withLocalize,
    withOnyx({
        plaidLinkToken: {
            key: ONYXKEYS.PLAID_LINK_TOKEN,
        },
    }),
)(AddPersonalBankAccountPage);
