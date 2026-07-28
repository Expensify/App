type RenameWorkspaceCategoriesParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * {[oldName: string]: string;} where value is new category name
     */
    categories: string;
};

export default RenameWorkspaceCategoriesParams;
