type UpdateCampfireSyncTaxRatesParams = {
    /** The workspace where the setting is updated. */
    policyID: string;

    /** Whether tax rates are imported from Campfire. */
    enabled: boolean;
};

export default UpdateCampfireSyncTaxRatesParams;
