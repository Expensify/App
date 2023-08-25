import PropTypes from 'prop-types';
import CONST from '../../../CONST';
import participantPropTypes from '../../../components/participantPropTypes';

const iouPropTypes = PropTypes.shape({
    /** ID (iouType + reportID) of the request */
    id: PropTypes.string,

    /** Amount of the request */
    amount: PropTypes.number,

    /** Currency of the request */
    currency: PropTypes.string,

    /** Description of the request */
    comment: PropTypes.string,

    merchant: PropTypes.string,
    created: PropTypes.string,
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
    created: '',
    participants: [],
    receiptPath: '',
};

export {iouPropTypes, iouDefaultProps};
