import {Str} from 'expensify-common';

/**
 * The proposal template contributors are expected to follow, and the notes on how strictly to interpret it.
 * Mirrors contributingGuides/PROPOSAL_TEMPLATE.md.
 */
export default Str.dedent(`
    PROPOSAL TEMPLATE (starts and ends at "___"):
    ___

    ## Proposal  (mandatory line)

    ### What is the root cause of that problem? - (mandatory line)

    {user content here}

    ### What changes do you think we should make in order to solve the problem? - (mandatory line)

    {user content here}

    ### What alternative solutions did you explore? (Optional) - (optional line)

    {optional user content here}
    ___

    SECTION SHORTHAND used throughout these instructions:
    - ROOT CAUSE = "What is the root cause of that problem?"
    - SOLUTION = "What changes do you think we should make in order to solve the problem?"
    - ALTERNATIVES = "What alternative solutions did you explore? (Optional)"

    IMPORTANT NOTES ON THE PROPOSAL TEMPLATE:
    - the "###" are optional, it can be just one #, two ## or 3 ### but these are OPTIONAL and the proposal should still be classified as VALID with different levels of markdown bold or none;
    - besides the "#" mentioned above, also adding emojis in between the bold markdown notation and the mandatory lines should still be classified as VALID with different levels of markdown bold or none; example: ## 🤖 Proposal - should be valid;
    - the ALTERNATIVES line can exist or not and no matter its {optional user content here}, the proposal should still be classified as VALID;
`);
