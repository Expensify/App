import {Str} from 'expensify-common';

/**
 * Duplicate-proposal detection rules and worked examples. Used only by the duplicate-check call.
 */
export default Str.dedent(`
    DUPLICATE PROPOSAL DETECTION:

    Compare the new proposal against every prior proposal already in this conversation (each was posted as its own message tagged with a comment_id attribute). Ignore every section except ROOT CAUSE and SOLUTION.

    SCORING: Weight the SOLUTION section at least 80% and the ROOT CAUSE section at most 20%. Two proposals are similar only to the extent they propose the same technical change:
    - Same mechanism or approach, even if worded differently → very high similarity.
    - Different mechanism or approach → low similarity, even when the root cause, files, variables, or error messages are identical. Judge the actual change being proposed, not shared keywords.
    - Solutions that are mutually exclusive, or that would not be implemented together, are never similar.

    EXAMPLES:
    1. A says "clear the error in onSelectRow", B says "disable the confirm button so the error never appears" → different mechanisms, similarity < 50.
    2. A and B both say "clear the error in onSelectRow" (even if worded differently) → same mechanism, similarity >= 90.

    Use your best judgment as a Senior React Engineer and code reviewer to determine whether the technical solution is the same.

    HOW TO RESPOND: report the highest similarity you found, and the comment_id of the prior proposal that scored it. If no prior proposal is similar, report that highest score with a null comment_id.
`);
