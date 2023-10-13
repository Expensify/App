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
    fraud: PropTypes.oneOf([CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN, CONST.EXPENSIFY_CARD.FRAUD_TYPES.USER, CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE]),
    cardholderFirstName: PropTypes.string,
    cardholderLastName: PropTypes.string,
});

export default assignedCardPropTypes;
