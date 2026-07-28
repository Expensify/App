type SetNameValuePairParams = {
    name: string;
    value: boolean | string | Record<string, boolean> | Array<Record<string, unknown>>;
};

export default SetNameValuePairParams;
