import _ from 'underscore';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import ScreenWrapper from '../components/ScreenWrapper';
import Navigation from '../libs/Navigation/Navigation';
import * as BankAccounts from '../libs/actions/BankAccounts';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import AddPlaidBankAccount from '../components/AddPlaidBankAccount';
import getPlaidOAuthReceivedRedirectURI from '../libs/getPlaidOAuthReceivedRedirectURI';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    ...withLocalizePropTypes,
    personalBankAccount: PropTypes.shape({
        error: PropTypes.string,
        success: PropTypes.string,
        loading: PropTypes.bool,
    }),
};

const defaultProps = {
    personalBankAccount: {
        error: '',
        success: '',
        loading: false,
    },
};

const AddPersonalBankAccountPage = props => (
    <ScreenWrapper>
        <HeaderWithCloseButton
            title={props.translate('bankAccount.addBankAccount')}
            onCloseButtonPress={Navigation.goBack}
            shouldShowBackButton
            onBackButtonPress={Navigation.goBack}
        />
        <AddPlaidBankAccount
            onSubmit={({account, password, plaidLinkToken}) => {
                BankAccounts.addPersonalBankAccount(account, password, plaidLinkToken);
            }}
            onExitPlaid={Navigation.goBack}
            receivedRedirectURI={getPlaidOAuthReceivedRedirectURI()}
            plaidLinkOAuthToken={props.plaidLinkToken}
            isPasswordRequired
        />
    </ScreenWrapper>
);

AddPersonalBankAccountPage.propTypes = propTypes;
AddPersonalBankAccountPage.defaultProps = defaultProps;
AddPersonalBankAccountPage.displayName = 'AddPersonalBankAccountPage';

export default compose(
    withLocalize,
    withOnyx({
        personalBankAccount: {
            key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
        },
    }),
)(AddPersonalBankAccountPage);
