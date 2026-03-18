/** How the user attempted to respond to the 3DS challenge - not actually used anywhere */
type Transaction3DSChallengeOutcome = 'Approve' | 'Deny';

/**
 * Record of 3DS challenges we have already responded to, indexed by transaction IDs. Using a Record for O(1) lookup
 */
type LocallyProcessed3DSChallengeReviews = Record<string, Transaction3DSChallengeOutcome>;

export default LocallyProcessed3DSChallengeReviews;
