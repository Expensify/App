import PropTypes from 'prop-types';

export default {
    /** The transaction currency code */
    currency: PropTypes.string,

    /** The transaction amount */
    amount: PropTypes.number,

    /** The transaction comment */
    comment: PropTypes.string,

    /** Date that the transaction was created */
    created: PropTypes.string,

    /** The ID of this report transaction */
    transactionID: PropTypes.string,
};
