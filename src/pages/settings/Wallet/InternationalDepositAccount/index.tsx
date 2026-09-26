import FullPageErrorView from '@components/BlockingViews/FullPageErrorView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';

import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import {clearCorpayBankAccountFields, clearCorpayFieldsError, fetchCorpayFields} from '@userActions/BankAccounts';
import {clearDraftValues} from '@userActions/FormActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PersonalBankAccount} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useRef} from 'react';

import InternationalDepositAccountContent from './InternationalDepositAccountContent';

type InternationalDepositAccountProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.ADD_BANK_ACCOUNT>;

const personalBankAccountSourceSelector = (personalBankAccount: OnyxEntry<PersonalBankAccount>) => personalBankAccount?.source;
const personalBankAccountIsLoadingSelector = (personalBankAccount: OnyxEntry<PersonalBankAccount>) => personalBankAccount?.isLoading;
const personalBankAccountCorpayFieldsErrorSelector = (personalBankAccount: OnyxEntry<PersonalBankAccount>) => personalBankAccount?.corpayFieldsError;
const personalBankAccountCurrentPageSelector = (personalBankAccount: OnyxEntry<PersonalBankAccount>) => personalBankAccount?.currentPage;

function InternationalDepositAccount({route}: InternationalDepositAccountProps) {
    const {translate} = useLocalize();
    const [privatePersonalDetails, privatePersonalDetailsMetadata] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [corpayFields, corpayFieldsMetadata] = useOnyx(ONYXKEYS.CORPAY_FIELDS);
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [draftValues, draftValuesMetadata] = useOnyx(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT);
    const [country, countryMetadata] = useOnyx(ONYXKEYS.COUNTRY);
    const [personalBankAccountSource, personalBankAccountMetadata] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {selector: personalBankAccountSourceSelector});
    const [isPersonalBankAccountLoading] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {selector: personalBankAccountIsLoadingSelector});
    const [corpayFieldsError] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {selector: personalBankAccountCorpayFieldsErrorSelector});
    const [savedPage] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {selector: personalBankAccountCurrentPageSelector});
    const backTo = route.params?.backTo;

    const isLoading = isLoadingOnyxValue(privatePersonalDetailsMetadata, corpayFieldsMetadata, bankAccountListMetadata, draftValuesMetadata, countryMetadata, personalBankAccountMetadata);
    const hasMatchingCorpayFields =
        corpayFields?.bankCountry === draftValues?.bankCountry &&
        (!draftValues?.bankCurrency || corpayFields?.bankCurrency === draftValues.bankCurrency) &&
        corpayFields?.isWithdrawal === false &&
        corpayFields?.isBusinessBankAccount === false &&
        !!corpayFields?.formFields?.length;
    const resumeFieldsKey = `${draftValues?.bankCountry ?? ''}:${draftValues?.bankCurrency ?? ''}`;
    const requestedResumeFieldsKeyRef = useRef('');
    const shouldResumeWithRefreshedFields = personalBankAccountSource === CONST.BANK_ACCOUNT.SOURCE.WALLET && !!draftValues?.bankCountry && !hasMatchingCorpayFields;
    const hasResumeFieldsError = shouldResumeWithRefreshedFields && !!corpayFieldsError;
    const shouldWaitForResumeFields = shouldResumeWithRefreshedFields && !hasResumeFieldsError;
    const shouldRefreshResumeFields = shouldWaitForResumeFields && !isPersonalBankAccountLoading;

    useEffect(() => {
        if (isLoading || !shouldRefreshResumeFields || requestedResumeFieldsKeyRef.current === resumeFieldsKey || !draftValues?.bankCountry) {
            return;
        }
        requestedResumeFieldsKeyRef.current = resumeFieldsKey;
        fetchCorpayFields(draftValues.bankCountry, draftValues.bankCurrency, false, false, {preserveExistingDraft: true});
    }, [draftValues?.bankCountry, draftValues?.bankCurrency, isLoading, resumeFieldsKey, shouldRefreshResumeFields]);

    useEffect(() => {
        if (!hasResumeFieldsError) {
            return;
        }
        requestedResumeFieldsKeyRef.current = '';
    }, [hasResumeFieldsError]);

    const retryFetchCorpayFields = () => {
        if (!draftValues?.bankCountry) {
            return;
        }
        requestedResumeFieldsKeyRef.current = resumeFieldsKey;
        fetchCorpayFields(draftValues.bankCountry, draftValues.bankCurrency, false, false, {preserveExistingDraft: true});
    };

    const handleLoadingBackButtonPress = () => {
        if (hasResumeFieldsError) {
            clearDraftValues(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
            clearCorpayBankAccountFields();
            clearCorpayFieldsError();
        }
        Navigation.goBack(backTo);
    };

    if (isLoading || shouldWaitForResumeFields || hasResumeFieldsError) {
        return (
            <ScreenWrapper
                shouldEnableMaxHeight
                shouldShowOfflineIndicatorInWideScreen
                testID="InternationalDepositAccountLoading"
            >
                <HeaderWithBackButton
                    title={translate('bankAccount.addBankAccount')}
                    onBackButtonPress={handleLoadingBackButtonPress}
                />
                <FullPageOfflineBlockingView>
                    {hasResumeFieldsError ? (
                        <FullPageErrorView
                            shouldShow
                            title={translate('errorPage.title', {isBreakLine: false})}
                            subtitle={translate(corpayFieldsError ?? 'common.genericErrorMessage')}
                            buttonTranslationKey="common.tryAgain"
                            onButtonPress={retryFetchCorpayFields}
                        />
                    ) : (
                        <FullScreenLoadingIndicator
                            shouldUseGoBackButton
                            onGoBack={handleLoadingBackButtonPress}
                        />
                    )}
                </FullPageOfflineBlockingView>
            </ScreenWrapper>
        );
    }

    return (
        <InternationalDepositAccountContent
            privatePersonalDetails={privatePersonalDetails}
            corpayFields={corpayFields}
            bankAccountList={bankAccountList}
            draftValues={draftValues}
            country={country}
            isAccountLoading={isPersonalBankAccountLoading ?? false}
            isWalletSetup={personalBankAccountSource === CONST.BANK_ACCOUNT.SOURCE.WALLET}
            savedPage={savedPage}
            backTo={backTo}
        />
    );
}

export default InternationalDepositAccount;
