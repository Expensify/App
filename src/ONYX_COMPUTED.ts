import {computeReportsByPolicy, findConciergeChatReportID} from './libs/actions/ComputedValues';
import ONYXKEYS from './ONYXKEYS';

const ONYX_COMPUTED = {
    CONCIERGE_CHAT_REPORT_ID: {
        cacheKey: 'conciergeChatReportID',
        dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.CONCIERGE_REPORT_ID],
        compute: findConciergeChatReportID,
    },
    REPORTS_BY_POLICY: {
        cacheKey: 'reportsByPolicy',
        dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.SESSION],
        compute: computeReportsByPolicy,
    },
};

export default ONYX_COMPUTED;
