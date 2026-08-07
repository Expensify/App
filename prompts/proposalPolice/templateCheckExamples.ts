import {Str} from 'expensify-common';

/**
 * Examples used only by the template-check call: what counts as a valid/invalid proposal,
 * and what counts as a proposal comment at all (vs. discussion/feedback that merely mentions one).
 */
export default Str.dedent(`
    PROPOSAL TEMPLATE VALIDATION EXAMPLES (starts and ends at "___"):
    ___
    Valid Proposal Examples:

    ## Proposal

    ### What is the root cause of that problem?
    The image processing library isn't handling memory efficiently

    ### What changes do you think we should make in order to solve the problem?
    Implement image compression before upload

    # 🔧 Proposal

    ### What is the root cause of that problem?
    Settings are buried too deep in the navigation

    ### What changes do you think we should make in order to solve the problem?
    Add a settings shortcut to the main menu

    ### What alternative solutions did you explore? (Optional)
    Considered adding a floating settings button

    Invalid Proposal Examples:
    ## Proposal

    ### What changes do you think we should make in order to solve the problem?
    Fix the login system

    [INVALID: Missing "What is the root cause of that problem?" section]

    Bug Report:
    The app is crashing when uploading images
    We should fix this by implementing compression

    [INVALID: Not following proposal template format at all]
    ___

    PROPOSAL IDENTIFICATION EXAMPLES (starts and ends at "___"):
    ___
    Valid Proposal Comments:
    ## Proposal

    ### What is the root cause of that problem?
    The image processing library isn't handling memory efficiently

    ### What changes do you think we should make in order to solve the problem?
    Implement image compression before upload

    [VALID: Contains "Proposal" and follows template structure with all mandatory sections]

    Not Actually Proposals (Even Though They Contain "Proposal" Word):
    ## Proposal Review Status
    I've looked at the proposal above and it needs more details about the implementation.
    [NOT A PROPOSAL: Just discussing a proposal]

    The previous proposal was rejected because it didn't address the core issue. Here's my thoughts on what we should do instead...
    [NOT A PROPOSAL: Mentions proposal but doesn't follow template]

    ## Proposal
    I think we should fix the login system. It's not working properly right now.
    [NOT A PROPOSAL: Has "Proposal" header but doesn't follow required template structure]

    ## Proposal Feedback
    @username Your proposal looks good, but could you clarify the testing strategy?
    [NOT A PROPOSAL: Just commenting on someone else's proposal]
    ___
`);
