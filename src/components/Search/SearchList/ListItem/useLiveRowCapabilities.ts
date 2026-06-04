// eslint-disable-next-line no-restricted-imports
import {useOnyx as originalUseOnyx} from 'react-native-onyx';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getActions, getPrimaryAction, getViolationsFromSearchData} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, SearchResults} from '@src/types/onyx';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';

type LiveRowItem = {
    action?: SearchTransactionAction;
    canPay?: boolean;
    canApprove?: boolean;
    canSubmit?: boolean;
    canChangeApprover?: boolean;
    allActions?: SearchTransactionAction[];
};

type UseLiveRowCapabilitiesParams<T> = {
    item: T;
    reportID: string | undefined;
    itemKey: string;
    snapshotData: SearchResults['data'] | undefined;
    snapshotActions: ReportAction[];
    enabled: boolean;
};

/**
 * Row-level live merge of action capabilities. Subscribes to per-report
 * actions/metadata, re-runs `getActions`, and returns either the input item
 * (unchanged reference) or a fresh copy with refreshed action + canPay/Approve/
 * Submit/ChangeApprover. The four booleans stay as primitives at the equality
 * guard so React Compiler keeps downstream consumers memoized.
 *
 * Trade-off: each mounted row opens 2 Onyx subscriptions (REPORT_ACTIONS +
 * REPORT_METADATA for its own reportID). This is intentional — it replaces the
 * screen-level collection merge that re-fired every visible row on any row tap.
 * The list is virtualized, so subscriptions track on-screen rows, not the full
 * result set. If a future very large list shows subscribe/unsubscribe churn,
 * cap active subscriptions via windowing rather than reintroducing the merge.
 */
function useLiveRowCapabilities<T extends LiveRowItem>(params: UseLiveRowCapabilitiesParams<T>): T {
    const {item, reportID, itemKey, snapshotData, snapshotActions, enabled} = params;
    const {currentSearchKey} = useSearchQueryContext();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const [liveReportActions] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportID)}`);
    const [liveReportMetadata] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${getNonEmptyStringOnyxID(reportID)}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    if (!enabled || !snapshotData) {
        return item;
    }

    const liveActionsArray = liveReportActions ? (Object.values(liveReportActions) as ReportAction[]) : snapshotActions;
    const liveAllActions = getActions(
        snapshotData,
        getViolationsFromSearchData(snapshotData),
        itemKey,
        currentSearchKey ?? CONST.SEARCH.SEARCH_KEYS.EXPENSES,
        currentUserDetails.email ?? '',
        currentUserDetails.accountID ?? CONST.DEFAULT_NUMBER_ID,
        bankAccountList,
        liveReportMetadata,
        liveActionsArray,
    );
    const liveAction = liveAllActions.length ? getPrimaryAction(liveAllActions, snapshotData, itemKey, currentUserDetails.accountID ?? CONST.DEFAULT_NUMBER_ID) : item.action;
    const liveCanPay = liveAllActions.includes(CONST.SEARCH.ACTION_TYPES.PAY);
    const liveCanApprove = liveAllActions.includes(CONST.SEARCH.ACTION_TYPES.APPROVE);
    const liveCanSubmit = liveAllActions.includes(CONST.SEARCH.ACTION_TYPES.SUBMIT);
    const liveCanChangeApprover = liveAllActions.includes(CONST.SEARCH.ACTION_TYPES.CHANGE_APPROVER);

    if (
        liveAction === item.action &&
        liveCanPay === item.canPay &&
        liveCanApprove === item.canApprove &&
        liveCanSubmit === item.canSubmit &&
        liveCanChangeApprover === item.canChangeApprover
    ) {
        return item;
    }
    return {...item, action: liveAction, canPay: liveCanPay, canApprove: liveCanApprove, canSubmit: liveCanSubmit, canChangeApprover: liveCanChangeApprover};
}

export default useLiveRowCapabilities;
