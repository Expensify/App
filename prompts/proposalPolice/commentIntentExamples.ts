import CONST from '@github/libs/CONST';

import {Str} from 'expensify-common';

/**
 * Worked examples for the comment-intent call: what a claim on the issue looks like with and without
 * technical content behind it, and what is ordinary discussion rather than either.
 */
export default Str.dedent(`
    EXAMPLES (each starts and ends at "___"):

    ___
    Hello, I would like to take on this issue by:
    - Carefully reproducing in staging
    - Debugging further and establishing the root-cause of the bug
    - Fixing the bug
    - Updating the needed tests if applicable

    Please see the submitted Upwork application
    ___
    ${CONST.INTENT.SPAM} - restates the issue as a plan of action. No root cause and no fix, so there is nothing here that anyone could review.

    ___
    I'm interested in working on this one, please assign me.
    ___
    ${CONST.INTENT.SPAM} - a claim on the job with no technical content.

    ___
    +1, I can do this. I have 5 years of React Native experience and have fixed similar bugs before.
    ___
    ${CONST.INTENT.SPAM} - credentials are not a proposal. Still no root cause and no fix.

    ___
    ## Proposal
    I think we should fix the login system. It's not working properly right now.
    ___
    ${CONST.INTENT.SPAM} - has a "Proposal" heading but names no cause and no change to make.

    ___
    The reason the pill doesn't show is that lastReadTime is updated optimistically in openReport before the unread marker is computed, so by the time the LHN re-renders there is nothing left marked unread. I think we should move that update into the API response handler instead.
    ___
    ${CONST.INTENT.GENUINE_ATTEMPT} - identifies a cause and a concrete change. It ignores the template, but there is real work here.

    ___
    ## Proposal

    ### What is the root cause of that problem?
    The image processing library isn't handling memory efficiently
    ___
    ${CONST.INTENT.GENUINE_ATTEMPT} - a real attempt that is missing a mandatory section.

    ___
    Sorry for bad english. The bug come from that the currency symbol is add two time in formatAmount, one in the util and one in the component. Solution is remove it from the component.
    ___
    ${CONST.INTENT.GENUINE_ATTEMPT} - poorly written but names a specific cause and a specific fix. Judge the content, never the fluency.

    ___
    ## Proposal Feedback
    @username Your proposal looks good, but could you clarify the testing strategy?
    ___
    ${CONST.INTENT.NOT_AN_ATTEMPT} - commenting on someone else's proposal.

    ___
    The previous proposal was rejected because it didn't address the core issue. Here's my thoughts on what we should do instead...
    ___
    ${CONST.INTENT.NOT_AN_ATTEMPT} - discussion about proposals.

    ___
    Retested on staging 9.1.42, still reproducible on iOS but not on web. Video attached.
    ___
    ${CONST.INTENT.NOT_AN_ATTEMPT} - retest results.

    ___
    What are the exact steps to reproduce this? I can't get the error to appear on the latest main.
    ___
    ${CONST.INTENT.NOT_AN_ATTEMPT} - a question about the issue.

    ___
    @reviewer Would you like to take over here? Or propose a solution?
    ___
    ${CONST.INTENT.NOT_AN_ATTEMPT} - coordination about transferring ownership of the issue, not a claim on the job.

    ___
    I don't have a solution yet. If you don't mind, I can take over here and review.
    ___
    ${CONST.INTENT.NOT_AN_ATTEMPT} - offering to take over or review is coordination, not a job claim.

    ___
    Bug Report:
    The app is crashing when uploading images
    We should fix this by implementing compression
    ___
    ${CONST.INTENT.NOT_AN_ATTEMPT} - a bug report rather than a claim on this job.
`);
