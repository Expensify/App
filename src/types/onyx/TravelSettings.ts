/** Model of user travel information to connect with Spotnana */
type TravelSettings = {
    /** UUIDs that spotnana provides us with when we provision users in their system, and the spotnanaCompanyIDs as the values */
    accountIDs: Record<string, string>;

    /** Whether the user has completed the travel terms and conditions checkbox */
    hasAcceptedTerms: boolean;

    /** Whether the user is setup for staging travelDot */
    testAccount?: boolean;

    /** The last travel signup request time */
    lastTravelSignupRequestTime?: string;
};

/** Model of workspace travel information to connect with Spotnana */
type WorkspaceTravelSettings = {
    /** The UUID that spotnana provides us when we create a "company" in their system. Absent until the workspace is provisioned. */
    spotnanaCompanyID?: string;

    /** The UUID of the associated Spotnana Entity. Absent until the workspace is provisioned. */
    associatedTravelDomainAccountID?: string;

    /** Indicates whether an admin of the workspace accepted Spotnana Terms and Conditions. Absent until the workspace is provisioned. */
    hasAcceptedTerms?: boolean;

    /** Whether to automatically add trip names to expense descriptions during travel */
    autoAddTripName?: boolean;

    /** Legal entity tax ID, collected during Travel enablement on non-USD workspaces so Solutions can provision a DK number */
    taxID?: string;
};

export type {TravelSettings, WorkspaceTravelSettings};
