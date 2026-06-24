import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Subscribes to a single report by ID, falling back to the report draft if the
 * non-draft entry doesn't exist. This replaces the common pattern of calling
 * `getReportOrDraftReport(reportID, undefined, undefined, undefined, report)`
 * while avoiding a full `COLLECTION.REPORT` subscription.
 */
function useReportOrReportDraft(reportID: string | undefined) {
    const onyxID = getNonEmptyStringOnyxID(reportID);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${onyxID}`);
    const [reportDraft] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${onyxID}`);
    return report ?? reportDraft;
}

export default useReportOrReportDraft;
