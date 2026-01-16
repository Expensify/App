type SetNameValuePairParams = {
    name: string;
    // NVP_EXPENSE_RULES params has tax: Record<string, TaxRate>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: boolean | string | Record<string, boolean> | Array<Record<string, any>>;
};

export default SetNameValuePairParams;
