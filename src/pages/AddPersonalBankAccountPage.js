import React from 'react';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import ScreenWrapper from '../components/ScreenWrapper';
import Navigation from '../libs/Navigation/Navigation';
import {
    addPersonalBankAccount,
} from '../libs/actions/BankAccounts';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import AddPlaidBankAccount from '../components/AddPlaidBankAccount';

const propTypes = {
    ...withLocalizePropTypes,
};

const AddPersonalBankAccountPage = props => (
    <ScreenWrapper>
        <HeaderWithCloseButton
            title={props.translate('bankAccount.addBankAccount')}
            onCloseButtonPress={Navigation.dismissModal}
        />
        <AddPlaidBankAccount
            onSubmit={({account, password, plaidLinkToken}) => {
                addPersonalBankAccount(account, password, plaidLinkToken);
            }}
            onExitPlaid={Navigation.dismissModal}
        />
    </ScreenWrapper>
);

AddPersonalBankAccountPage.propTypes = propTypes;
AddPersonalBankAccountPage.displayName = 'AddPersonalBankAccountPage';
export default withLocalize(AddPersonalBankAccountPage);
