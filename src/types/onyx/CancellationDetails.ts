import type {CancellationType, FeedbackSurveyOptionID} from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';
import type PrivateSubscription from './PrivateSubscription';

/** Cancellation details model */
type CancellationDetails = {
    /** Cancellation date */
    cancellationDate?: string;

    /** Cancellation reason */
    cancellationReason: FeedbackSurveyOptionID;

    /** Cancellation type (manual/automatic/none) */
    cancellationType: CancellationType;

    /** Additional note */
    note: string;

    /** Cancellation request date */
    requestDate: string;

    /** Canceled subscription object */
    subscription: PrivateSubscription;

    /** Cancellation errors */
    errors?: OnyxCommon.Errors;
};

export default CancellationDetails;
