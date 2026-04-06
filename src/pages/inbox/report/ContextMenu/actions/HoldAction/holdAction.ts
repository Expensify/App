import type {OnyxEntry} from 'react-native-onyx';
import {getReportAction} from '@libs/ReportActionsUtils';
import {canHoldUnholdReportAction} from '@libs/ReportUtils';
import type {Policy, ReportAction, Report as ReportType, Transaction} from '@src/types/onyx';

function shouldShowHoldAction({
    moneyRequestReport,
    moneyRequestAction,
    moneyRequestPolicy,
    areHoldRequirementsMet,
    iouTransaction,
}: {
    moneyRequestReport: OnyxEntry<ReportType>;
    moneyRequestAction: ReportAction | undefined;
    moneyRequestPolicy: OnyxEntry<Policy>;
    areHoldRequirementsMet: boolean;
    iouTransaction: OnyxEntry<Transaction>;
}): boolean {
    if (!areHoldRequirementsMet) {
        return false;
    }
    const holdReportAction = getReportAction(moneyRequestAction?.childReportID, `${iouTransaction?.comment?.hold ?? ''}`);
    return canHoldUnholdReportAction(moneyRequestReport, moneyRequestAction, holdReportAction, iouTransaction, moneyRequestPolicy).canHoldRequest;
}

// eslint-disable-next-line import/prefer-default-export -- named utility export per module convention
export {shouldShowHoldAction};
