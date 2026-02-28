/** The trigger that prompted the proactive app review request */
type AppReviewTrigger = 'smartscan' | 'submit' | 'approve' | 'card' | 'reimbursed' | 'test';

/** The user's response to the proactive app review prompt */
type AppReviewResponse = 'positive' | 'negative' | 'skip';

/** Stores the state and response for the proactive app review prompt */
type AppReview = {
    /** The trigger that prompted the review request */
    trigger?: AppReviewTrigger;

    /** When the user was last prompted (UTC timestamp) */
    lastPrompt?: string;

    /** The user's response to the prompt */
    response?: AppReviewResponse;

    /** The Concierge report action ID if a message was created */
    conciergeReportActionID?: string;
};

export default AppReview;
export type {AppReviewTrigger, AppReviewResponse};
