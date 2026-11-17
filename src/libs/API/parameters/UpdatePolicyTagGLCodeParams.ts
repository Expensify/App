type UpdatePolicyTagGLCodeParams = {
    policyID: string;
    tagListName: string;
    tagListIndex: number;
    tagName: string;
    glCode: string;
    parentTagsFilter?: string;
};

export default UpdatePolicyTagGLCodeParams;
