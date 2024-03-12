type CreateWorkspaceTagsParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<{name: string;}>
     */
    tags: string;
};

export default CreateWorkspaceTagsParams;
