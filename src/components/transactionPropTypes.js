import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** The transaction id */
    transactionID: PropTypes.string,

    /** The iouReportID associated with the transaction */
    reportID: PropTypes.string,

    /** The original transaction amount */
    amount: PropTypes.number,

    /** The edited transaction amount */
    modifiedAmount: PropTypes.number,

    /** The original created data */
    created: PropTypes.string,

    /** The edited transaction date */
    modifiedCreated: PropTypes.string,

    /** The filename of the associated receipt */
    filename: PropTypes.string,

    /** The original merchant name */
    merchant: PropTypes.string,

    /** The edited merchant name */
    modifiedMerchant: PropTypes.string,

    /** The comment added to the transaction */
    comment: PropTypes.shape({
        comment: PropTypes.string,
    }),

    /** The original currency of the transaction */
    currency: PropTypes.string,

    /** The edited currency of the transaction */
    modifiedCurrency: PropTypes.string,

    /** The receipt object associated with the transaction */
    receipt: PropTypes.shape({
        receiptID: PropTypes.string,
        source: PropTypes.string,
        state: PropTypes.string,
    }),
});
