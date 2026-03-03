import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import Navigation from '@libs/Navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {getBankInfoStepValues} from '@pages/ReimbursementAccount/NonUSD/utils/getBankInfoStepValues';
import getInitialSubStepForBankInfoStep from '@pages/ReimbursementAccount/NonUSD/utils/getInitialSubStepForBankInfoStep';
import getInputKeysForBankInfoStep from '@pages/ReimbursementAccount/NonUSD/utils/getInputKeysForBankInfoStep';
import {clearReimbursementAccountBankCreation, createCorpayBankAccount, getCorpayBankAccountFields} from '@userActions/BankAccounts';
import {clearErrors} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReimbursementAccountForm} from '@src/types/form/ReimbursementAccountForm';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type NonUSDPageProps from '@pages/ReimbursementAccount/NonUSD/types';
import AccountHolderDetails from './subSteps/AccountHolderDetails';
import BankAccountDetails from './subSteps/BankAccountDetails';
import Confirmation from './subSteps/Confirmation';
import type BankInfoSubStepProps from './types';

const {COUNTRY} = INPUT_IDS.ADDITIONAL_DATA;
const {PAGE_NAME, BANK_INFO_STEP} = CONST.NON_USD_BANK_ACCOUNT;
const SUB_PAGE_NAMES = BANK_INFO_STEP.SUB_PAGE_NAMES;

const pages = [
    {pageName: SUB_PAGE_NAMES.BANK_ACCOUNT_DETAILS, component: BankAccountDetails},
    {pageName: SUB_PAGE_NAMES.ACCOUNT_HOLDER_DETAILS, component: AccountHolderDetails},
    {pageName: SUB_PAGE_NAMES.CONFIRMATION, component: Confirmation},
];

function BankInfo({onBackButtonPress, onSubmit, policyID, stepNames, currentSubPage}: NonUSDPageProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [corpayFields] = useOnyx(ONYXKEYS.CORPAY_FIELDS);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const country = reimbursementAccountDraft?.[COUNTRY] ?? reimbursementAccount?.achData?.[COUNTRY] ?? '';
    const currency = policy?.outputCurrency ?? reimbursementAccountDraft?.currency ?? CONST.BBA_COUNTRY_CURRENCY_MAP[country] ?? '';
    const inputKeys = getInputKeysForBankInfoStep(corpayFields);
    const values = useMemo(() => getBankInfoStepValues(inputKeys, reimbursementAccountDraft, reimbursementAccount), [inputKeys, reimbursementAccount, reimbursementAccountDraft]);
    const startFrom = useMemo(() => getInitialSubStepForBankInfoStep(values, corpayFields), [corpayFields, values]);
    const initialTargetSubPage = pages.at(startFrom)?.pageName ?? SUB_PAGE_NAMES.BANK_ACCOUNT_DETAILS;
    const shouldRedirect = !currentSubPage;
    const isSubmittingRef = useRef(false);

    useEffect(() => {
        if (!shouldRedirect) {
            return;
        }
        Navigation.navigate(ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.BANK_INFO, subPage: initialTargetSubPage}), {forceReplace: true});
    }, [shouldRedirect, policyID, initialTargetSubPage]);

    const submit = () => {
        const {formFields, isLoading, isSuccess, ...corpayData} = corpayFields ?? {};

        isSubmittingRef.current = true;
        createCorpayBankAccount({...values, ...corpayData} as ReimbursementAccountForm, policyID);
    };

    useNetwork({
        onReconnect: () => {
            getCorpayBankAccountFields(country, currency);
        },
    });

    useEffect(() => {
        if (reimbursementAccount?.isLoading === true || !!reimbursementAccount?.errors) {
            return;
        }

        // We need to check value of local isSubmittingRef because on initial render reimbursementAccount?.isSuccess is still true after submitting the previous step
        if (reimbursementAccount?.isSuccess === true && isSubmittingRef.current) {
            isSubmittingRef.current = false;
            onSubmit();
            clearReimbursementAccountBankCreation();
        }
    }, [corpayFields?.bankCurrency, country, currency, onSubmit, reimbursementAccount?.errors, reimbursementAccount?.isLoading, reimbursementAccount?.isSuccess]);

    useEffect(() => {
        // No fetching when there is no country
        if (country === '') {
            return;
        }

        // When workspace currency is set to EUR we need to refetch if country from Step 1 doesn't match country inside fetched Corpay data
        if (currency === CONST.CURRENCY.EUR && country !== corpayFields?.bankCountry) {
            getCorpayBankAccountFields(country, currency);
            return;
        }

        // No fetching when workspace currency matches the currency inside fetched Corpay
        if (currency === corpayFields?.bankCurrency) {
            return;
        }

        getCorpayBankAccountFields(country, currency);
    }, [corpayFields?.bankCurrency, corpayFields?.bankCountry, country, currency]);

    const buildRoute = useCallback(
        (pageName: string, action?: 'edit') => ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.BANK_INFO, subPage: pageName, action}),
        [policyID],
    );

    const {CurrentPage, isEditing, currentPageName, pageIndex, nextPage, prevPage, moveTo} = useSubPage<BankInfoSubStepProps>({
        pages,
        startFrom,
        onFinished: submit,
        buildRoute,
    });

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

    if (corpayFields !== undefined && corpayFields?.isLoading === false && corpayFields?.isSuccess !== undefined && corpayFields?.isSuccess === false) {
        return <NotFoundPage />;
    }

    if (shouldRedirect) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <InteractiveStepWrapper
            wrapperID="BankInfo"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('bankAccount.bankInfo')}
            stepNames={stepNames}
            startStepIndex={1}
        >
            <CurrentPage
                isEditing={isEditing}
                onNext={nextPage}
                onMove={moveTo}
                currentPageName={currentPageName}
                corpayFields={corpayFields}
            />
        </InteractiveStepWrapper>
    );
}

export default BankInfo;
