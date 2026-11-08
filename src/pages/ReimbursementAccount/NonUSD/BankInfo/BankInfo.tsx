import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';

import Navigation from '@libs/Navigation/Navigation';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import type NonUSDPageProps from '@pages/ReimbursementAccount/NonUSD/types';
import {getBankInfoStepValues} from '@pages/ReimbursementAccount/NonUSD/utils/getBankInfoStepValues';
import getCurrencyForNonUSDBankAccount from '@pages/ReimbursementAccount/NonUSD/utils/getCurrencyForNonUSDBankAccount';
import getInitialSubStepForBankInfoStep from '@pages/ReimbursementAccount/NonUSD/utils/getInitialSubStepForBankInfoStep';
import getInputKeysForBankInfoStep from '@pages/ReimbursementAccount/NonUSD/utils/getInputKeysForBankInfoStep';

import {clearReimbursementAccountBankCreation, createCorpayBankAccount, getCorpayBankAccountFields, hideBankAccountErrors} from '@userActions/BankAccounts';
import {clearErrors} from '@userActions/FormActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReimbursementAccountForm} from '@src/types/form/ReimbursementAccountForm';

import React, {useEffect, useRef} from 'react';

import type BankInfoSubStepProps from './types';

import AccountHolderDetails from './subSteps/AccountHolderDetails';
import BankAccountDetails from './subSteps/BankAccountDetails';
import Confirmation from './subSteps/Confirmation';

const {PAGE_NAME, BANK_INFO_STEP} = CONST.NON_USD_BANK_ACCOUNT;
const SUB_PAGE_NAMES = BANK_INFO_STEP.SUB_PAGE_NAMES;

const pages = [
    {pageName: SUB_PAGE_NAMES.BANK_ACCOUNT_DETAILS, component: BankAccountDetails},
    {pageName: SUB_PAGE_NAMES.ACCOUNT_HOLDER_DETAILS, component: AccountHolderDetails},
    {pageName: SUB_PAGE_NAMES.CONFIRMATION, component: Confirmation},
];

function BankInfo({onBackButtonPress, onSubmit, policyID, stepNames, backTo}: NonUSDPageProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [corpayFields] = useOnyx(ONYXKEYS.CORPAY_FIELDS);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const {country, currency} = getCurrencyForNonUSDBankAccount(policy, reimbursementAccountDraft, reimbursementAccount);
    const inputKeys = getInputKeysForBankInfoStep(corpayFields);
    const values = getBankInfoStepValues(inputKeys, reimbursementAccountDraft, reimbursementAccount);
    const startFrom = getInitialSubStepForBankInfoStep(values, corpayFields);
    const isSubmittingRef = useRef(false);

    const submit = () => {
        // Corpay has no endpoint to update bank account details, so the account is created exactly once per
        // workspace and `achData.created` marks it as done. Sending another create afterwards only makes the
        // server reject the duplicate, and that rejection replaces the message already shown above Confirm -
        // which is why a different error appeared on the next Confirm (for example after a network reconnect).
        // Treat an existing account as this step being finished and continue the flow instead.
        if (reimbursementAccount?.achData?.bankAccountID && reimbursementAccount?.achData?.created) {
            onSubmit();
            return;
        }

        // Never stack a second create on top of one that is still in flight, so repeated taps can't race.
        if (reimbursementAccount?.isCreateCorpayBankAccount === true) {
            return;
        }

        const {formFields, isLoading, isSuccess, ...corpayData} = corpayFields ?? {};

        isSubmittingRef.current = true;
        createCorpayBankAccount({...values, ...corpayData} as ReimbursementAccountForm, policyID);
    };

    useNetwork({
        onReconnect: () => {
            // Refetch the Corpay field schema on reconnect only when it is missing or doesn't match the country
            // and currency the flow is using. Refetching unconditionally reset CORPAY_FIELDS to its loading state
            // in the middle of an in-progress setup, re-rendering the confirmation sub step for no reason.
            if (corpayFields?.isSuccess === true && corpayFields?.bankCountry === country && corpayFields?.bankCurrency === currency) {
                return;
            }
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

    const buildRoute = (pageName: string, action?: 'edit') => ROUTES.BANK_ACCOUNT_NON_USD_SETUP.getRoute({policyID, page: PAGE_NAME.BANK_INFO, subPage: pageName, action, backTo});

    const {CurrentPage, isEditing, currentPageName, pageIndex, nextPage, prevPage, moveTo, isRedirecting} = useSubPage<BankInfoSubStepProps>({
        pages,
        startFrom,
        onFinished: submit,
        buildRoute,
    });

    const handleBackButtonPress = () => {
        clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        // A failed Confirm stores its message on the reimbursement account itself and the confirmation sub step
        // renders whichever message is there, so leaving the step makes that message stale. Clear it here
        // instead of showing the previous step's server error again on the next visit.
        hideBankAccountErrors();
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

    if (isRedirecting) {
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
