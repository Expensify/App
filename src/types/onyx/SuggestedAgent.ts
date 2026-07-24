/**
 * A ready-made agent suggestion delivered from the backend via Onyx.
 * Selecting one prefills the prompt the admin can still edit before saving.
 */
type SuggestedAgent = {
    /** ID for the suggestion */
    id: string;

    /** Display name shown in the Suggestion menu */
    name: string;

    /** Description shown in the Suggestions menu */
    description: string;

    /** Prompt text written into the add-agent form when selected */
    prompt: string;
};

export default SuggestedAgent;
