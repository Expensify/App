import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {getOneOnOneChatReportID} from '@selectors/OneOnOneChatReportID';
import {accountIDSelector} from '@selectors/Session';

import useOnyx from './useOnyx';

/** Returns the reportID of the 1:1 or system chat with exactly these participants. */
function useOneOnOneChatReportID(participantsChatKey: string | undefined): string | undefined {
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [reportID] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports: OnyxCollection<Report>) => (participantsChatKey ? getOneOnOneChatReportID(reports, currentUserAccountID, participantsChatKey) : undefined),
    });
    return reportID;
}

export default useOneOnOneChatReportID;
