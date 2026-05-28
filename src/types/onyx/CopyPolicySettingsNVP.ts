/** Backend progress state for bulk copy settings. */
type CopyPolicySettingsNVPState = 'in-progress' | 'complete' | null;

/** NVP payload for bulk copy settings progress. */
type CopyPolicySettingsNVP = {
    /** Current backend state of the bulk copy job. */
    state?: CopyPolicySettingsNVPState;

    /** Whether the user requested a Concierge notification. */
    shouldSendToConcierge?: boolean;
};

export default CopyPolicySettingsNVP;
