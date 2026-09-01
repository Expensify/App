import type {SearchSortBy, SortOrder} from '@components/Search/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {resolveTransactionCardFields} from '@libs/CardUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getActionErrorsByTransaction, getTransactionSortValue, isSortableColumnName} from '@libs/ReportUtils';
import type {SortableColumnName} from '@libs/ReportUtils';
import {compareValues} from '@libs/SearchUIUtils';
import {transactionHasRBR} from '@libs/TransactionPreviewUtils';
import {getVisibleTransactionViolations} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {StableReport} from '@src/selectors/Report';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {personalDetailsLoginSelector} from '@selectors/PersonalDetails';
import {useState} from 'react';

type TransactionWithOptionalHighlight = OnyxTypes.Transaction & {
    /** Whether the transaction should be highlighted, when it is added to the report */
    shouldBeHighlighted?: boolean;
};

const EMPTY_VIOLATIONS: OnyxTypes.TransactionViolations = [];

/**
 * Looks up violations from the bulk collection and filters them via `getVisibleTransactionViolations`.
 * Returns the stable EMPTY_VIOLATIONS reference for the common no-violations case so the row's prop
 * identity stays stable across FlashList recycles.
 */
function filterTransactionViolations(
    transaction: TransactionWithOptionalHighlight,
    allViolations: Record<string, OnyxTypes.TransactionViolations | undefined> | undefined,
    email: string,
    accountID: number,
    report: OnyxTypes.Report,
    ownerLogin: string | undefined,
    policy: OnyxTypes.Policy | undefined,
): OnyxTypes.TransactionViolations {
    if (!allViolations) {
        return EMPTY_VIOLATIONS;
    }
    const raw = allViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`];
    if (!raw?.length) {
        return EMPTY_VIOLATIONS;
    }
    const filtered = getVisibleTransactionViolations(transaction, raw, email, accountID, report, ownerLogin, policy);
    return filtered.length === 0 ? EMPTY_VIOLATIONS : filtered;
}

type SortConfig = {
    sortBy: SortableColumnName;
    sortOrder: SortOrder;
};

type UseMoneyRequestReportSortedTransactionsParams = {
    /** The money request report containing the transactions */
    report: StableReport;

    /** The workspace to which the report belongs */
    policy: OnyxTypes.Policy | undefined;

    /** List of transactions belonging to one report */
    transactions: OnyxTypes.Transaction[];

    /** Report actions of the report, used to resolve per-transaction thread report IDs and RBR errors */
    reportActions: OnyxTypes.ReportAction[];

    /** List of transactions that arrived when the report was open — these rows get highlighted */
    newTransactions: OnyxTypes.Transaction[];

    /** Categories of the report's policy, used for sorting by category */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Tag lists of the report's policy, used for sorting by tag */
    policyTagLists: OnyxEntry<OnyxTypes.PolicyTagLists>;
};

type UseMoneyRequestReportSortedTransactionsResult = {
    /** The column the table is currently sorted by */
    sortBy: SortableColumnName;

    /** The current sort direction */
    sortOrder: SortOrder;

    /** Column-header sort handler; ignores non-sortable columns */
    onSortPress: (selectedSortBy: SearchSortBy, selectedSortOrder: SortOrder) => void;

    /** Transactions sorted by the current column/direction, RBR-flagged rows first on the default sort */
    sortedTransactions: TransactionWithOptionalHighlight[];

    /** `sortedTransactions` with card fields resolved from the card list — the array the view renders */
    resolvedTransactions: TransactionWithOptionalHighlight[];

    /** IDs of the transactions that arrived while the report was open */
    highlightedTransactionIDs: Set<string>;

    /** transactionID → transaction-thread report ID, so each row can pass it to the RBR */
    transactionThreadReportIDByTransactionID: Map<string, string>;

    /** transactionID → visible violations, with a stable empty reference for the no-violations case */
    violationsByTransactionID: Map<string, OnyxTypes.TransactionViolations>;
};

/**
 * Owns the transaction table's sort state and derives the sorted/resolved transaction arrays plus the
 * per-transaction lookup maps (thread report IDs, violations) the rows consume.
 *
 * This chain lives in its own hook (rather than inline in the component) so React Compiler can memoize it:
 * in the component body the Map/Set building interleaves with other hook calls, which puts the intermediate
 * containers' mutable ranges across hook boundaries and makes the whole chain ineligible for a reactive scope.
 */
function useMoneyRequestReportSortedTransactions({
    report,
    policy,
    transactions,
    reportActions,
    newTransactions,
    policyCategories,
    policyTagLists,
}: UseMoneyRequestReportSortedTransactionsParams): UseMoneyRequestReportSortedTransactionsResult {
    const {translate, localeCompare} = useLocalize();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const [ownerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(report?.ownerAccountID)});
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
        sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
    });

    const {sortBy, sortOrder} = sortConfig;
    const isDefaultSort = sortBy === CONST.SEARCH.TABLE_COLUMNS.DATE && sortOrder === CONST.SEARCH.SORT_ORDER.ASC;

    const onSortPress = (selectedSortBy: SearchSortBy, selectedSortOrder: SortOrder) => {
        if (!isSortableColumnName(selectedSortBy)) {
            return;
        }
        setSortConfig((prevState) => ({...prevState, sortBy: selectedSortBy, sortOrder: selectedSortOrder}));
    };

    // In a single pass over reportActions, build:
    // - reportActionsMap: keyed by reportActionID for transactionHasRBR.
    // - transactionThreadReportIDByTransactionID: transactionID → transaction-thread report ID, so each row can pass it
    //   to the RBR, letting rows without RBR content early-return instead of mounting the heavy RBR inner (6 Onyx
    //   subscriptions). Without this, the per-row alternative would re-scan every report action (O(transactions × actions)).
    const reportActionsMap: Record<string, OnyxTypes.ReportAction> = {};
    const transactionThreadReportIDByTransactionID = new Map<string, string>();
    for (const action of reportActions) {
        reportActionsMap[action.reportActionID] = action;
        if (isMoneyRequestAction(action)) {
            const iouTransactionID = getOriginalMessage(action)?.IOUTransactionID;
            // First match wins to mirror getIOUActionForTransactionID's `.find` semantics (reportActions are sorted newest→oldest).
            if (iouTransactionID && action.childReportID && !transactionThreadReportIDByTransactionID.has(iouTransactionID)) {
                transactionThreadReportIDByTransactionID.set(iouTransactionID, action.childReportID);
            }
        }
    }

    // Precompute the set of RBR-flagged transaction IDs so the default sort can float them to the top
    let rbrTransactionIDs: Set<string> | null = null;
    if (isDefaultSort && allTransactionViolations) {
        const login = currentUserDetails?.login ?? '';
        const accountID = currentUserDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID;
        // Precompute report-action errors once so each transaction's RBR check is an O(1) lookup instead of
        // re-scanning every report action (O(transactions × actions)).
        const actionErrors = getActionErrorsByTransaction(report?.reportID, reportActionsMap);
        rbrTransactionIDs = new Set<string>();
        for (const transaction of transactions) {
            const violations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`] ?? [];
            if (transactionHasRBR(transaction, violations, login, accountID, report, ownerLogin, policy, reportActionsMap, actionErrors)) {
                rbrTransactionIDs.add(transaction.transactionID);
            }
        }
    }
    const rbrIDs = rbrTransactionIDs;

    const sortedTransactions: TransactionWithOptionalHighlight[] = [...transactions].sort((a, b) => {
        // When on default sort (Date/ASC), prioritize RBR-flagged transactions
        if (rbrIDs) {
            const aHasRBR = rbrIDs.has(a.transactionID);
            const bHasRBR = rbrIDs.has(b.transactionID);
            if (aHasRBR !== bHasRBR) {
                return aHasRBR ? -1 : 1;
            }
        }
        return compareValues(
            getTransactionSortValue(a, sortBy, report, policy, policyCategories, policyTagLists),
            getTransactionSortValue(b, sortBy, report, policy, policyCategories, policyTagLists),
            sortOrder,
            sortBy,
            localeCompare,
            true,
        );
    });

    const resolvedTransactions = resolveTransactionCardFields(sortedTransactions, cardList, translate);

    const highlightedTransactionIDs = new Set(newTransactions.map(({transactionID}) => transactionID));

    const violationsByTransactionID = new Map<string, OnyxTypes.TransactionViolations>();
    const email = currentUserDetails.email ?? '';
    const accountID = currentUserDetails.accountID ?? CONST.DEFAULT_NUMBER_ID;
    for (const transaction of resolvedTransactions) {
        violationsByTransactionID.set(transaction.transactionID, filterTransactionViolations(transaction, allTransactionViolations, email, accountID, report, ownerLogin, policy));
    }

    return {
        sortBy,
        sortOrder,
        onSortPress,
        sortedTransactions,
        resolvedTransactions,
        highlightedTransactionIDs,
        transactionThreadReportIDByTransactionID,
        violationsByTransactionID,
    };
}

export default useMoneyRequestReportSortedTransactions;
export {EMPTY_VIOLATIONS};
export type {TransactionWithOptionalHighlight};
