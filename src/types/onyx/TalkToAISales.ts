/** Represents the state of the AI sales bot */
type TalkToAISales = {
    /** Whether the user is currently talking to the AI sales bot */
    isTalkingToAISales: boolean;

    /** Whether the AI sales bot is loading */
    isLoading: boolean;

    /** Temporary key for OpenAI realtime API */
    clientSecret?: {
        /** OpenAI Ephermeral token for the current session */
        ephemeralToken: string;

        /** Expiration time in epoch time for the ephemeral token. */
        expiresAt: number;
    };
};

export default TalkToAISales;
