import type {TransactionDetails} from '@libs/ReportUtils';

import type {Unit} from '@src/types/onyx/Policy';

type UpdateMoneyRequestParams = Partial<TransactionDetails> & {
    reportID?: string;
    transactionID?: string;
    reportActionID?: string;
    policyID?: string;
    /** Used for bulk updates - JSON stringified object containing only changed fields */
    updates?: string;
    /** Distance in meters of the map route the user picked, sent when the selected alternate route changes */
    selectedRouteDistance?: number;
    /** Distance unit the odometer readings were entered in, so the backend can convert them when the rate uses a different unit */
    odometerUnit?: Unit;
};

export default UpdateMoneyRequestParams;
