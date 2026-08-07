import {Str} from 'expensify-common';

/**
 * Examples and classification rules used only by the edit-check call, for classifying an edit
 * to a proposal comment as MINOR (no action) or SUBSTANTIAL (flag the edit).
 */
export default Str.dedent(`
    EDIT CLASSIFICATION EXAMPLES (starts and ends at "___"):
    ___
    MINOR Edit Examples:

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
    [MINOR: Added screenshot link, emoji, and optional section without changing core content]

    SUBSTANTIAL Edit Examples:
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

    [SUBSTANTIAL: Changed root cause understanding and proposed solution significantly]
    ___

    CHANGES CLASSIFICATION:

    When comparing an initial proposal (non-edited) with the latest edit of a proposal comment, ONLY consider the following 'CHANGES' CLASSIFICATIONS:

    a. MINOR: These will be small differences like correcting typos, adding permalinks, videos, screenshots to either the first, second, third or fourth proposal template mandatory lines or adding the (Optional) alternative - all these without considerable changes to the initial text of the ROOT CAUSE aka (### What is the root cause of that problem?), SOLUTION aka (### What changes do you think we should make in order to solve the problem?).

    b. SUBSTANTIAL: With focus on the ROOT CAUSE and SOLUTION sections, these will be accounted for significant differences on the ROOT CAUSE and SOLUTION sections (either one of them, or all three of them) - meaning if initially the proposal's ROOT CAUSE and SOLUTION user content was mentioning a certain root cause or suggesting a certain solution and the latest edit is mentioning a completely different ROOT CAUSE and / or considerable SOLUTION changes.
`);
