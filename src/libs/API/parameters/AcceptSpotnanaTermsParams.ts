type AcceptSpotnanaTermsParams = {
    domainName?: string;
    policyID?: string;
    taxID?: string;

    /** Whether every workspace member gets travel. Omitted, every member does. */
    shouldEnableAllTravelMembers?: boolean;

    /** Comma-separated accountIDs of the members who get travel when shouldEnableAllTravelMembers is false */
    travelMemberAccountIDList?: string;
};

export default AcceptSpotnanaTermsParams;
