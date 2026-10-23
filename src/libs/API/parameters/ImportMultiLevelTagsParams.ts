type ImportMultiLevelTagsParams = {
    policyID: string;
    isFirstLineHeader: boolean;
    isIndependent: boolean;
    isGLAdjacent: boolean;
    appendToExistingLists?: boolean;
    file: File;
};

export default ImportMultiLevelTagsParams;
