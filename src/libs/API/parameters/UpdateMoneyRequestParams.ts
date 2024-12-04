import type {TransactionDetails} from '@libs/ReportUtils';
import { Attendee } from '@src/types/onyx/IOU';

type UpdateMoneyRequestParams = Partial<TransactionDetails> & {
    reportID?: string;
    transactionID: string;
    reportActionID?: string;
    attendees: Attendee[];
};

export default UpdateMoneyRequestParams;
