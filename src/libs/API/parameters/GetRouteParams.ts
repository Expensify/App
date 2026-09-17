type GetRouteParams = {
    transactionID: string;
    waypoints: string;

    /** The workspace the expense is headed for, so the response can carry its commuter exclusion preview */
    policyID?: string;
};

export default GetRouteParams;
