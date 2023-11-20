/**
 * @module TransactionViolation
 * @description Transaction Violation
 */
import PropTypes from 'prop-types';

/**
 * Names of the various Transaction Violation types.
 * Defined as an array so it can be used in `PropTypes.oneOf`
 */
const violationNames = [
    'perDayLimit',
    'maxAge',
    'overLimit',
    'overLimitAttendee',
    'overCategoryLimit',
    'receiptRequired',
    'missingCategory',
    'categoryOutOfPolicy',
    'missingTag',
    'tagOutOfPolicy',
    'missingComment',
    'taxRequired',
    'taxOutOfPolicy',
    'billableExpense',
] as const;

/**
 * Names of the various Transaction Violation types.
 *
 * The list is first defined as an array so it can be used in `PropTypes.oneOf`, and
 * converted to a union type here for use in typescript.
 */
type ViolationName = (typeof violationNames)[number];

type ViolationType = string;

type TransactionViolation = {
    type: ViolationType;
    name: ViolationName;
    userMessage: string;
    data?: Record<string, string>;
};

const transactionViolationPropType = PropTypes.shape({
    type: PropTypes.string.isRequired,
    name: PropTypes.oneOf(violationNames).isRequired,
    userMessage: PropTypes.string.isRequired,
    data: PropTypes.objectOf(PropTypes.string),
});

const transactionViolationsPropTypes = PropTypes.arrayOf(transactionViolationPropType);

export default {
    transactionViolationPropType,
    transactionViolationsPropTypes,
};

export type {TransactionViolation, ViolationName, ViolationType};
