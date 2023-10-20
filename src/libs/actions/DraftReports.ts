import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Immediate indication whether the report has a draft.
 *
 * @param reportID
 * @param draft
 */
function setDraftStatusForReportID(reportID: string, draft: boolean) {
    Onyx.merge(ONYXKEYS.DRAFT_REPORT_IDS, {[reportID]: draft});
}

export default setDraftStatusForReportID;
