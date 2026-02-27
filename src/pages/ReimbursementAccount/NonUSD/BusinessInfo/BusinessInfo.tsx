import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import Navigation from '@libs/Navigation/Navigation';
import getInitialSubStepForBusinessInfoStep from '@pages/ReimbursementAccount/NonUSD/utils/getInitialSubStepForBusinessInfoStep';
import type NonUSDPageProps from '@pages/ReimbursementAccount/NonUSD/types';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import {clearReimbursementAccountSaveCorpayOnboardingCompanyDetails, getCorpayOnboardingFields, saveCorpayOnboardingCompanyDetails} from '@userActions/BankAccounts';
import {clearErrors} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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

const {PAGE_NAME, BUSINESS_INFO_STEP} = CONST.NON_USD_BANK_ACCOUNT;
const SUB_PAGE_NAMES = BUSINESS_INFO_STEP.SUB_PAGE_NAMES;

const pages = [
    {pageName: SUB_PAGE_NAMES.NAME, component: Name},
    {pageName: SUB_PAGE_NAMES.WEBSITE, component: Website},
    {pageName: SUB_PAGE_NAMES.ADDRESS, component: Address},
    {pageName: SUB_PAGE_NAMES.CONTACT_INFORMATION, component: ContactInformation},
    {pageName: SUB_PAGE_NAMES.REGISTRATION_NUMBER, component: RegistrationNumber},
    {pageName: SUB_PAGE_NAMES.TAX_ID_EIN_NUMBER, component: TaxIDEINNumber},
    {pageName: SUB_PAGE_NAMES.INCORPORATION_LOCATION, component: IncorporationLocation},
    {pageName: SUB_PAGE_NAMES.BUSINESS_TYPE, component: BusinessType},
    {pageName: SUB_PAGE_NAMES.PAYMENT_VOLUME, component: PaymentVolume},
    {pageName: SUB_PAGE_NAMES.AVERAGE_REIMBURSEMENT, component: AverageReimbursement},
    {pageName: SUB_PAGE_NAMES.CONFIRMATION, component: Confirmation},
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

function BusinessInfo({onBackButtonPress, onSubmit, policyID: policyIDProp, stepNames}: NonUSDPageProps) {
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const policyID = policyIDProp ?? reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const currency = policy?.outputCurrency ?? reimbursementAccountDraft?.currency ?? '';
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

    const buildRoute = useCallback(
        (pageName: string, action?: 'edit') => ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.BUSINESS_INFO, subPage: pageName, action}),
        [policyID],
    );

    const {CurrentPage, isEditing, currentPageName, pageIndex, nextPage, prevPage, moveTo, isRedirecting} = useSubPage({pages, startFrom, onFinished: submit, buildRoute});

    const handleBackButtonPress = () => {
        clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        if (isEditing) {
            Navigation.goBack(buildRoute(SUB_PAGE_NAMES.CONFIRMATION));
            return;
        }

        if (pageIndex === 0) {
            onBackButtonPress();
        } else {
            prevPage();
        }
    };

    if (isRedirecting) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <InteractiveStepWrapper
            wrapperID="BusinessInfo"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('businessInfoStep.businessInfoTitle')}
            stepNames={stepNames}
            startStepIndex={2}
        >
            <CurrentPage
                isEditing={isEditing}
                onNext={nextPage}
                onMove={moveTo}
                currentPageName={currentPageName}
            />
        </InteractiveStepWrapper>
    );
}

export default BusinessInfo;
