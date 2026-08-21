import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type ReportExportParams = {
    reportIDList: string | string[];
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
