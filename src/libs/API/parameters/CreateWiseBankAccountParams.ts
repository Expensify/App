type CreateWiseBankAccountParams = {
    country: string;
    currency?: string;
    inputs: string;
    confirmVerificationOfPayee?: boolean;
};

export default CreateWiseBankAccountParams;
