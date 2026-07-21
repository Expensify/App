import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import useSelfDMReport from '@hooks/useSelfDMReport';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {SubmitAmountArgs} from '@libs/IOUAmountSubmission';
import {getExistingTransactionID} from '@libs/IOUUtils';
import {isMoneyRequestReport} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {RefObject} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import {isDraftReportSelector} from '@selectors/Report';
import {validTransactionDraftsSelector} from '@selectors/TransactionDraft';
import {useLayoutEffect} from 'react';

type AmountSubmitData = Pick<
    SubmitAmountArgs,
    | 'delegateAccountID'
    | 'isDraftChatReport'
    | 'selfDMReport'
    | 'defaultExpensePolicy'
    | 'personalPolicy'
    | 'allPersonalDetails'
    | 'allReports'
    | 'allReportDrafts'
    | 'allReportNVPs'
    | 'transactionDrafts'
    | 'transactionViolations'
    | 'storedTransaction'
    | 'parentReportNextStep'
    | 'policyCategories'
    | 'userBillingGracePeriodEnds'
    | 'duplicateTransactions'
    | 'duplicateTransactionViolations'
    | 'reportAttributesDerivedValue'
    | 'betas'
    | 'betaConfiguration'
    | 'quickAction'
    | 'onboarding'
    | 'introSelected'
    | 'recentWaypoints'
    | 'policyRecentlyUsedCurrencies'
    | 'amountOwed'
    | 'ownerBillingGracePeriodEnd'
    | 'conciergeReportID'
>;

type AmountSubmitDataSyncProps = {
    /** The report the amount step is operating on */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The transaction being created or edited */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** The transaction ID from the route */
    transactionID: string;

    /** The resolved policy ID (track-expense moving policy or report policy) */
    policyID: string | undefined;

    /** Whether the amount step is in edit mode */
    isEditing: boolean;

    /** Ref the latest submit-only data is written into; read by the screen's submit handler at click time */
    submitDataRef: RefObject<AmountSubmitData | null>;
};

/** Owns IOURequestStepAmount's submit-only Onyx subs and syncs the latest snapshot into submitDataRef; renders null. */
function AmountSubmitDataSync({report, transaction, transactionID, policyID, isEditing, submitDataRef}: AmountSubmitDataSyncProps) {
    const delegateAccountID = useDelegateAccountID();
    const selfDMReport = useSelfDMReport();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const personalPolicy = usePersonalPolicy();
    const [allPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportDrafts] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT);
    const [allReportNVPs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [transactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftsSelector});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const existingTransactionID = getExistingTransactionID(transaction?.linkedTrackedExpenseReportAction);
    const [storedTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(existingTransactionID)}`);
    const reportIDToCheck = isMoneyRequestReport(report) ? report?.chatReportID : report?.reportID;
    const [isDraftChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportIDToCheck}`, {selector: isDraftReportSelector});
    const [reportAttributesDerivedValue] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [betaConfiguration] = useOnyx(ONYXKEYS.BETA_CONFIGURATION);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const duplicateTransactionIDs = isEditing && transactionID ? [transactionID] : [];
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(duplicateTransactionIDs);

    useLayoutEffect(() => {
        // Mutating the parent-owned ref is intentional: the screen's submit handler reads the latest snapshot at click time
        // without re-rendering. useLayoutEffect (not useEffect) ensures the write lands before paint, so a fast submit cannot read stale data.
        // eslint-disable-next-line no-param-reassign
        submitDataRef.current = {
            delegateAccountID,
            isDraftChatReport,
            selfDMReport,
            defaultExpensePolicy,
            personalPolicy,
            allPersonalDetails,
            allReports,
            allReportDrafts,
            allReportNVPs,
            transactionDrafts,
            transactionViolations,
            storedTransaction,
            parentReportNextStep,
            policyCategories,
            userBillingGracePeriodEnds,
            duplicateTransactions,
            duplicateTransactionViolations,
            reportAttributesDerivedValue,
            betas,
            betaConfiguration,
            quickAction,
            onboarding,
            introSelected,
            recentWaypoints,
            policyRecentlyUsedCurrencies,
            amountOwed,
            ownerBillingGracePeriodEnd,
            conciergeReportID,
        };
    }, [
        submitDataRef,
        delegateAccountID,
        isDraftChatReport,
        selfDMReport,
        defaultExpensePolicy,
        personalPolicy,
        allPersonalDetails,
        allReports,
        allReportDrafts,
        allReportNVPs,
        transactionDrafts,
        transactionViolations,
        storedTransaction,
        parentReportNextStep,
        policyCategories,
        userBillingGracePeriodEnds,
        duplicateTransactions,
        duplicateTransactionViolations,
        reportAttributesDerivedValue,
        betas,
        betaConfiguration,
        quickAction,
        onboarding,
        introSelected,
        recentWaypoints,
        policyRecentlyUsedCurrencies,
        amountOwed,
        ownerBillingGracePeriodEnd,
        conciergeReportID,
    ]);

    return null;
}

export default AmountSubmitDataSync;
export type {AmountSubmitData};
