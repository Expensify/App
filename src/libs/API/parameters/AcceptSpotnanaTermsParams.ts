type AcceptSpotnanaTermsParams = {
    domainName?: string;
    policyID?: string;
    taxID?: string;

    /** JSON-encoded list of travel types to flag when they're booked outside Expensify Travel */
    flaggedTravelTypes?: string;
};

export default AcceptSpotnanaTermsParams;
