/** ISO timestamps of fraud reviews answered on this device, so an answer that never reached the server can resurface */
type LocallyProcessedFraudTransactionReviews = Record<string, string>;

export default LocallyProcessedFraudTransactionReviews;
