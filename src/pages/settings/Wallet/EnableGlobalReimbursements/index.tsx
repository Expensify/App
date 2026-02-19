import React, {useEffect, useState} from 'react';
import type {ValueOf} from 'type-fest';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {clearEnableGlobalReimbursementsForUSDBankAccount, enableGlobalReimbursementsForUSDBankAccount, getCorpayOnboardingFields} from '@userActions/BankAccounts';
import {clearErrors} from '@userActions/FormActions';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';
import Agreements from './Agreements';
import BusinessInfo from './BusinessInfo';
import Docusign from './Docusign';

type EnableGlobalReimbursementsProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.ENABLE_GLOBAL_REIMBURSEMENTS>;

function EnableGlobalReimbursements({route}: EnableGlobalReimbursementsProps) {
    const bankAccountID = route.params?.bankAccountID;
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: false});
    const [enableGlobalReimbursements] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS, {canBeMissing: true});
    const [enableGlobalReimbursementsDraft] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT, {canBeMissing: true});
    const currency = bankAccountList?.[bankAccountID]?.bankCurrency ?? '';
    const country = bankAccountList?.[bankAccountID]?.bankCountry;

    const [enableGlobalReimbursementsStep, setEnableGlobalReimbursementsStep] = useState<ValueOf<typeof CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP>>(
        CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.BUSINESS_INFO,
    );

    useEffect(() => {
        getCorpayOnboardingFields(country as Country);
    }, [country]);

    const handleNextEnableGlobalReimbursementsStep = () => {
        switch (enableGlobalReimbursementsStep) {
            case CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.BUSINESS_INFO:
                setEnableGlobalReimbursementsStep(CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.AGREEMENTS);
                break;

            case CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.AGREEMENTS:
                setEnableGlobalReimbursementsStep(CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.DOCUSIGN);
                break;

            default:
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
        }
    };

    const handleEnableGlobalReimbursementGoBack = () => {
        clearErrors(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS);
        switch (enableGlobalReimbursementsStep) {
            case CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.BUSINESS_INFO:
                Navigation.goBack();
                break;
            case CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.AGREEMENTS:
                setEnableGlobalReimbursementsStep(CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.BUSINESS_INFO);
                break;
            case CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.DOCUSIGN:
                setEnableGlobalReimbursementsStep(CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.AGREEMENTS);
                break;
            default:
                return null;
        }
    };

    useEffect(() => {
        return clearErrors(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (enableGlobalReimbursements?.errors || enableGlobalReimbursements?.isEnablingGlobalReimbursements || !enableGlobalReimbursements?.isSuccess) {
            return;
        }

        if (enableGlobalReimbursements?.isSuccess) {
            clearEnableGlobalReimbursementsForUSDBankAccount();
            Navigation.closeRHPFlow();
        }

        return () => {
            clearEnableGlobalReimbursementsForUSDBankAccount();
        };
    }, [enableGlobalReimbursements?.errors, enableGlobalReimbursements?.isEnablingGlobalReimbursements, enableGlobalReimbursements?.isSuccess]);

    switch (enableGlobalReimbursementsStep) {
        case CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.BUSINESS_INFO:
            return (
                <BusinessInfo
                    onBackButtonPress={handleEnableGlobalReimbursementGoBack}
                    onSubmit={handleNextEnableGlobalReimbursementsStep}
                    currency={currency}
                    country={country as Country}
                />
            );
        case CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.AGREEMENTS:
            return (
                <Agreements
                    onBackButtonPress={handleEnableGlobalReimbursementGoBack}
                    onSubmit={handleNextEnableGlobalReimbursementsStep}
                    currency={currency}
                />
            );
        case CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.DOCUSIGN:
            return (
                <Docusign
                    onBackButtonPress={handleEnableGlobalReimbursementGoBack}
                    onSubmit={handleNextEnableGlobalReimbursementsStep}
                    currency={currency}
                />
            );
        default:
            return null;
    }
}

export default EnableGlobalReimbursements;
