import type {OnyxEntry} from 'react-native-onyx';
import {canFlagReportAction} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

function shouldShowFlagAsOffensiveAction({
    reportAction,
    isArchivedRoom,
    isChronosReport,
    reportID,
}: {
    reportAction: OnyxEntry<ReportAction>;
    isArchivedRoom: boolean;
    isChronosReport: boolean;
    reportID: string | undefined;
}): boolean {
    return canFlagReportAction(reportAction, reportID) && !isArchivedRoom && !isChronosReport && reportAction?.actorAccountID !== CONST.ACCOUNT_ID.CONCIERGE;
}

// eslint-disable-next-line import/prefer-default-export -- named utility export per module convention
export {shouldShowFlagAsOffensiveAction};
