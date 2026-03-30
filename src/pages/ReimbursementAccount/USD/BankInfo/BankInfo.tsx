import React, {useCallback, useEffect, useRef} from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountSubmit from '@hooks/useReimbursementAccountSubmit';
import useSubPage from '@hooks/useSubPage';
import type {SubPageProps} from '@hooks/useSubPage/types';
import getPlaidOAuthReceivedRedirectURI from '@libs/getPlaidOAuthReceivedRedirectURI';
import {getBankAccountIDAsNumber} from '@libs/ReimbursementAccountUtils';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import {connectBankAccountManually, connectBankAccountWithPlaid} from '@userActions/BankAccounts';
import {hideBankAccountErrors} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import Manual from './subSteps/Manual';
import Plaid from './subSteps/Plaid';

type BankInfoProps = {
    /** Goes to the previous step */
    onBackButtonPress: () => void;

    /** Handles submit button press (URL-based navigation) */
    onSubmit?: () => void;

    /** Current Policy ID */
    policyID: string;

    /** Back to URL for preserving navigation context */
    backTo?: string;
};

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;
const PAGE_NAMES = CONST.BANK_ACCOUNT.PAGE_NAMES;
const SUB_PAGE_NAMES = CONST.BANK_ACCOUNT.BANK_INFO_STEP.SUB_PAGE_NAMES;
const receivedRedirectURI = getPlaidOAuthReceivedRedirectURI();

const manualPages = [{pageName: SUB_PAGE_NAMES.MANUAL, component: Manual}];
const plaidPages = [{pageName: SUB_PAGE_NAMES.PLAID, component: Plaid}];

function BankInfo({onBackButtonPress, onSubmit, policyID, backTo}: BankInfoProps) {
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [plaidLinkToken] = useOnyx(ONYXKEYS.PLAID_LINK_TOKEN);
    const {translate} = useLocalize();
    const markSubmitting = useReimbursementAccountSubmit(onSubmit);

    const redirectedFromPlaidToManualRef = useRef(false);
    const values = getSubStepValues(BANK_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount ?? {});

    let setupType = reimbursementAccount?.achData?.subStep ?? '';

    const shouldReinitializePlaidLink = plaidLinkToken && receivedRedirectURI && setupType !== CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL;
    if (shouldReinitializePlaidLink) {
        setupType = CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID;
    }

    const bankAccountID = getBankAccountIDAsNumber(reimbursementAccount?.achData);
    const submit = (submitData: unknown) => {
        const data = submitData as ReimbursementAccountForm;
        if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL) {
            connectBankAccountManually(
                bankAccountID,
                {
                    [BANK_INFO_STEP_KEYS.ROUTING_NUMBER]: data[BANK_INFO_STEP_KEYS.ROUTING_NUMBER] ?? '',
                    [BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]: data[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER] ?? '',
                    [BANK_INFO_STEP_KEYS.BANK_NAME]: data[BANK_INFO_STEP_KEYS.BANK_NAME] ?? values?.bankName ?? '',
                    [BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID]: data[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID] ?? values?.plaidAccountID,
                    [BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN]: data[BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN] ?? values?.plaidAccessToken ?? '',
                    [BANK_INFO_STEP_KEYS.PLAID_MASK]: data[BANK_INFO_STEP_KEYS.PLAID_MASK] ?? values?.mask ?? '',
                    [BANK_INFO_STEP_KEYS.IS_SAVINGS]: data[BANK_INFO_STEP_KEYS.IS_SAVINGS] ?? false,
                },
                policyID,
            );
        } else if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
            connectBankAccountWithPlaid(
                bankAccountID,
                {
                    [BANK_INFO_STEP_KEYS.ROUTING_NUMBER]: data[BANK_INFO_STEP_KEYS.ROUTING_NUMBER] ?? '',
                    [BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]: data[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER] ?? '',
                    [BANK_INFO_STEP_KEYS.BANK_NAME]: data[BANK_INFO_STEP_KEYS.BANK_NAME] ?? '',
                    [BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID]: data[BANK_INFO_STEP_KEYS.PLAID_ACCOUNT_ID] ?? '',
                    [BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN]: data[BANK_INFO_STEP_KEYS.PLAID_ACCESS_TOKEN] ?? '',
                    [BANK_INFO_STEP_KEYS.PLAID_MASK]: data[BANK_INFO_STEP_KEYS.PLAID_MASK] ?? '',
                    [BANK_INFO_STEP_KEYS.IS_SAVINGS]: data[BANK_INFO_STEP_KEYS.IS_SAVINGS] ?? false,
                },
                policyID,
            );
        }
        markSubmitting();
    };

    const pages = setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID ? plaidPages : manualPages;

    const buildRoute = useCallback(
        (pageName: string, action?: 'edit') => ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({policyID, page: PAGE_NAMES.BANK_ACCOUNT, subPage: pageName, action, backTo}),
        [policyID, backTo],
    );

    const {CurrentPage, isEditing, pageIndex, nextPage, prevPage, moveTo} = useSubPage<SubPageProps>({pages, startFrom: 0, onFinished: submit, buildRoute});

    // Some services user connects to via Plaid return dummy account numbers and routing numbers e.g. Chase
    // In this case we need to redirect user to manual flow to enter real account number and routing number
    // and we need to do it only once so redirectedFromPlaidToManual flag is used
    useEffect(() => {
        if (redirectedFromPlaidToManualRef.current) {
            return;
        }
        if (setupType === CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL && values.bankName !== '') {
            redirectedFromPlaidToManualRef.current = true;
        }
    }, [setupType, values.bankName]);

    const handleBackButtonPress = () => {
        if (pageIndex === 0) {
            onBackButtonPress();
            hideBankAccountErrors();
        } else {
            prevPage();
        }
    };

    return (
        <InteractiveStepWrapper
            wrapperID="BankInfo"
            shouldEnablePickerAvoiding={false}
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('bankAccount.bankInfo')}
            startStepIndex={1}
            stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
        >
            <CurrentPage
                isEditing={isEditing}
                onNext={nextPage}
                onMove={moveTo}
            />
        </InteractiveStepWrapper>
    );
}

export default BankInfo;
