import {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {canEditMoneyRequest} from '@libs/ReportUtils';
import {areRequiredFieldsEmpty} from '@libs/TransactionUtils';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxInputOrEntry, Report, ReportAction, ReportActions, Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Shows not found page when:
 * - Split bill: User is not the original actor OR transaction is incomplete
 * - Split expense: Transaction doesn't exist
 * - Money request: Action is not a money request OR user cannot edit it
 */
// eslint-disable-next-line rulesdir/no-negated-variables
const useShowNotFoundPageInIOUStep = (action: IOUAction, iouType: IOUType, reportActionID: string | undefined, report: OnyxInputOrEntry<Report>, transaction: OnyxEntry<Transaction>) => {
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isSplitBill = iouType === CONST.IOU.TYPE.SPLIT;
    const isSplitExpense = iouType === CONST.IOU.TYPE.SPLIT_EXPENSE;

    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: true});
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transaction?.reportID)}`, {canBeMissing: true});

    const reportActionsReportID = useMemo(() => {
        let actionsReportID;
        if (isEditing) {
            actionsReportID = iouType === CONST.IOU.TYPE.SPLIT ? report?.reportID : report?.parentReportID;
        }
        return actionsReportID;
    }, [isEditing, iouType, report?.reportID, report?.parentReportID]);

    const getReportActionSelector = useCallback(
        (reportActions: OnyxEntry<ReportActions>): OnyxEntry<ReportAction> => {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            return reportActions?.[`${report?.parentReportActionID || reportActionID}`];
        },
        [report?.parentReportActionID, reportActionID],
    );

    const [reportAction] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportActionsReportID}`,
        {
            canEvict: false,
            selector: getReportActionSelector,
            canBeMissing: true,
        },
        [getReportActionSelector],
    );

    // eslint-disable-next-line rulesdir/no-negated-variables
    let shouldShowNotFoundPage = false;
    const canEditSplitBill = isSplitBill && reportAction && session?.accountID === reportAction.actorAccountID && areRequiredFieldsEmpty(transaction, iouReport);
    const canEditSplitExpense = isSplitExpense && !!transaction;

    if (isEditing) {
        if (isSplitBill) {
            shouldShowNotFoundPage = !canEditSplitBill;
        } else if (isSplitExpense) {
            shouldShowNotFoundPage = !canEditSplitExpense;
        } else {
            shouldShowNotFoundPage = !isMoneyRequestAction(reportAction) || !canEditMoneyRequest(reportAction, false, iouReport, policy, transaction);
        }
    }

    return shouldShowNotFoundPage;
};

export default useShowNotFoundPageInIOUStep;
