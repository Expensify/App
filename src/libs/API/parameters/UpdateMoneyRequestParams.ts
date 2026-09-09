import type {TransactionDetails} from '@libs/ReportUtils';

type UpdateMoneyRequestParams = Partial<TransactionDetails> & {
    reportID?: string;
    transactionID?: string;
    reportActionID?: string;
    policyID?: string;
    /** Used for bulk updates - JSON stringified object containing only changed fields */
    updates?: string;
    /** Distance in meters of the map route the user picked, sent when the selected alternate route changes */
    selectedRouteDistance?: number;
};

export default UpdateMoneyRequestParams;
