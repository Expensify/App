import type {ComponentType} from 'react';
import React, {useCallback, useEffect, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import type {SaveCorpayOnboardingCompanyDetails} from '@libs/API/parameters/SaveCorpayOnboardingCompanyDetailsParams';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import Address from './substeps/Address';
import AverageReimbursement from './substeps/AverageReimbursement';
import BusinessType from './substeps/BusinessType';
import Confirmation from './substeps/Confirmation';
import ContactInformation from './substeps/ContactInformation';
import IncorporationLocation from './substeps/IncorporationLocation';
import Name from './substeps/Name';
import PaymentVolume from './substeps/PaymentVolume';
import RegistrationNumber from './substeps/RegistrationNumber';
import TaxIDEINNumber from './substeps/TaxIDEINNumber';

type BusinessInfoProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;
};

type BusinessInfoParamsPartial = Omit<SaveCorpayOnboardingCompanyDetails, 'currencyNeeded' | 'purposeOfTransactionId'>;

const bodyContent: Array<ComponentType<SubStepProps>> = [
    Name,
    Address,
    ContactInformation,
    RegistrationNumber,
    TaxIDEINNumber,
    IncorporationLocation,
    BusinessType,
    PaymentVolume,
    AverageReimbursement,
    Confirmation,
];

const INPUT_KEYS = {
    NAME: INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_NAME,
    STREET: INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_STREET,
    CITY: INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_CITY,
    STATE: INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_STATE,
    COMPANY_POSTAL_CODE: INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_POSTAL_CODE,
    COMPANY_COUNTRY_CODE: INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_COUNTRY_CODE,
    CONTACT_NUMBER: INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_CONTACT_NUMBER,
    CONFIRMATION_EMAIL: INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_CONFIRMATION_EMAIL,
    INCORPORATION_STATE: INPUT_IDS.ADDITIONAL_DATA.CORPAY.FORMATION_INCORPORATION_STATE,
    INCORPORATION_COUNTRY: INPUT_IDS.ADDITIONAL_DATA.CORPAY.FORMATION_INCORPORATION_COUNTRY_CODE,
    BUSINESS_REGISTRATION_INCORPORATION_NUMBER: INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_REGISTRATION_INCORPORATION_NUMBER,
    BUSINESS_CATEGORY: INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_CATEGORY,
    APPLICANT_TYPE_ID: INPUT_IDS.ADDITIONAL_DATA.CORPAY.APPLICANT_TYPE_ID,
    ANNUAL_VOLUME: INPUT_IDS.ADDITIONAL_DATA.CORPAY.ANNUAL_VOLUME,
    TRADE_VOLUME: INPUT_IDS.ADDITIONAL_DATA.CORPAY.TRADE_VOLUME,
    TAX_ID_EIN_NUMBER: INPUT_IDS.ADDITIONAL_DATA.CORPAY.TAX_ID_EIN_NUMBER,
};

function BusinessInfo({onBackButtonPress, onSubmit}: BusinessInfoProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? '';
    const businessInfoStepValues = useMemo(() => getSubstepValues(INPUT_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const country = reimbursementAccount?.achData?.additionalData?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';

    useEffect(() => {
        BankAccounts.getCorpayOnboardingFields(country);
    }, [country]);

    const submit = useCallback(() => {
        const params = {} as BusinessInfoParamsPartial;
        Object.values(INPUT_KEYS).forEach((currentKey) => {
            params[currentKey] = businessInfoStepValues[currentKey];
        });

        BankAccounts.saveCorpayOnboardingCompanyDetails(
            {
                ...params,
                currencyNeeded: currency,
                purposeOfTransactionId: CONST.NON_USD_BANK_ACCOUNT.PURPOSE_OF_TRANSACTION_ID,
            },
            bankAccountID,
        );
    }, [currency, bankAccountID, businessInfoStepValues]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (reimbursementAccount?.errors || reimbursementAccount?.isSavingCorpayOnboardingCompanyFields || !reimbursementAccount?.isSuccess) {
            return;
        }

        if (reimbursementAccount?.isSuccess) {
            onSubmit();
            BankAccounts.clearReimbursementAccountSaveCorpayOnboardingCompanyDetails();
        }

        return () => {
            BankAccounts.clearReimbursementAccountSaveCorpayOnboardingCompanyDetails();
        };
    }, [reimbursementAccount, onSubmit]);

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo, goToTheLastStep} = useSubStep({bodyContent, startFrom: 0, onFinished: submit});

    const handleBackButtonPress = () => {
        if (isEditing) {
            goToTheLastStep();
            return;
        }

        if (screenIndex === 0) {
            onBackButtonPress();
        } else {
            prevScreen();
        }
    };

    return (
        <InteractiveStepWrapper
            wrapperID={BusinessInfo.displayName}
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('businessInfoStep.businessInfoTitle')}
            stepNames={CONST.NON_USD_BANK_ACCOUNT.STEP_NAMES}
            startStepIndex={2}
        >
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
                screenIndex={screenIndex}
            />
        </InteractiveStepWrapper>
    );
}

BusinessInfo.displayName = 'BusinessInfo';

export default BusinessInfo;
