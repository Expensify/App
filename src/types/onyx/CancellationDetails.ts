import type {CancellationType, FeedbackSurveyOptionID} from '@src/CONST';

import type * as OnyxCommon from './OnyxCommon';
import type PrivateSubscription from './PrivateSubscription';

/** Cancellation details model */
type CancellationDetails = {
    cancellationDate?: string;
    cancellationReason: FeedbackSurveyOptionID;

    /** Cancellation type (manual/automatic/none) */
    cancellationType: CancellationType;

    note: string;
    requestDate: string;

    /** Canceled subscription object */
    subscription: PrivateSubscription;

    errors?: OnyxCommon.Errors;
};

export default CancellationDetails;
