import PropTypes from 'prop-types';
import CONST from '@src/CONST';
import {ViolationName} from '@src/types/onyx';

const violationNames = Object.values(CONST.VIOLATIONS) as ViolationName[];

const transactionViolationPropType = PropTypes.shape({
    type: PropTypes.string.isRequired,
    name: PropTypes.oneOf(violationNames).isRequired,
    userMessage: PropTypes.string.isRequired,
    data: PropTypes.objectOf(PropTypes.string),
});
const transactionViolationsPropTypes = PropTypes.arrayOf(transactionViolationPropType);

export {transactionViolationsPropTypes, transactionViolationPropType};
