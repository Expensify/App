type UpdateSageIntacctGenericTypeParams<K extends string | number | symbol, Type> = Record<K, Type> & {
    policyID: string;
};

export default UpdateSageIntacctGenericTypeParams;
