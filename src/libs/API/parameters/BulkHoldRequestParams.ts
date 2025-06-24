type BulkHoldRequestParams = {
    holdData: string; // This is a json object with shape Record<string, HoldDataEntry>;
    comment: string;
};

export default BulkHoldRequestParams;
