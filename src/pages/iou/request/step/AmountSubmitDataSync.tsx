import {validTransactionDraftsSelector} from '@selectors/TransactionDraft';
import {useLayoutEffect, useMemo} from 'react';
import type {RefObject} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import useSelfDMReport from '@hooks/useSelfDMReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getExistingTransactionID} from '@libs/IOUUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {SubmitAmountArgs} from './AmountSubmission';

type AmountSubmitData = Pick<
    SubmitAmountArgs,
    | 'delegateAccountID'
    | 'selfDMReport'
    | 'defaultExpensePolicy'
    | 'personalPolicy'
    | 'transactionDrafts'
    | 'transactionViolations'
    | 'storedTransaction'
    | 'parentReportNextStep'
    | 'policyCategories'
    | 'userBillingGracePeriodEnds'
    | 'allReportNVPs'
    | 'duplicateTransactions'
    | 'duplicateTransactionViolations'
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
    const [transactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftsSelector});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [allReportNVPs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const existingTransactionID = getExistingTransactionID(transaction?.linkedTrackedExpenseReportAction);
    const [storedTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(existingTransactionID)}`);

    const duplicateTransactionIDs = useMemo(() => (isEditing && transactionID ? [transactionID] : []), [isEditing, transactionID]);
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(duplicateTransactionIDs);

    useLayoutEffect(() => {
        // eslint-disable-next-line no-param-reassign
        submitDataRef.current = {
            delegateAccountID,
            selfDMReport,
            defaultExpensePolicy,
            personalPolicy,
            transactionDrafts,
            transactionViolations,
            storedTransaction,
            parentReportNextStep,
            policyCategories,
            userBillingGracePeriodEnds,
            allReportNVPs,
            duplicateTransactions,
            duplicateTransactionViolations,
        };
    }, [
        submitDataRef,
        delegateAccountID,
        selfDMReport,
        defaultExpensePolicy,
        personalPolicy,
        transactionDrafts,
        transactionViolations,
        storedTransaction,
        parentReportNextStep,
        policyCategories,
        userBillingGracePeriodEnds,
        allReportNVPs,
        duplicateTransactions,
        duplicateTransactionViolations,
    ]);

    return null;
}

export default AmountSubmitDataSync;
export type {AmountSubmitData};
