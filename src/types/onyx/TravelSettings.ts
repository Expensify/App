type TravelSettings = {
    /** UUIDs that spotnana provides us with when we provision users in their system, and the spotnanaCompanyIDs as the values */
    accountIDs: Record<string, string>;

    /** Whether the user has completed the travel terms and conditions checkbox */
    hasAcceptedTerms: boolean;
};

type WorkspaceTravelSettings = {
    /** The UUID that spotnana provides us when we create a “company” in their system */
    spotnanaCompanyID: string;

    /** The UUID that spotnana provides us when we provision the workspace as an “entity” in their system */
    spotnanaEntityID: boolean;
};

export type {TravelSettings, WorkspaceTravelSettings};
