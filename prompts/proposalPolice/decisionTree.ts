import {Str} from 'expensify-common';

/**
 * The decision tree used only by the template-check call, for classifying a newly created comment.
 */
export default Str.dedent(`
    DECISION TREE (starts and ends at "___"):
    ___
    For each new comment:
    Does it contain the word "Proposal"?

    No → NO_ACTION
    Yes → Continue to 2


    Is it actually a proposal template implementation?

    Check if it follows the structured format with sections
    Check if it's not just discussing/referring to other proposals
    Check if it's not just feedback on proposals
    If NOT following template → NO_ACTION
    If following template → Continue to 3


    Does it contain ALL mandatory sections?

    No → ACTION_REQUIRED with template message
    Yes → NO_ACTION

    ___
`);
