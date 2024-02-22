import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as BankAccounts from '@userActions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalBankAccount, PlaidData} from '@src/types/onyx';
import BankAccountStep from "@pages/ReimbursementAccount/BankAccountStep";

type AddPersonalBankAccountPageWithOnyxProps = {
    /** Contains plaid data */
    plaidData: OnyxEntry<PlaidData>;

    /** The details about the Personal bank account we are adding saved in Onyx */
    personalBankAccount: OnyxEntry<PersonalBankAccount>;
};

function AddPersonalBankAccountPageRefactor({personalBankAccount, plaidData}: AddPersonalBankAccountPageWithOnyxProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const shouldShowSuccess = personalBankAccount?.shouldShowSuccess ?? false;


    useEffect(() => BankAccounts.clearPersonalBankAccount, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={shouldShowSuccess}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicator={false}
            testID={AddPersonalBankAccountPageRefactor.displayName}
        >
           <BankAccountStep />
        </ScreenWrapper>
    );
}

AddPersonalBankAccountPageRefactor.displayName = 'AddPersonalBankAccountPage';

export default withOnyx<AddPersonalBankAccountPageWithOnyxProps, AddPersonalBankAccountPageWithOnyxProps>({
    personalBankAccount: {
        key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
    },
    plaidData: {
        key: ONYXKEYS.PLAID_DATA,
    },
})(AddPersonalBankAccountPageRefactor);
