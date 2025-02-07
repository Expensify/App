import {computeReports, findConciergeChatReportID} from './libs/actions/ComputedValues';
import ONYXKEYS from './ONYXKEYS';

const ONYX_COMPUTED = {
    CONCIERGE_CHAT_REPORT_ID: {
        cacheKey: 'conciergeChatReportID',
        dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.CONCIERGE_REPORT_ID],
        compute: findConciergeChatReportID,
    },
    REPORTS: {
        cacheKey: 'computedReports',
        dependencies: [ONYXKEYS.COLLECTION.REPORT],
        compute: computeReports,
    },
};

export default ONYX_COMPUTED;
