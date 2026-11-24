type AcceptSpotnanaTermsParams = {
    domainName?: string;
    policyID?: string;
    taxID?: string;

    /** Whether every workspace member can book travel. Omitted, every member can. */
    shouldEnableAllTravelMembers?: boolean;

    /** Comma-separated accountIDs of the members who can book travel when shouldEnableAllTravelMembers is false */
    travelMemberAccountIDList?: string;
};

export default AcceptSpotnanaTermsParams;
