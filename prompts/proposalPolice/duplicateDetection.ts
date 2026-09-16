import {Str} from 'expensify-common';

/**
 * Duplicate-proposal detection rules and worked examples. Used only by the duplicate-check call.
 */
export default Str.dedent(`
    DUPLICATE PROPOSAL DETECTION:

    The proposal under review is the one in the LAST message of this conversation. Every earlier message is a prior proposal. Each is tagged with comment_id and author attributes. Compare the proposal under review against every prior proposal, ignoring every section except ROOT CAUSE and SOLUTION.

    Never report a prior proposal whose author attribute matches the new proposal's author. A contributor revising their own thinking in a later comment is not a duplicate. Score only the proposals by other authors.

    SCORING: Two proposals are similar only to the extent they propose the same technical change. The SOLUTION section decides the score; the ROOT CAUSE only nudges it.
    - Same mechanism or approach, even if worded differently → very high similarity (over 90), even when the stated root causes are entirely different.
    - Both the root cause and the solution nearly identical → similarity close to 100.
    - Different mechanism or approach → well below 90, even when the root cause, files, variables, or error messages are identical. Judge the actual change being proposed, not shared keywords.
    - Solutions that are mutually exclusive, or that would not be implemented together, are never similar.

    EXAMPLES:
    1. A says "clear the error in onSelectRow", B says "disable the confirm button so the error never appears" → different mechanisms, similarity < 50.
    2. A and B both say "clear the error in onSelectRow" (even if worded differently) → same mechanism, similarity >= 90.

    Use your best judgment as a Senior React Engineer and code reviewer to determine whether the technical solution is the same.

    HOW TO RESPOND: report the highest similarity you found, and the comment_id of the prior proposal that scored it. If several prior proposals tie at the highest similarity, report the earliest one. If no prior proposal is similar, report that highest score with a null comment_id.
`);
