import React, {useEffect} from 'react';
import DocusignFullStep from '@components/SubStepForms/DocusignFullStep';
import useOnyx from '@hooks/useOnyx';
import {clearEnableGlobalReimbursementsForUSDBankAccount, enableGlobalReimbursementsForUSDBankAccount} from '@libs/actions/BankAccounts';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';

type EnableGlobalReimbursementsSignPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS>;

function EnableGlobalReimbursementsSignPage({route}: EnableGlobalReimbursementsSignPageProps) {
    const bankAccountID = route.params?.bankAccountID;
    const [bankAccount] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: (list) => list?.[bankAccountID]});
    const currency = bankAccount?.bankCurrency ?? '';
    const country = bankAccount?.bankCountry;
    const [enableGlobalReimbursements] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS);
    const [enableGlobalReimbursementsDraft] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT);
    const defaultValue = enableGlobalReimbursementsDraft?.[INPUT_IDS.ACH_AUTHORIZATION_FORM] ?? [];

    const goBack = () => {
        Navigation.goBack(ROUTES.SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS_AGREEMENTS.getRoute(Number(bankAccountID)));
    };

    const onSubmit = () => {
        enableGlobalReimbursementsForUSDBankAccount({
            inputs: JSON.stringify({
                provideTruthfulInformation: enableGlobalReimbursementsDraft?.[INPUT_IDS.PROVIDE_TRUTHFUL_INFORMATION],
                agreeToTermsAndConditions: enableGlobalReimbursementsDraft?.[INPUT_IDS.AGREE_TO_TERMS_AND_CONDITIONS],
                consentToPrivacyNotice: enableGlobalReimbursementsDraft?.[INPUT_IDS.CONSENT_TO_PRIVACY_NOTICE],
                authorizedToBindClientToAgreement: enableGlobalReimbursementsDraft?.[INPUT_IDS.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT],
                natureOfBusiness: enableGlobalReimbursementsDraft?.[INPUT_IDS.BUSINESS_CATEGORY],
                applicantTypeId: enableGlobalReimbursementsDraft?.[INPUT_IDS.APPLICANT_TYPE_ID],
                tradeVolume: enableGlobalReimbursementsDraft?.[INPUT_IDS.TRADE_VOLUME],
                annualVolume: enableGlobalReimbursementsDraft?.[INPUT_IDS.ANNUAL_VOLUME],
                businessRegistrationIncorporationNumber: enableGlobalReimbursementsDraft?.[INPUT_IDS.BUSINESS_REGISTRATION_INCORPORATION_NUMBER],
                fundSourceCountries: country,
                fundDestinationCountries: country,
                currencyNeeded: currency,
                purposeOfTransactionId: CONST.NON_USD_BANK_ACCOUNT.PURPOSE_OF_TRANSACTION_ID,
            }),
            achAuthorizationForm: enableGlobalReimbursementsDraft?.[INPUT_IDS.ACH_AUTHORIZATION_FORM].at(0),
            bankAccountID: Number(bankAccountID),
        });
    };

    useEffect(() => {
        if (enableGlobalReimbursements?.errors || enableGlobalReimbursements?.isEnablingGlobalReimbursements || !enableGlobalReimbursements?.isSuccess) {
            return;
        }

        if (enableGlobalReimbursements?.isSuccess) {
            clearEnableGlobalReimbursementsForUSDBankAccount();
            Navigation.closeRHPFlow();
        }

        return clearEnableGlobalReimbursementsForUSDBankAccount;
    }, [enableGlobalReimbursements?.errors, enableGlobalReimbursements?.isEnablingGlobalReimbursements, enableGlobalReimbursements?.isSuccess]);

    return (
        <DocusignFullStep
            defaultValue={defaultValue}
            formID={ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS}
            inputID={INPUT_IDS.ACH_AUTHORIZATION_FORM}
            isLoading={enableGlobalReimbursements?.isEnablingGlobalReimbursements ?? false}
            onBackButtonPress={goBack}
            onSubmit={onSubmit}
            currency={currency}
            startStepIndex={2}
            stepNames={CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP_INDEX_LIST}
        />
    );
}

export default EnableGlobalReimbursementsSignPage;
