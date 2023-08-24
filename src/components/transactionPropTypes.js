import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '../CONST';

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

    /** The comment object on the transaction */
    comment: PropTypes.shape({
        /** The text of the comment */
        comment: PropTypes.string,

        /** The waypoints defining the distance request */
        waypoints: PropTypes.shape({
            /** The latitude of the waypoint */
            lat: PropTypes.number,

            /** The longitude of the waypoint */
            lng: PropTypes.number,

            /** The address of the waypoint */
            address: PropTypes.string,
        }),
    }),

    /** The type of transaction */
    type: PropTypes.oneOf(_.values(CONST.TRANSACTION.TYPE)),

    /** Custom units attached to the transaction */
    customUnits: PropTypes.arrayOf(
        PropTypes.shape({
            /** The name of the custom unit */
            name: PropTypes.string,
        }),
    ),

    /** The original currency of the transaction */
    currency: PropTypes.string,

    /** The edited currency of the transaction */
    modifiedCurrency: PropTypes.string,

    /** The receipt object associated with the transaction */
    receipt: PropTypes.shape({
        receiptID: PropTypes.number,
        source: PropTypes.string,
        state: PropTypes.string,
    }),

    /** Server side errors keyed by microtime */
    errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
});
