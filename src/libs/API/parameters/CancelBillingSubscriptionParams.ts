import type {FeedbackSurveyOptionID} from '@src/CONST';

type CancelBillingSubscriptionParams = {
    cancellationReason: FeedbackSurveyOptionID;
    cancellationNote: string;
};

export default CancelBillingSubscriptionParams;
