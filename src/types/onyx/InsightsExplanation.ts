/** A preloaded answer, kept separate from chat history until Explain is clicked. */
type InsightsExplanation = {
    /** Exact request identity, checked as well as its hash to avoid reusing another context's answer. */
    jsonQuery: string;
    /** Sanitized HTML from Auth, reused unchanged when Explain is pressed. */
    response: string;
    /** UTC database timestamp at which the answer was generated. */
    createdAt: string;
};

export default InsightsExplanation;
