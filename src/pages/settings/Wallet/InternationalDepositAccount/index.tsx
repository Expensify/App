import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalBankAccount} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import InternationalDepositAccountContent from './InternationalDepositAccountContent';
import WiseDepositAccountContent from './WiseDepositAccountContent';

type InternationalDepositAccountProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.ADD_BANK_ACCOUNT>;

type CorpayDepositAccountProps = {
    /** The route to return to once the flow closes */
    backTo?: Route;
};

const isLoadingPersonalBankAccountSelector = (personalBankAccount: OnyxEntry<PersonalBankAccount>) => personalBankAccount?.isLoading;

// Owns the Corpay subscriptions so the Wise flow doesn't load data it never reads
function CorpayDepositAccount({backTo}: CorpayDepositAccountProps) {
    const [privatePersonalDetails, privatePersonalDetailsMetadata] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [corpayFields, corpayFieldsMetadata] = useOnyx(ONYXKEYS.CORPAY_FIELDS);
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [draftValues, draftValuesMetadata] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [country, countryMetadata] = useOnyx(ONYXKEYS.COUNTRY);
    const [isAccountLoading, isLoadingMetadata] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {selector: isLoadingPersonalBankAccountSelector});

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

function InternationalDepositAccount({route}: InternationalDepositAccountProps) {
    const backTo = route.params?.backTo;
    const {isBetaEnabled} = usePermissions();

    if (isBetaEnabled(CONST.BETAS.WISE_REIMBURSEMENTS)) {
        return (
            <WiseDepositAccountContent
                backTo={backTo}
                subPage={route.params?.subPage}
                isEditing={route.params?.action === 'edit'}
            />
        );
    }

    return <CorpayDepositAccount backTo={backTo} />;
}

export default InternationalDepositAccount;
