type DeleteWorkspaceCategoriesParams = {
    policyID: string;
    /**
     * A JSON-encoded string representing an array of category names to be deleted.
     * Each element in the array is a string that specifies the name of a category.
     */
    categories: string;
};

export default DeleteWorkspaceCategoriesParams;
