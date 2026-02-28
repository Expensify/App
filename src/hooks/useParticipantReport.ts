import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {getMoneyRequestParticipantsFromReport} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Subscribes to the specific participant report (and its chatReport) for a given
 * expense report, avoiding a full reports collection subscription.
 */
function useParticipantReport(report: OnyxEntry<Report>, currentUserAccountID: number) {
    const participantReportID = useMemo(
        () => getMoneyRequestParticipantsFromReport(report, currentUserAccountID).find((p) => !(p.accountID ?? CONST.DEFAULT_NUMBER_ID))?.reportID,
        [report, currentUserAccountID],
    );
    const [participantReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${participantReportID}`);
    const [participantChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${participantReport?.chatReportID}`);

    return {participantReport, participantChatReport};
}

export default useParticipantReport;
