type UpdateDualEntryEnableNewCategoriesParams = {
    /** The workspace where the setting is updated. */
    policyID: string;

    /** Whether categories newly created in DualEntry are imported. */
    enabled: boolean;
};

export default UpdateDualEntryEnableNewCategoriesParams;
