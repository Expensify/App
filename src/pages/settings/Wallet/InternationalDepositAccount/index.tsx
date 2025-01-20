import React from 'react';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import usePermissions from '@hooks/usePermissions';
import AddPersonalBankAccountPage from '@pages/AddPersonalBankAccountPage';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import InternationalDepositAccountContent from './InternationalDepositAccountContent';

function InternationalDepositAccount() {
    const [privatePersonalDetails, privatePersonalDetailsMetadata] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [corpayFields, corpayFieldsMetadata] = useOnyx(ONYXKEYS.CORPAY_FIELDS);
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [draftValues, draftValuesMetadata] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [country, countryMetadata] = useOnyx(ONYXKEYS.COUNTRY);
    const [isAccountLoading, isLoadingMetadata] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {selector: (personalBankAccount) => personalBankAccount?.isLoading});
    const {canUseInternationalBankAccount} = usePermissions();

    const isLoading = isLoadingOnyxValue(privatePersonalDetailsMetadata, corpayFieldsMetadata, bankAccountListMetadata, draftValuesMetadata, countryMetadata, isLoadingMetadata);

    if (!canUseInternationalBankAccount) {
        return <AddPersonalBankAccountPage />;
    }

    if (isLoading) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <InternationalDepositAccountContent
            privatePersonalDetails={privatePersonalDetails}
            corpayFields={corpayFields}
            bankAccountList={bankAccountList}
            draftValues={draftValues}
            country={country}
            isAccountLoading={isAccountLoading ?? false}
        />
    );
}

InternationalDepositAccount.displayName = 'InternationalDepositAccount';

export default InternationalDepositAccount;
