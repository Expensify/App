type SetNameValuePairsParams = {
    /** JSON-encoded `{[name: string]: string}` of NVPs to set in one atomic operation. An empty value deletes the NVP. */
    nameValuePairs: string;
};

export default SetNameValuePairsParams;
