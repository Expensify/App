type UpgradeToCorporateParams = {
    /** Single policy to upgrade. Mutually exclusive with `policyIDList`. */
    policyID?: string;

    /** Comma-separated list of policies to upgrade in bulk. Mutually exclusive with `policyID`. */
    policyIDList?: string;

    featureName?: string;
};

export default UpgradeToCorporateParams;
