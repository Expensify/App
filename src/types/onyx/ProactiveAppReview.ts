/** The trigger that prompted the proactive app review request */
type ProactiveAppReviewTrigger = 'smartscan' | 'submit' | 'approve' | 'card' | 'reimbursed';

/** The user's response to the proactive app review prompt */
type ProactiveAppReviewResponse = 'positive' | 'negative' | 'skip';

type ProactiveAppReview = {
    /** The trigger that prompted the review request */
    trigger?: ProactiveAppReviewTrigger;

    /** When the user was last prompted (UTC timestamp) */
    lastPrompt?: string;

    /** The user's response to the prompt */
    response?: ProactiveAppReviewResponse;

    /** The Concierge report action ID if a message was created */
    conciergeReportActionID?: string;
};

export default ProactiveAppReview;
export type {ProactiveAppReviewTrigger, ProactiveAppReviewResponse};

