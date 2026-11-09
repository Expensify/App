type UpdatePolicyTimezoneParams = {
    policyID: string;

    /** IANA timezone identifier, such as America/Los_Angeles */
    policyTimezone: string;
};

export default UpdatePolicyTimezoneParams;
