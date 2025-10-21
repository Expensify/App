import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PersonalBankAccount} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import InternationalDepositAccountContent from './InternationalDepositAccountContent';

type InternationalDepositAccountProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.ADD_BANK_ACCOUNT>;

const isLoadingPersonalBankAccountSelector = (personalBankAccount: OnyxEntry<PersonalBankAccount>) => personalBankAccount?.isLoading;

function InternationalDepositAccount({
    route: {
        params: {backTo},
    },
}: InternationalDepositAccountProps) {
    const [privatePersonalDetails, privatePersonalDetailsMetadata] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: false});
    const [corpayFields, corpayFieldsMetadata] = useOnyx(ONYXKEYS.CORPAY_FIELDS, {canBeMissing: true});
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [draftValues, draftValuesMetadata] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const [country, countryMetadata] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: true});
    const [isAccountLoading, isLoadingMetadata] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {selector: isLoadingPersonalBankAccountSelector, canBeMissing: true});

    const isLoading = isLoadingOnyxValue(privatePersonalDetailsMetadata, corpayFieldsMetadata, bankAccountListMetadata, draftValuesMetadata, countryMetadata, isLoadingMetadata);

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
            backTo={backTo}
        />
    );
}

InternationalDepositAccount.displayName = 'InternationalDepositAccount';

export default InternationalDepositAccount;
