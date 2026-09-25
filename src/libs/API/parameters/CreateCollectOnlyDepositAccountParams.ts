type CreateCollectOnlyDepositAccountParams = {
    routingNumber: string;
    accountNumber: string;

    /** Every other collected field, plus country, currency and fieldsType, JSON encoded */
    additionalData: string;
    setupType: string;

    /** True when resubmitting details the bank verification warned about, telling the API to accept them anyway */
    confirm: boolean;
};

export default CreateCollectOnlyDepositAccountParams;
