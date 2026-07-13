/** A suggested-agent template picked in the "New agent" screen and consumed by the custom-agent builder to pre-fill its fields. Persisted so the selection survives a page refresh. */
type NewAgentTemplate = {
    /** Localized display name used to seed the agent name field */
    name: string;

    /** Instructions used to seed the agent prompt field */
    prompt: string;

    /** Preset avatar ID used to seed the agent avatar (validated against the avatar catalog before use) */
    avatarID: string;
};

export default NewAgentTemplate;
