type UpdateNetSuiteGenericTypeParams<K extends string | number | symbol, Type> = {
    [K2 in K]: Type;
} & {
    policyID: string;
    authToken: string;
};

export default UpdateNetSuiteGenericTypeParams;
