import PropTypes from 'prop-types';
import CONST from '@src/CONST';

const violationNames = Object.values(CONST.VIOLATIONS);

const transactionViolationPropType = PropTypes.shape({
    type: PropTypes.string.isRequired,
    name: PropTypes.oneOf(violationNames).isRequired,
    data: PropTypes.shape({
        rejectedBy: PropTypes.string,
        rejectReason: PropTypes.string,
        amount: PropTypes.string,
        surcharge: PropTypes.number,
        invoiceMarkup: PropTypes.number,
        maxAge: PropTypes.number,
        tagName: PropTypes.string,
        formattedLimitAmount: PropTypes.string,
        categoryLimit: PropTypes.string,
        limit: PropTypes.string,
        category: PropTypes.string,
        brokenBankConnection: PropTypes.bool,
        isAdmin: PropTypes.bool,
        email: PropTypes.string,
        isTransactionOlderThan7Days: PropTypes.bool,
        member: PropTypes.string,
        taxName: PropTypes.string,
    }),
});

const transactionViolationsPropType = PropTypes.objectOf(PropTypes.arrayOf(transactionViolationPropType));

export {transactionViolationsPropType, transactionViolationPropType};
