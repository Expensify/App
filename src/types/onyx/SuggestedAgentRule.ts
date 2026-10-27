/**
 * A ready-made agent rule suggestion delivered from the backend via Onyx.
 * Selecting one prefills the add-rule prompt the admin can still edit before saving.
 */
type SuggestedAgentRule = {
    /** ID for the suggestion */
    id: string;

    /** Display title shown in the Suggestions tab */
    title: string;

    /** Prompt text written into the add-rule form when selected */
    prompt: string;

    /** Section header shown above the suggestion in the Suggestions tab */
    category?: string;
};

export default SuggestedAgentRule;
