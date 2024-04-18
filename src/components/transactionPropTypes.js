import PropTypes from 'prop-types';
import _ from 'underscore';
import {translatableTextPropTypes} from '@libs/Localize';
import CONST from '@src/CONST';
import sourcePropTypes from './Image/sourcePropTypes';

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
    comment: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            /** The text of the comment */
            comment: PropTypes.string,

            /** The waypoints defining the distance expense */
            waypoints: PropTypes.shape({
                /** The latitude of the waypoint */
                lat: PropTypes.number,

                /** The longitude of the waypoint */
                lng: PropTypes.number,

                /** The address of the waypoint */
                address: PropTypes.string,

                /** The name of the waypoint */
                name: PropTypes.string,
            }),
        }),
    ]),

    /** The type of transaction */
    type: PropTypes.oneOf(_.values(CONST.TRANSACTION.TYPE)),

    /** Custom units attached to the transaction */
    customUnits: PropTypes.arrayOf(
        PropTypes.shape({
            /** The name of the custom unit */
            name: PropTypes.string,
        }),
    ),

    /** Selected participants */
    participants: PropTypes.arrayOf(
        PropTypes.shape({
            accountID: PropTypes.number,
            login: PropTypes.string,
            isPolicyExpenseChat: PropTypes.bool,
            isOwnPolicyExpenseChat: PropTypes.bool,
            selected: PropTypes.bool,
        }),
    ),

    /** The original currency of the transaction */
    currency: PropTypes.string,

    /** The edited currency of the transaction */
    modifiedCurrency: PropTypes.string,

    /** The receipt object associated with the transaction */
    receipt: PropTypes.shape({
        receiptID: PropTypes.number,
        source: PropTypes.oneOfType([PropTypes.number, PropTypes.string, sourcePropTypes]),
        state: PropTypes.string,
    }),

    /** Server side errors keyed by microtime */
    errorFields: PropTypes.objectOf(PropTypes.objectOf(translatableTextPropTypes)),
});
