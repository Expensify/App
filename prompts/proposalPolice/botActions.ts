import CONST from '@github/libs/CONST';

import {Str} from 'expensify-common';

/**
 * How to classify a comment that does not follow the proposal template. Used only by the comment-intent call.
 * Comments that do follow it never reach the model, since that is checked in code.
 */
const COMMENT_INTENTS = Str.dedent(`
    Decide what this comment is trying to do on this issue. It has already been established that it does not follow the PROPOSAL TEMPLATE.

    - "${CONST.INTENT.SPAM}" if it claims or bids for the job without offering any technical content of its own: expressions of interest, "I'd like to work on this", "assign me", references to an Upwork application, or a restatement of the issue as a plan of action with no root cause or solution.
    - "${CONST.INTENT.GENUINE_ATTEMPT}" if it makes a real technical attempt to explain the cause of the problem or propose a fix, but does not follow the template.
    - "${CONST.INTENT.NOT_AN_ATTEMPT}" for anything else: feedback on someone else's proposal, retest results, questions, reproduction notes, takeover coordination, review offers, or general discussion.

    The dividing line between the first two is technical content. A comment that offers a root cause or a concrete fix is a genuine attempt no matter how informally it is written, or how poor the English. A comment that only asserts the author will do the work is spam. Coordination about who should take over an issue or review a proposal is not a bid for the job, even when it contains no technical content.
`);

/**
 * How to classify an edit to a proposal comment. Used only by the edit-check call.
 */
const EDITED_COMMENT_ACTIONS = Str.dedent(`
    EDITED COMMENTS: Compare the original proposal with its latest edit.

    - "${CONST.ACTION_EDIT}" if the changes are SUBSTANTIAL.
    - "${CONST.NO_ACTION}" if the changes are MINOR.
`);

export {COMMENT_INTENTS, EDITED_COMMENT_ACTIONS};
