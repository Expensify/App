import type {OnyxEntry} from 'react-native-onyx';
import {shouldDisableThread} from '@libs/ReportUtils';
import type {ReportAction} from '@src/types/onyx';

function shouldShowReplyInThreadAction({
    reportAction,
    reportID,
    isThreadReportParentAction,
    isArchivedRoom,
}: {
    reportAction: OnyxEntry<ReportAction>;
    reportID: string | undefined;
    isThreadReportParentAction: boolean;
    isArchivedRoom: boolean;
}): boolean {
    if (!reportID) {
        return false;
    }
    return !shouldDisableThread(reportAction, isThreadReportParentAction, isArchivedRoom);
}

// eslint-disable-next-line import/prefer-default-export -- named utility export per module convention
export {shouldShowReplyInThreadAction};
