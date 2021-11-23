import React from 'react';
import BaseAddPlaidBankAccount from './BaseAddPlaidBankAccount';
import {propTypes} from './plaidBankPropTypes';

const AddPlaidBankAccount = props => (
    <BaseAddPlaidBankAccount
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
);
AddPlaidBankAccount.propTypes = propTypes;
AddPlaidBankAccount.displayName = 'AddPlaidBankAccount';
export default AddPlaidBankAccount;

