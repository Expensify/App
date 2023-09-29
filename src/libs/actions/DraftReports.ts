import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import DraftReportUtils from '../DraftReportUtils';

const draftReportUtils = DraftReportUtils.getInstance();

/**
 * Immediate indication whether the report has a draft.
 *
 * @param reportID
 * @param draft
 */
function setDraftStatusForReportID(reportID: string, draft: boolean) {
    const draftReportIDs = {...draftReportUtils.getDraftReportIDs()};

    if (draftReportIDs[reportID] && draft) {
        return;
    }

    if (draftReportIDs[reportID] && !draft) {
        delete draftReportIDs[reportID];
        Onyx.set(ONYXKEYS.DRAFT_REPORT_IDS, draftReportIDs);
    } else {
        draftReportIDs[reportID] = draft;
        Onyx.merge(ONYXKEYS.DRAFT_REPORT_IDS, {[reportID]: draft});
    }
}

export default setDraftStatusForReportID;
