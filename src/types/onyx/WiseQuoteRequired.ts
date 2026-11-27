/** Model of the signal the backend sends when a payment without a Wise quote is rejected because the payment converts currency, so App shows the quote and pays again */
type WiseQuoteRequired = {
    /** The expense report whose payment without a quote the backend rejected */
    reportID: string;
};

export default WiseQuoteRequired;
