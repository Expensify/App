type UpdatePolicyTaxValueParams = {
    policyID: string;
    taxCode: string;
    // String in the format: "1.1234%"
    taxRate: string;
};

export default UpdatePolicyTaxValueParams;
