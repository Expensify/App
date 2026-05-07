import type {OnyxCollection} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

type ChildTransactionInfo = {
    reportID: string | undefined;
    isSplitSource: boolean;
};

function selectChildTransactionInfo(transactions: OnyxCollection<Transaction>, originalTransactionID: string | undefined): ChildTransactionInfo[] {
    if (!originalTransactionID) {
        return [];
    }
    const result: ChildTransactionInfo[] = [];
    for (const t of Object.values(transactions ?? {})) {
        if (
            t?.comment?.originalTransactionID === originalTransactionID &&
            t?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
            t?.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID
        ) {
            result.push({reportID: t?.reportID, isSplitSource: t?.comment?.source === CONST.IOU.TYPE.SPLIT});
        }
    }
    return result;
}

function selectHasMultipleSplitChildReports(reports: OnyxCollection<Report>, childInfo: ChildTransactionInfo[] | undefined): boolean {
    if (!childInfo || childInfo.length <= 1) {
        return false;
    }
    let count = 0;
    for (const child of childInfo) {
        if (child.isSplitSource || !!reports?.[`${ONYXKEYS.COLLECTION.REPORT}${child.reportID}`]) {
            count++;
            if (count > 1) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Replaces the full-collection subscription pattern for `hasMultipleSplitChildren`.
 * Uses selectors on both TRANSACTION and REPORT collections so the consumer
 * only re-renders when the boolean result actually changes.
 */
function useHasMultipleSplitChildren(originalTransactionID: string | undefined): boolean {
    const childInfoSelector = (transactions: OnyxCollection<Transaction>) => selectChildTransactionInfo(transactions, originalTransactionID);
    const [childInfo] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: childInfoSelector,
    });

    const hasMultipleSelector = (reports: OnyxCollection<Report>) => selectHasMultipleSplitChildReports(reports, childInfo);
    const [hasMultiple] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: hasMultipleSelector,
    });

    return !!hasMultiple;
}

export default useHasMultipleSplitChildren;
