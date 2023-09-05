import PropTypes from 'prop-types';
import CONST from '../../../CONST';

/** Assigned Card props */
const assignedCardPropTypes = PropTypes.shape({
    cardID: PropTypes.number,
    state: PropTypes.number,
    bank: PropTypes.string,
    availableSpend: PropTypes.number,
    domainName: PropTypes.string,
    maskedPan: PropTypes.string,
    isVirtual: PropTypes.bool,
    fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES,
    cardholderFirstName: PropTypes.string,
    cardholderLastName: PropTypes.string,
});

export default assignedCardPropTypes;
