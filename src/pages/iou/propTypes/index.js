import PropTypes from 'prop-types';
import participantPropTypes from '@components/participantPropTypes';
import CONST from '@src/CONST';

const iouPropTypes = PropTypes.shape({
    /** ID (iouType + reportID) of the expense */
    id: PropTypes.string,

    /** Amount of the expense */
    amount: PropTypes.number,

    /** Currency of the expense */
    currency: PropTypes.string,

    /** Description of the expense */
    comment: PropTypes.string,

    /** The merchant name */
    merchant: PropTypes.string,

    /** The category name */
    category: PropTypes.string,

    /** Whether the expense is billable */
    billable: PropTypes.bool,

    /** The tag */
    tag: PropTypes.string,

    /** Date that the expense was created */
    created: PropTypes.string,

    /** The path to an image of the receipt attached to the expense */
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
