import type {Report, ReportAction} from '@src/types/onyx';
import type {OnyxValueWithOfflineFeedback} from '@src/types/onyx/OnyxCommon';

type ReportAndReportAction = {
    report: OnyxValueWithOfflineFeedback<Report>;
    reportAction: ReportAction | undefined;
};

export default ReportAndReportAction;
