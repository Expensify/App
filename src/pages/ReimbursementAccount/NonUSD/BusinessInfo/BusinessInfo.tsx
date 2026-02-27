import {Str} from 'expensify-common';
import type {ComponentType} from 'react';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getInitialSubStepForBusinessInfoStep from '@pages/ReimbursementAccount/NonUSD/utils/getInitialSubStepForBusinessInfoStep';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import {clearReimbursementAccountSaveCorpayOnboardingCompanyDetails, getCorpayOnboardingFields, saveCorpayOnboardingCompanyDetails} from '@userActions/BankAccounts';
import {clearErrors} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import Address from './subSteps/Address';
import AverageReimbursement from './subSteps/AverageReimbursement';
import BusinessType from './subSteps/BusinessType';
import Confirmation from './subSteps/Confirmation';
import ContactInformation from './subSteps/ContactInformation';
import IncorporationLocation from './subSteps/IncorporationLocation';
import Name from './subSteps/Name';
import PaymentVolume from './subSteps/PaymentVolume';
import RegistrationNumber from './subSteps/RegistrationNumber';
import TaxIDEINNumber from './subSteps/TaxIDEINNumber';
import Website from './subSteps/Website';

type BusinessInfoProps = {
    /** Handles back button press */
    onBackButtonPress: () => void;

    /** Handles submit button press */
    onSubmit: () => void;

    /** Array of step names */
    stepNames?: readonly string[];
};

const bodyContent: Array<ComponentType<SubStepProps>> = [
    Name,
    Website,
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
    WEBSITE: INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_WEBSITE,
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
    BUSINESS_TYPE_ID: INPUT_IDS.ADDITIONAL_DATA.CORPAY.BUSINESS_TYPE_ID,
};

function BusinessInfo({onBackButtonPress, onSubmit, stepNames}: BusinessInfoProps) {
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const currency = policy?.outputCurrency ?? '';
    const businessInfoStepValues = useMemo(() => getSubStepValues(INPUT_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const startFrom = useMemo(() => getInitialSubStepForBusinessInfoStep(businessInfoStepValues), [businessInfoStepValues]);

    const country = reimbursementAccount?.achData?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';
    const isBusinessTypeRequired = country !== CONST.COUNTRY.CA;
    const isSubmittingRef = useRef(false);

    useEffect(() => {
        getCorpayOnboardingFields(country);
    }, [country]);

    const submit = useCallback(() => {
        isSubmittingRef.current = true;
        saveCorpayOnboardingCompanyDetails(
            {
                ...businessInfoStepValues,
                // Corpay does not accept emails with a "+" character and will not let us connect account at the end of whole flow
                businessConfirmationEmail: !isProduction ? Str.replaceAll(businessInfoStepValues.businessConfirmationEmail, '+', '') : businessInfoStepValues.businessConfirmationEmail,
                fundSourceCountries: country,
                fundDestinationCountries: country,
                currencyNeeded: currency,
                purposeOfTransactionId: CONST.NON_USD_BANK_ACCOUNT.PURPOSE_OF_TRANSACTION_ID,
                businessTypeId: isBusinessTypeRequired ? businessInfoStepValues.businessTypeId : undefined,
            },
            bankAccountID,
        );
    }, [businessInfoStepValues, isProduction, country, currency, isBusinessTypeRequired, bankAccountID]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (reimbursementAccount?.errors || reimbursementAccount?.isSavingCorpayOnboardingCompanyFields || !reimbursementAccount?.isSuccess) {
            return;
        }

        // We need to check value of local isSubmittingRef because on initial render reimbursementAccount?.isSuccess is still true after submitting the previous step
        if (reimbursementAccount?.isSuccess && isSubmittingRef.current) {
            isSubmittingRef.current = false;
            onSubmit();
            clearReimbursementAccountSaveCorpayOnboardingCompanyDetails();
        }

        return () => {
            clearReimbursementAccountSaveCorpayOnboardingCompanyDetails();
        };
    }, [reimbursementAccount?.errors, reimbursementAccount?.isSavingCorpayOnboardingCompanyFields, reimbursementAccount?.isSuccess, onSubmit]);

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo, goToTheLastStep} = useSubStep({bodyContent, startFrom, onFinished: submit});

    const handleBackButtonPress = () => {
        clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
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
            wrapperID="BusinessInfo"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('businessInfoStep.businessInfoTitle')}
            stepNames={stepNames}
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

export default BusinessInfo;
