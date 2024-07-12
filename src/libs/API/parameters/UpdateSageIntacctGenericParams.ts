type UpdateSageIntacctGenericParams<K extends string | number | symbol, Type> = {
    [K2 in K]: Type;
} & {
    policyID: string;
};

export default UpdateSageIntacctGenericParams;
