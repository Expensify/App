type SetWorkspaceCategoriesEnabledParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<{name: string; enabled: boolean}>
     */
    categories: string;
};

export default SetWorkspaceCategoriesEnabledParams;
