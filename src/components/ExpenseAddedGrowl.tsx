import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {createTransactionThreadReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import {mergeExpenseAddedGrowlTransactionIDs} from '@libs/actions/Transaction';
import Log from '@libs/Log';
import {navigateToCreatedExpense} from '@libs/Navigation/helpers/navigateAfterExpenseCreate';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {findSelfDMReportID, isInvoiceReport, isMoneyRequestReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import type {Dispatch, SetStateAction} from 'react';

import {useEffect, useRef, useState} from 'react';

import GrowlNotificationContent from './GrowlNotification/GrowlNotificationContent';

type ActiveGrowl = {
    /** ID of the transaction the growl was raised for */
    transactionID: string;

    /** Search data type the growl belongs to (expense, invoice, etc.) */
    dataType: SearchDataTypes;

    /** Identifies each growl instance so a stale slide-out dismissal can't clear a newer growl */
    nonce: number;
};

type ExpenseAddedGrowlContentProps = {
    /** Transaction to read for the growl: the active growl's transaction, or the latest pending signal ID */
    transactionID: string;

    /** Pending expense-added notifications, keyed by transaction ID with its search data type as the value */
    signal: Record<string, SearchDataTypes> | undefined;

    /** Currently displayed growl */
    active: ActiveGrowl | null;

    /** Setter for the active growl */
    setActive: Dispatch<SetStateAction<ActiveGrowl | null>>;
};

/**  Watches the "an expense was just added" Onyx signal and shows an "Expense added" growl with a "View" action. */
function ExpenseAddedGrowl() {
    const [active, setActive] = useState<ActiveGrowl | null>(null);
    const [signal] = useOnyx(ONYXKEYS.EXPENSE_ADDED_GROWL_TRANSACTION_IDS);
    const transactionID = active?.transactionID ?? Object.keys(signal ?? {}).at(-1);

    if (!transactionID) {
        return null;
    }

    return (
        <ExpenseAddedGrowlContent
            transactionID={transactionID}
            signal={signal}
            active={active}
            setActive={setActive}
        />
    );
}

/**
 * Reads the candidate transaction and its report/actions and renders the growl. Split out from
 * `ExpenseAddedGrowl` so these Onyx connections only exist while there is a pending signal or a visible growl -
 * the outer component is mounted for the whole app lifetime and would otherwise hold them permanently while idle.
 */
function ExpenseAddedGrowlContent({transactionID, signal, active, setActive}: ExpenseAddedGrowlContentProps) {
    const nonceRef = useRef(0);

    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const reportID = transaction?.reportID;
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    // A tracked/unreported expense's transaction.reportID is UNREPORTED_REPORT_ID, and its IOU/track action lives
    // on the self-DM report - not on transaction.reportID. Read actions from the report that actually hosts the
    // action so "View" resolves the real transaction thread (the action's childReportID) instead of fabricating
    // a mismatched optimistic one.
    const isUnreportedExpense = !reportID || reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const selfDMReportID = isUnreportedExpense ? findSelfDMReportID() : undefined;
    const hostReportID = isUnreportedExpense ? selfDMReportID : reportID;
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${hostReportID}`);
    // Only IOU/expense/invoice reports have the expense-report RHP that "View" opens. A tracked/unreported
    // (self-DM) expense lives in a chat, so it has no such report - leaving iouReportID undefined makes
    // navigateToCreatedExpense open the transaction thread directly instead of a super-wide report RHP it lacks.
    const iouReport = isMoneyRequestReport(report) || isInvoiceReport(report) ? report : undefined;
    const iouReportID = iouReport?.reportID;

    useEffect(() => {
        if (active) {
            return;
        }
        const pendingTransactionIDs = Object.keys(signal ?? {});
        // The last key is the last-created transaction: IDs are large (rand64), so they exceed the array-index
        // range and JS preserves insertion order rather than sorting them numerically ascending.
        const latestTransactionID = pendingTransactionIDs.at(-1);
        const dataType = latestTransactionID ? signal?.[latestTransactionID] : undefined;
        if (!latestTransactionID || !dataType) {
            return;
        }
        // Wait for the created expense's optimistic data to land before acting. The create's API.write is
        // usually deferred (the deferred-for-search pattern) until Search's onLayout flushes it, and the whole
        // optimistic dataset (transaction + IOU report/action + thread) is applied atomically - so the
        // transaction appearing in Onyx means "View" can resolve AND its report is known for the check below.
        if (!transaction) {
            return;
        }

        // Clear every pending ID but surface only the latest: rapid creations that pile up before this runs
        // collapse into a single growl for the newest expense.
        mergeExpenseAddedGrowlTransactionIDs(Object.fromEntries(pendingTransactionIDs.map((id) => [id, null])));

        // Suppress the growl when the user is already viewing the expense's money-request report (its
        // transaction list), where the new row is highlighted so a growl would be redundant. A tracked/self-DM
        // expense has transaction.reportID === UNREPORTED_REPORT_ID (never a report you view), so this never
        // matches for those and the growl always shows - matching "no transaction list to be in".
        if (Navigation.getTopmostReportId() === transaction.reportID) {
            return;
        }
        nonceRef.current += 1;
        setActive({transactionID: latestTransactionID, dataType, nonce: nonceRef.current});
    }, [signal, active, transaction, setActive]);

    if (!active) {
        return null;
    }

    const isInvoice = active.dataType === CONST.SEARCH.DATA_TYPES.INVOICE;

    // Materialize the transaction thread and navigate to it at press time (not show time): the thread is
    // only built if the user actually taps "View", against the freshest Onyx data, matching how every other
    // thread navigation entry point builds the thread at navigation time.
    const navigateToExpense = () => {
        const iouAction = getIOUActionForTransactionID(Object.values(reportActions ?? {}), active.transactionID);
        let threadReportID = transaction?.transactionThreadReportID ?? iouAction?.childReportID;
        if (threadReportID) {
            setOptimisticTransactionThread(threadReportID, iouReport?.reportID, iouAction?.reportActionID, iouReport?.policyID);
        } else {
            const optimisticThread = createTransactionThreadReport({
                introSelected,
                currentUserLogin: currentUserPersonalDetails?.login ?? '',
                currentUserAccountID: currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                betas,
                iouReport,
                iouReportAction: iouAction,
                transaction,
            });
            threadReportID = optimisticThread?.reportID;
        }
        if (!threadReportID) {
            Log.warn('[ExpenseAddedGrowl] Unable to resolve transaction thread reportID on View press.');
            return;
        }
        navigateToCreatedExpense({threadReportID, transactionID: active.transactionID, iouReportID});
    };

    return (
        <GrowlNotificationContent
            key={active.nonce}
            nonce={active.nonce}
            type={CONST.GROWL.SUCCESS}
            duration={CONST.GROWL.DURATION_WITH_ACTION}
            bodyText={translate(isInvoice ? 'iou.invoiceSent' : 'iou.expenseAdded')}
            action={{label: translate('common.view'), onPress: navigateToExpense}}
            onDismissed={(dismissedNonce) => setActive((prev) => (prev?.nonce === dismissedNonce ? null : prev))}
        />
    );
}

export default ExpenseAddedGrowl;
