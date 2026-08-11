type UpdateDualEntrySyncTaxRatesParams = {
    /** The workspace where the setting is updated. */
    policyID: string;

    /** Whether tax rates are imported from DualEntry. */
    enabled: boolean;
};

export default UpdateDualEntrySyncTaxRatesParams;
