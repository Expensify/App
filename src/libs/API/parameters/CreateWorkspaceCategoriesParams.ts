type CreateWorkspaceCategoriesParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<{name: string;}>
     */
    categories: string;
};

export default CreateWorkspaceCategoriesParams;
