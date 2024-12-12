/** Model of user travel information to connect with Spotnana */
type TravelSettings = {
    /** UUIDs that spotnana provides us with when we provision users in their system, and the spotnanaCompanyIDs as the values */
    accountIDs: Record<string, string>;

    /** Whether the user has completed the travel terms and conditions checkbox */
    hasAcceptedTerms: boolean;

    /** Whether the user is setup for staging travelDot */
    testAccount?: boolean;

    /** Whether the user is waiting for the API response after accepting terms */
    isLoading?: boolean;
};

/** Model of workspace travel information to connect with Spotnana */
type WorkspaceTravelSettings = {
    /** The UUID that spotnana provides us when we create a “company” in their system */
    spotnanaCompanyID: string;

    /** The UUID that spotnana provides us when we provision the workspace as an “entity” in their system */
    spotnanaEntityID: boolean;
};

export type {TravelSettings, WorkspaceTravelSettings};
