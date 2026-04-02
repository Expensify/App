type DeleteWorkspaceCategoriesParams = {
    policyID: string;
    /**
     * A JSON-encoded string representing an array of category names to be deleted.
     * Each element in the array is a string that specifies the name of a category.
     */
    categories: string;
    /**
     * JSON-encoded array of auto-selected transaction updates when only one valid value remains.
     * Each element: {transactionID, category?, tag?, taxCode?}
     */
    transactionAutoSelections?: string;
};

export default DeleteWorkspaceCategoriesParams;
