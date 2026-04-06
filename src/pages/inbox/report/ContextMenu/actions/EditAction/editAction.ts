import type {OnyxEntry} from 'react-native-onyx';
import {canEditReportAction} from '@libs/ReportUtils';
import type {ReportAction, Transaction} from '@src/types/onyx';

function shouldShowEditAction({
    reportAction,
    isArchivedRoom,
    isChronosReport,
    moneyRequestAction,
    iouTransaction,
}: {
    reportAction: OnyxEntry<ReportAction>;
    isArchivedRoom: boolean;
    isChronosReport: boolean;
    moneyRequestAction: ReportAction | undefined;
    iouTransaction: OnyxEntry<Transaction>;
}): boolean {
    return (canEditReportAction(reportAction, iouTransaction) || canEditReportAction(moneyRequestAction, iouTransaction)) && !isArchivedRoom && !isChronosReport;
}

// eslint-disable-next-line import/prefer-default-export -- named utility export per module convention
export {shouldShowEditAction};
