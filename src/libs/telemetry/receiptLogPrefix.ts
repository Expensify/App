/**
 * Prefix on every receipt log line, so the logs can be filtered without parsing free text. It lives on its own rather
 * than in ReceiptObservability because validateFormDataParameter runs for every parameter of every request and would
 * otherwise pull in PersistedRequests and the API command list just to read this string.
 */
const RECEIPT_LOG_PREFIX = '[Receipt]';

export default RECEIPT_LOG_PREFIX;
