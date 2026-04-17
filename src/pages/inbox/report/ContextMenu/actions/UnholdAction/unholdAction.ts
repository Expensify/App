import type {OnyxEntry} from 'react-native-onyx';
import {getReportAction} from '@libs/ReportActionsUtils';
import {canHoldUnholdReportAction} from '@libs/ReportUtils';
import type {Policy, ReportAction, Report as ReportType, Transaction} from '@src/types/onyx';

function shouldShowUnholdAction({
    moneyRequestReport,
    moneyRequestAction,
    moneyRequestPolicy,
    areHoldRequirementsMet,
    iouTransaction,
    currentUserAccountID,
}: {
    moneyRequestReport: OnyxEntry<ReportType>;
    moneyRequestAction: ReportAction | undefined;
    moneyRequestPolicy: OnyxEntry<Policy>;
    areHoldRequirementsMet: boolean;
    iouTransaction: OnyxEntry<Transaction>;
    currentUserAccountID: number;
}): boolean {
    if (!areHoldRequirementsMet) {
        return false;
    }
    const holdReportAction = getReportAction(moneyRequestAction?.childReportID, `${iouTransaction?.comment?.hold ?? ''}`);
    return canHoldUnholdReportAction(moneyRequestReport, moneyRequestAction, holdReportAction, iouTransaction, moneyRequestPolicy, currentUserAccountID).canUnholdRequest;
}

// eslint-disable-next-line import/prefer-default-export -- named utility export per module convention
export {shouldShowUnholdAction};
