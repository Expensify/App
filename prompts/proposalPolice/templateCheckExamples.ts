import {Str} from 'expensify-common';

/**
 * Examples used only by the template-check call: what counts as a valid/invalid proposal,
 * and what counts as a proposal comment at all (vs. discussion/feedback that merely mentions one).
 */
export default Str.dedent(`
    PROPOSAL EXAMPLES (starts and ends at "___"):
    ___
    ## Proposal

    ### What is the root cause of that problem?
    The image processing library isn't handling memory efficiently

    ### What changes do you think we should make in order to solve the problem?
    Implement image compression before upload
    [VALID: every mandatory line is present]

    # 🔧 Proposal

    ### What is the root cause of that problem?
    Settings are buried too deep in the navigation

    ### What changes do you think we should make in order to solve the problem?
    Add a settings shortcut to the main menu

    ### What alternative solutions did you explore? (Optional)
    Considered adding a floating settings button
    [VALID: single "#" and an emoji are fine, and ALTERNATIVES is optional]

    ## Proposal

    ### What changes do you think we should make in order to solve the problem?
    Fix the login system
    [INVALID: missing the ROOT CAUSE line]
    ___

    COMMENTS THAT ARE NOT PROPOSALS AT ALL, even though they contain the word "Proposal" (starts and ends at "___"):
    ___
    Bug Report:
    The app is crashing when uploading images
    We should fix this by implementing compression
    [Does not follow the template at all]

    ## Proposal Review Status
    I've looked at the proposal above and it needs more details about the implementation.
    [Just discussing a proposal]

    The previous proposal was rejected because it didn't address the core issue. Here's my thoughts on what we should do instead...
    [Mentions a proposal but doesn't follow the template]

    ## Proposal
    I think we should fix the login system. It's not working properly right now.
    [Has a "Proposal" header but no template structure]

    ## Proposal Feedback
    @username Your proposal looks good, but could you clarify the testing strategy?
    [Commenting on someone else's proposal]
    ___
`);
