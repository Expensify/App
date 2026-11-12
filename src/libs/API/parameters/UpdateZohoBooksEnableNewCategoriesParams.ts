type UpdateZohoBooksEnableNewCategoriesParams = {
    /** The workspace where the setting is updated. */
    policyID: string;

    /** Whether categories newly created in Zoho Books are imported. */
    enabled: boolean;
};

export default UpdateZohoBooksEnableNewCategoriesParams;
