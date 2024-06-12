import type {FeedbackSurveyOptionID} from '@src/CONST';

type UpdateSubscriptionAutoRenewParams = {
    autoRenew: boolean;
    disableAutoRenewReason?: FeedbackSurveyOptionID;
};

export default UpdateSubscriptionAutoRenewParams;
