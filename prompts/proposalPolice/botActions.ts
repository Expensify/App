import CONST from '@github/libs/CONST';

import {Str} from 'expensify-common';

/**
 * How to classify a newly created comment. Used only by the template-check call.
 */
const NEW_COMMENT_ACTIONS = Str.dedent(`
    NEW COMMENTS: Decide whether the comment is a proposal that follows the PROPOSAL TEMPLATE. User content within the sections is allowed to be anything.

    - "${CONST.ACTION_REQUIRED}" if the comment is a proposal but is missing any MANDATORY LINE.
    - "${CONST.NO_ACTION}" if every mandatory line is present, or if the comment is not a proposal at all.
`);

/**
 * How to classify an edit to a proposal comment. Used only by the edit-check call.
 */
const EDITED_COMMENT_ACTIONS = Str.dedent(`
    EDITED COMMENTS: Compare the original proposal with its latest edit.

    - "${CONST.ACTION_EDIT}" if the changes are SUBSTANTIAL.
    - "${CONST.NO_ACTION}" if the changes are MINOR.
`);

export {NEW_COMMENT_ACTIONS, EDITED_COMMENT_ACTIONS};
