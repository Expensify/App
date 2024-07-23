import type * as OnyxCommon from './OnyxCommon';

/** Model of additional report details */
type ReportNameValuePairs = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Whether the report is an archived room */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private_isArchived: boolean;
}>;

export default ReportNameValuePairs;
