type SetNameValuePairParams = {
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: boolean | string | Record<string, boolean> | Array<Record<string, any>>;
};

export default SetNameValuePairParams;
