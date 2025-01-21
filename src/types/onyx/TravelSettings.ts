/** Model of user travel information to connect with Spotnana */
type TravelSettings = {
    /** UUIDs that spotnana provides us with when we provision users in their system, and the spotnanaCompanyIDs as the values */
    accountIDs: Record<string, string>;

    /** Whether the user has completed the travel terms and conditions checkbox */
    hasAcceptedTerms: boolean;

    /** Whether the user is setup for staging travelDot */
    testAccount?: boolean;
};

/** Model of workspace travel information to connect with Spotnana */
type WorkspaceTravelSettings = {
    /** The UUID that spotnana provides us when we create a “company” in their system */
    spotnanaCompanyID: string;

    /** The UUID of the associated Spotnana Entity */
    associatedTravelDomainAccountID: string;

    /** Indicates whether an admin of the workspace accepted Spotnana Terms and Conditions */
    hasAcceptedTerms: boolean;
};

export type {TravelSettings, WorkspaceTravelSettings};
