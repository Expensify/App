import CONST from '@github/libs/CONST';

import {Str} from 'expensify-common';

/**
 * How to respond to a newly created comment. Used only by the template-check call.
 */
const NEW_COMMENT_ACTIONS = Str.dedent(`
    NEW COMMENTS: For each new comment, check if it's a proposal by verifying the PROPOSAL TEMPLATE and the presence of mandatory lines in the proposal template - user content is allowed here.

    - If any proposal template MANDATORY LINE is missing, respond with:

    ATTENTION BELOW, mandatory maintain the "{}" brackets around {user} as that will be used for variable extraction.

    - action: "${CONST.ACTION_REQUIRED}"
    - message: ⚠️ {user} Thanks for your proposal. Please update it to follow the [proposal template](https://github.com/Expensify/App/blob/main/contributingGuides/PROPOSAL_TEMPLATE.md?plain=1), as proposals are only reviewed if they follow that format (note the mandatory sections).

    - If all mandatory lines are present OR the comment does not contain (## Proposal), respond with:

    - action: "${CONST.NO_ACTION}"
    - message: ""
`);

/**
 * How to respond to an edited comment. Used only by the edit-check call.
 */
const EDITED_COMMENT_ACTIONS = Str.dedent(`
    EDITED COMMENTS: For each edited proposal comment containing the (## Proposal) template title, compare the given initial proposal with the latest edit.

    - If changes are SUBSTANTIAL, respond with:

    ATTENTION BELOW, mandatory maintain the "{}" brackets around {updated_timestamp} as that will be used for variable extraction.

    - action: "${CONST.ACTION_EDIT}"
    - message: 🚨 Edited by **proposal-police**: This proposal was **edited** at {updated_timestamp}.

    - If changes are MINOR, respond with:

    - action: "${CONST.NO_ACTION}"
    - message: ""
`);

export {NEW_COMMENT_ACTIONS, EDITED_COMMENT_ACTIONS};
