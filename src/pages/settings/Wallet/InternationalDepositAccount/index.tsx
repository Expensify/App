import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useOnyx from '@hooks/useOnyx';

import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import {fetchCorpayFields} from '@userActions/BankAccounts';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect, useRef, useState} from 'react';

import InternationalDepositAccountContent from './InternationalDepositAccountContent';

type InternationalDepositAccountProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.ADD_BANK_ACCOUNT>;

function InternationalDepositAccount({route}: InternationalDepositAccountProps) {
    const [privatePersonalDetails, privatePersonalDetailsMetadata] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [corpayFields, corpayFieldsMetadata] = useOnyx(ONYXKEYS.CORPAY_FIELDS);
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [draftValues, draftValuesMetadata] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [country, countryMetadata] = useOnyx(ONYXKEYS.COUNTRY);
    const [personalBankAccount, personalBankAccountMetadata] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
    const backTo = route.params?.backTo;

    const isLoading = isLoadingOnyxValue(privatePersonalDetailsMetadata, corpayFieldsMetadata, bankAccountListMetadata, draftValuesMetadata, countryMetadata, personalBankAccountMetadata);
    const hasMatchingCorpayFields =
        corpayFields?.bankCountry === draftValues?.bankCountry &&
        (!draftValues?.bankCurrency || corpayFields?.bankCurrency === draftValues.bankCurrency) &&
        !!corpayFields?.formFields?.length;
    const resumeFieldsKey = `${draftValues?.bankCountry ?? ''}:${draftValues?.bankCurrency ?? ''}`;
    const requestedResumeFieldsKeyRef = useRef('');
    const [completedResumeFieldsKey, setCompletedResumeFieldsKey] = useState('');
    const shouldRefreshResumeFields =
        personalBankAccount?.source === CONST.BANK_ACCOUNT.SOURCE.WALLET &&
        !!draftValues?.bankCountry &&
        !hasMatchingCorpayFields &&
        !personalBankAccount?.isLoading &&
        completedResumeFieldsKey !== resumeFieldsKey;

    useEffect(() => {
        if (isLoading || !shouldRefreshResumeFields || requestedResumeFieldsKeyRef.current === resumeFieldsKey || !draftValues?.bankCountry) {
            return;
        }
        const requestedResumeFieldsKey = resumeFieldsKey;
        requestedResumeFieldsKeyRef.current = requestedResumeFieldsKey;
        fetchCorpayFields(draftValues.bankCountry, draftValues.bankCurrency, false, false, {preserveExistingDraft: true}).finally(() => {
            if (requestedResumeFieldsKeyRef.current !== requestedResumeFieldsKey) {
                return;
            }
            setCompletedResumeFieldsKey(requestedResumeFieldsKey);
        });
    }, [draftValues?.bankCountry, draftValues?.bankCurrency, isLoading, resumeFieldsKey, shouldRefreshResumeFields]);

    if (isLoading || shouldRefreshResumeFields) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <InternationalDepositAccountContent
            privatePersonalDetails={privatePersonalDetails}
            corpayFields={corpayFields}
            bankAccountList={bankAccountList}
            draftValues={draftValues}
            country={country}
            isAccountLoading={personalBankAccount?.isLoading ?? false}
            backTo={backTo}
        />
    );
}

export default InternationalDepositAccount;
