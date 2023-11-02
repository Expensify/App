import PropTypes from 'prop-types';
import participantPropTypes from '@components/participantPropTypes';
import CONST from '@src/CONST';

const iouPropTypes = PropTypes.shape({
    /** ID (iouType + reportID) of the request */
    id: PropTypes.string,

    /** Amount of the request */
    amount: PropTypes.number,

    /** Currency of the request */
    currency: PropTypes.string,

    /** Description of the request */
    comment: PropTypes.string,

    /** The merchant name */
    merchant: PropTypes.string,

    /** The category name */
    category: PropTypes.string,

    /** Whether the request is billable */
    billable: PropTypes.bool,

    /** The tag */
    tag: PropTypes.string,

    /** Date that the request was created */
    created: PropTypes.string,

    /** The path to an image of the receipt attached to the request */
    receiptPath: PropTypes.string,

    /** List of the participants */
    participants: PropTypes.arrayOf(participantPropTypes),
});

const iouDefaultProps = {
    id: '',
    amount: 0,
    currency: CONST.CURRENCY.USD,
    comment: '',
    merchant: '',
    category: '',
    tag: '',
    billable: false,
    created: '',
    participants: [],
    receiptPath: '',
};

export {iouPropTypes, iouDefaultProps};
