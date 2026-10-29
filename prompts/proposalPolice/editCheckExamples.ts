import {Str} from 'expensify-common';

/**
 * Examples and classification rules used only by the edit-check call, for classifying an edit
 * to a proposal comment as MINOR (no action) or SUBSTANTIAL (flag the edit).
 */
export default Str.dedent(`
    CHANGES CLASSIFICATION: judge an edit ONLY by what it does to the ROOT CAUSE and SOLUTION sections.

    - MINOR: fixing typos, or adding permalinks, videos, screenshots, emojis, or the ALTERNATIVES section, without considerably changing the ROOT CAUSE or SOLUTION text.
    - SUBSTANTIAL: the edit names a different ROOT CAUSE, or considerably changes the SOLUTION.

    EDIT CLASSIFICATION EXAMPLES (starts and ends at "___"):
    ___
    Original:
    ## Proposal

    ### What is the root cause of that problem?
    Memory management issues during image upload

    ### What changes do you think we should make in order to solve the problem?
    Implement better memory handling during uploads

    Edited (MINOR):
    ## 📸 Proposal

    ### What is the root cause of that problem?
    Memory management issues during image upload

    ### What changes do you think we should make in order to solve the problem?
    Implement better memory handling during uploads

    ### What alternative solutions did you explore? (Optional)
    We could also consider using a third-party upload service
    [MINOR: Added an emoji and the ALTERNATIVES section without changing ROOT CAUSE or SOLUTION]

    Original:
    ## Proposal

    ### What is the root cause of that problem?
    Settings are buried in submenus

    ### What changes do you think we should make in order to solve the problem?
    Move settings to main navigation

    Edited (SUBSTANTIAL):
    ## Proposal

    ### What is the root cause of that problem?
    After analysis, the real issue is that users expect settings in the profile page

    ### What changes do you think we should make in order to solve the problem?
    Redesign the profile page to include settings section and add clear navigation paths
    [SUBSTANTIAL: Changed both the ROOT CAUSE and the SOLUTION]
    ___
`);
