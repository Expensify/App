type SetWorkspaceCategoriesEnabledParams = {
    policyID: string;
    categories: Array<{name: string; enabled: boolean}>;
};

export default SetWorkspaceCategoriesEnabledParams;
