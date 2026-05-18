import type {FeedbackSurveyOptionID} from '@src/CONST';

type UpdateSubscriptionAutoRenewParams = {
    autoRenew: boolean;
    disableAutoRenewReason?: FeedbackSurveyOptionID;
    disableAutoRenewAdditionalNote?: string;
};

export default UpdateSubscriptionAutoRenewParams;
