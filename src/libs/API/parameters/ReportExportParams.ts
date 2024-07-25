import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type ReportExportParams = {
    reportIDList: string;
    connectionName: ValueOf<typeof CONST.POLICY.CONNECTIONS.NAME>;
    type: 'MANUAL';
    /**
     * Stringified JSON object with type of following structure:
     * {
     *   [reportID]: optimisticReportActionID;
     * }>
     */
    optimisticReportActions: string;
};

export default ReportExportParams;
