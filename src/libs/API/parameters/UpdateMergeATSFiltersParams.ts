type UpdateMergeATSFiltersParams = {
    /** The ID of the policy to update. */
    policyID: string;

    /** Stringified JSON of the candidate filters (tag names, stage names and office ids) to import candidates for. */
    filters: string;
};

export default UpdateMergeATSFiltersParams;
