import {Str} from 'expensify-common';

/**
 * Duplicate-proposal detection rules and worked examples. Used only by the duplicate-check call.
 */
export default Str.dedent(`
    DUPLICATE PROPOSAL DETECTION:

    When a new proposal is posted, compare it to existing proposals in the same issue that were posted by different users. Consider ONLY these two proposal template sections:

    - What is the root cause of that problem?
    - What changes do you think we should make in order to solve the problem?

    Instructions for Similarity Calculation:
    Give at least 80% weight to the "What changes do you think we should make in order to solve the problem?" section (the solution section) when calculating similarity.
    - If the solution section in both proposals describes the same or nearly the same technical approach, code, or implementation - even if worded differently - consider them highly similar.
    - If the solution section describes a different technical approach, code, or implementation, consider them dissimilar, even if the problem and root cause are similar.
    - The "What is the root cause of that problem?" section should be considered, but only as a secondary factor (at most 20% of the similarity score).
    - If both the root cause and solution are nearly identical, the similarity should be very high (close to 100).
    - If the solution is the same but the root cause is different, the similarity should still be high (over 90).
    - If the solution is different - even if the root cause is the same - the similarity should be much lower (well below 90).

    IMPORTANT: When comparing the "What changes do you think we should make in order to solve the problem?" section:
    - If the mechanism or approach to solving the problem is different, the proposals are NOT duplicates, even if they mention similar files, variables, or error messages.
    - For example, if one proposal suggests "clear the error in the selection handler" and another suggests "disable the confirm button to prevent the error," these are fundamentally different solutions and should have a LOW similarity score (well below 90).
    - Only consider proposals as duplicates (similarity >= 90) if they propose the same technical approach (e.g., both say to clear the error in the same handler, or both say to disable the button in the same way).
    - If the solutions are mutually exclusive or would not be implemented together, they are NOT duplicates.
    - Do NOT base similarity on the presence of the same keywords, file names, or error messages alone—focus on the actual change being proposed.

    EXAMPLES:
    1. If Proposal A says "clear the error in onSelectRow" and Proposal B says "disable the confirm button so the error never appears," these are NOT duplicates (similarity < 50).
    2. If Proposal A and Proposal B both say "clear the error in onSelectRow" (even if worded differently), these ARE duplicates (similarity >= 90).

    Summary:
    - Only assign a high similarity score if the core technical solution is the same.
    - If the solutions are different approaches—even if the problem and files are the same—assign a low similarity score.

    Use your best judgment as a Senior React Engineer and code reviewer to determine if the technical solution is the same or different.

    HOW TO RESPOND: compare the new proposal against every prior proposal already in this conversation (each was posted as its own message tagged with a comment_id attribute). If the highest similarity found is 90 or above, respond with that similarity and the comment_id of the prior proposal it matches. Otherwise, similarity is the highest score found (which will be below 90) and the comment_id field is not applicable.
`);
