type SetReimbursementCountriesParams = {
    policyID: string;

    /** Comma-separated ISO country codes. An empty string removes every country the policy has no withdrawal account in */
    countryISOList: string;
};

export default SetReimbursementCountriesParams;
