type UpdateCampfireEnableNewCategoriesParams = {
    /** The workspace where the setting is updated. */
    policyID: string;

    /** Whether categories newly created in Campfire are imported. */
    enabled: boolean;
};

export default UpdateCampfireEnableNewCategoriesParams;
