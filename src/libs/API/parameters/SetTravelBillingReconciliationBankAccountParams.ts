type SetTravelBillingReconciliationBankAccountParams = {
    domainName: string;
    // The backend reads this request key, so it keeps the legacy spelling.
    travelInvoicingReconciliationBankAccountID: string;
};

export default SetTravelBillingReconciliationBankAccountParams;
