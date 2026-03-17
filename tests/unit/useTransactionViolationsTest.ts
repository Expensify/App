import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {isViolationDismissed, shouldShowViolation} from '@libs/TransactionUtils';
import type CONST_TYPE from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction, TransactionViolations} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/TransactionUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const CONST_MOCK = jest.requireActual('@src/CONST').default as typeof CONST_TYPE;
    return {
        isViolationDismissed: jest.fn(),
        shouldShowViolation: jest.fn(),
        mergeProhibitedViolations: (transactionViolations: Array<{name: string; type: string; data?: {prohibitedExpenseRule?: string | string[]}}>) => {
            const prohibitedViolations = transactionViolations.filter((violation) => violation.name === CONST_MOCK.VIOLATIONS.PROHIBITED_EXPENSE);

            if (prohibitedViolations.length === 0) {
                return transactionViolations;
            }

            const prohibitedExpenses = prohibitedViolations.flatMap((violation) => {
                const rule = violation.data?.prohibitedExpenseRule;
                if (!rule) {
                    return [];
                }
                return Array.isArray(rule) ? rule : [rule];
            });

            const mergedProhibitedViolations = {
                name: CONST_MOCK.VIOLATIONS.PROHIBITED_EXPENSE,
                data: {
                    prohibitedExpenseRule: prohibitedExpenses,
                },
                type: CONST_MOCK.VIOLATION_TYPES.VIOLATION,
            };

            return [...transactionViolations.filter((violation) => violation.name !== CONST_MOCK.VIOLATIONS.PROHIBITED_EXPENSE), mergedProhibitedViolations];
        },
    };
});

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(() => ({
        email: 'test@example.com',
        accountID: 1,
    })),
}));

describe('useTransactionViolations', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.clear();

        // Default mock implementations
        (isViolationDismissed as jest.Mock).mockReturnValue(false);
        (shouldShowViolation as jest.Mock).mockReturnValue(true);
    });

    describe('mergeProhibitedViolations', () => {
        it('should return original array when there are no prohibited violations', async () => {
            const transactionID = '123';
            const violations: TransactionViolations = [
                {
                    name: CONST.VIOLATIONS.MISSING_CATEGORY,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
                {
                    name: CONST.VIOLATIONS.MISSING_TAG,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
            ];

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                transactionID,
            } as Transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, violations);

            await waitForBatchedUpdates();

            const {result} = renderHook(() => useTransactionViolations(transactionID));

            expect(result.current).toHaveLength(2);
            expect(result.current.at(0)?.name).toBe(CONST.VIOLATIONS.MISSING_CATEGORY);
            expect(result.current.at(1)?.name).toBe(CONST.VIOLATIONS.MISSING_TAG);
        });

        it('should handle a single prohibited violation correctly', async () => {
            const transactionID = '123';
            const violations: TransactionViolations = [
                {
                    name: CONST.VIOLATIONS.PROHIBITED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {
                        prohibitedExpenseRule: 'alcohol',
                    },
                },
            ];

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                transactionID,
            } as Transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, violations);

            await waitForBatchedUpdates();

            const {result} = renderHook(() => useTransactionViolations(transactionID));

            expect(result.current).toHaveLength(1);
            expect(result.current.at(0)?.name).toBe(CONST.VIOLATIONS.PROHIBITED_EXPENSE);
            expect(result.current.at(0)?.data?.prohibitedExpenseRule).toEqual(['alcohol']);
            expect(result.current.at(0)?.type).toBe(CONST.VIOLATION_TYPES.VIOLATION);
        });

        it('should merge multiple prohibited violations into one', async () => {
            const transactionID = '123';
            const violations: TransactionViolations = [
                {
                    name: CONST.VIOLATIONS.PROHIBITED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {
                        prohibitedExpenseRule: 'alcohol',
                    },
                },
                {
                    name: CONST.VIOLATIONS.PROHIBITED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {
                        prohibitedExpenseRule: 'gambling',
                    },
                },
                {
                    name: CONST.VIOLATIONS.PROHIBITED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {
                        prohibitedExpenseRule: 'tobacco',
                    },
                },
            ];

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                transactionID,
            } as Transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, violations);

            await waitForBatchedUpdates();

            const {result} = renderHook(() => useTransactionViolations(transactionID));

            expect(result.current).toHaveLength(1);
            expect(result.current.at(0)?.name).toBe(CONST.VIOLATIONS.PROHIBITED_EXPENSE);
            expect(result.current.at(0)?.data?.prohibitedExpenseRule).toEqual(['alcohol', 'gambling', 'tobacco']);
            expect(result.current.at(0)?.type).toBe(CONST.VIOLATION_TYPES.VIOLATION);
        });

        it('should handle empty prohibitedExpenseRule arrays', async () => {
            const transactionID = '123';
            const violations: TransactionViolations = [
                {
                    name: CONST.VIOLATIONS.PROHIBITED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {
                        prohibitedExpenseRule: undefined,
                    },
                },
                {
                    name: CONST.VIOLATIONS.PROHIBITED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {},
                },
            ];

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                transactionID,
            } as Transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, violations);

            await waitForBatchedUpdates();

            const {result} = renderHook(() => useTransactionViolations(transactionID));

            expect(result.current).toHaveLength(1);
            expect(result.current.at(0)?.name).toBe(CONST.VIOLATIONS.PROHIBITED_EXPENSE);
            expect(result.current.at(0)?.data?.prohibitedExpenseRule).toEqual([]);
            expect(result.current.at(0)?.type).toBe(CONST.VIOLATION_TYPES.VIOLATION);
        });

        it('should handle mixed violations (some prohibited, some not)', async () => {
            const transactionID = '123';
            const violations: TransactionViolations = [
                {
                    name: CONST.VIOLATIONS.MISSING_CATEGORY,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
                {
                    name: CONST.VIOLATIONS.PROHIBITED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {
                        prohibitedExpenseRule: 'alcohol',
                    },
                },
                {
                    name: CONST.VIOLATIONS.MISSING_TAG,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
                {
                    name: CONST.VIOLATIONS.PROHIBITED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {
                        prohibitedExpenseRule: 'gambling',
                    },
                },
                {
                    name: CONST.VIOLATIONS.MISSING_COMMENT,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
            ];

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                transactionID,
            } as Transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, violations);

            await waitForBatchedUpdates();

            const {result} = renderHook(() => useTransactionViolations(transactionID));

            expect(result.current).toHaveLength(4);

            // Check that all non-prohibited violations are present
            const violationNames = result.current.map((v) => v.name);
            expect(violationNames).toContain(CONST.VIOLATIONS.MISSING_CATEGORY);
            expect(violationNames).toContain(CONST.VIOLATIONS.MISSING_TAG);
            expect(violationNames).toContain(CONST.VIOLATIONS.MISSING_COMMENT);
            expect(violationNames).toContain(CONST.VIOLATIONS.PROHIBITED_EXPENSE);

            // Check that prohibited violations are merged
            const prohibitedViolation = result.current.find((v) => v.name === CONST.VIOLATIONS.PROHIBITED_EXPENSE);
            expect(prohibitedViolation?.data?.prohibitedExpenseRule).toEqual(['alcohol', 'gambling']);
        });

        it('should handle prohibitedExpenseRule as an array', async () => {
            const transactionID = '123';
            const violations: TransactionViolations = [
                {
                    name: CONST.VIOLATIONS.PROHIBITED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {
                        prohibitedExpenseRule: ['alcohol', 'tobacco'],
                    },
                },
                {
                    name: CONST.VIOLATIONS.PROHIBITED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {
                        prohibitedExpenseRule: 'gambling',
                    },
                },
            ];

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                transactionID,
            } as Transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, violations);

            await waitForBatchedUpdates();

            const {result} = renderHook(() => useTransactionViolations(transactionID));

            expect(result.current).toHaveLength(1);
            expect(result.current.at(0)?.name).toBe(CONST.VIOLATIONS.PROHIBITED_EXPENSE);
            expect(result.current.at(0)?.data?.prohibitedExpenseRule).toEqual(['alcohol', 'tobacco', 'gambling']);
        });
    });

    describe('full hook behavior', () => {
        it('should filter out dismissed violations', async () => {
            const transactionID = '123';
            const violations: TransactionViolations = [
                {
                    name: CONST.VIOLATIONS.MISSING_CATEGORY,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
                {
                    name: CONST.VIOLATIONS.MISSING_TAG,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
            ];

            // Mock the first violation as dismissed
            (isViolationDismissed as jest.Mock).mockImplementation((transaction, violation) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                return violation.name === CONST.VIOLATIONS.MISSING_CATEGORY;
            });

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                transactionID,
            } as Transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, violations);

            await waitForBatchedUpdates();

            const {result} = renderHook(() => useTransactionViolations(transactionID));

            expect(result.current).toHaveLength(1);
            expect(result.current.at(0)?.name).toBe(CONST.VIOLATIONS.MISSING_TAG);
        });

        it('should filter violations based on shouldShowViolation', async () => {
            const transactionID = '123';
            const reportID = 'report123';
            const policyID = 'policy123';

            const violations: TransactionViolations = [
                {
                    name: CONST.VIOLATIONS.MISSING_CATEGORY,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
                {
                    name: CONST.VIOLATIONS.RTER,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
            ];

            // Mock shouldShowViolation to hide RTER violations
            (shouldShowViolation as jest.Mock).mockImplementation((iouReport, policy, violationName) => {
                return violationName !== CONST.VIOLATIONS.RTER;
            });

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                transactionID,
                reportID,
            } as Transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
                reportID,
                policyID,
            } as Report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {} as Policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, violations);

            await waitForBatchedUpdates();

            const {result} = renderHook(() => useTransactionViolations(transactionID));

            expect(result.current).toHaveLength(1);
            expect(result.current.at(0)?.name).toBe(CONST.VIOLATIONS.MISSING_CATEGORY);
        });

        it('should return empty array when transactionID is undefined', async () => {
            await waitForBatchedUpdates();
            const {result} = renderHook(() => useTransactionViolations(undefined));

            expect(result.current).toEqual([]);
        });

        it('should handle empty violations array', async () => {
            const transactionID = '123';

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                transactionID,
            } as Transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, []);

            await waitForBatchedUpdates();

            const {result} = renderHook(() => useTransactionViolations(transactionID));

            expect(result.current).toEqual([]);
        });

        it('should update when violations change', async () => {
            const transactionID = '123';
            const initialViolations: TransactionViolations = [
                {
                    name: CONST.VIOLATIONS.MISSING_CATEGORY,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
            ];

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                transactionID,
            } as Transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, initialViolations);

            await waitForBatchedUpdates();

            const {result, rerender} = renderHook(() => useTransactionViolations(transactionID));

            expect(result.current).toHaveLength(1);
            expect(result.current.at(0)?.name).toBe(CONST.VIOLATIONS.MISSING_CATEGORY);

            // Update violations
            const updatedViolations: TransactionViolations = [
                {
                    name: CONST.VIOLATIONS.MISSING_TAG,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
            ];

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, updatedViolations);
            await waitForBatchedUpdates();

            rerender(undefined);

            expect(result.current).toHaveLength(1);
            expect(result.current.at(0)?.name).toBe(CONST.VIOLATIONS.MISSING_TAG);
        });

        it('should respect shouldShowRterForSettledReport parameter', async () => {
            const transactionID = '123';
            const reportID = 'report123';
            const policyID = 'policy123';

            const violations: TransactionViolations = [
                {
                    name: CONST.VIOLATIONS.RTER,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
            ];

            let capturedShouldShowRterParam: boolean | undefined;
            (shouldShowViolation as jest.Mock).mockImplementation((iouReport, policy, violationName, email, shouldShowRter) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                capturedShouldShowRterParam = shouldShowRter;
                return true;
            });

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                transactionID,
                reportID,
            } as Transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
                reportID,
                policyID,
            } as Report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {} as Policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, violations);

            await waitForBatchedUpdates();

            // Test with default (true)
            renderHook(() => useTransactionViolations(transactionID));
            expect(capturedShouldShowRterParam).toBe(true);

            // Test with explicit false
            renderHook(() => useTransactionViolations(transactionID, false));
            expect(capturedShouldShowRterParam).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle violations with no data property', async () => {
            const transactionID = '123';
            const violations: TransactionViolations = [
                {
                    name: CONST.VIOLATIONS.PROHIBITED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
            ];

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                transactionID,
            } as Transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, violations);

            await waitForBatchedUpdates();

            const {result} = renderHook(() => useTransactionViolations(transactionID));

            expect(result.current).toHaveLength(1);
            expect(result.current.at(0)?.name).toBe(CONST.VIOLATIONS.PROHIBITED_EXPENSE);
            expect(result.current.at(0)?.data?.prohibitedExpenseRule).toEqual([]);
        });

        it('should handle complex scenario with all violation types', async () => {
            const transactionID = '123';
            const violations: TransactionViolations = [
                {
                    name: CONST.VIOLATIONS.MISSING_CATEGORY,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
                {
                    name: CONST.VIOLATIONS.PROHIBITED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {
                        prohibitedExpenseRule: ['alcohol', 'tobacco'],
                    },
                },
                {
                    name: CONST.VIOLATIONS.MISSING_TAG,
                    type: CONST.VIOLATION_TYPES.NOTICE,
                },
                {
                    name: CONST.VIOLATIONS.PROHIBITED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {
                        prohibitedExpenseRule: 'gambling',
                    },
                },
                {
                    name: CONST.VIOLATIONS.SOME_TAG_LEVELS_REQUIRED,
                    type: CONST.VIOLATION_TYPES.WARNING,
                },
                {
                    name: CONST.VIOLATIONS.PROHIBITED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {},
                },
            ];

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                transactionID,
            } as Transaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, violations);

            await waitForBatchedUpdates();

            const {result} = renderHook(() => useTransactionViolations(transactionID));

            expect(result.current).toHaveLength(4);

            const violationNames = result.current.map((v) => v.name);
            expect(violationNames).toContain(CONST.VIOLATIONS.MISSING_CATEGORY);
            expect(violationNames).toContain(CONST.VIOLATIONS.MISSING_TAG);
            expect(violationNames).toContain(CONST.VIOLATIONS.SOME_TAG_LEVELS_REQUIRED);
            expect(violationNames).toContain(CONST.VIOLATIONS.PROHIBITED_EXPENSE);

            const prohibitedViolation = result.current.find((v) => v.name === CONST.VIOLATIONS.PROHIBITED_EXPENSE);
            expect(prohibitedViolation?.data?.prohibitedExpenseRule).toEqual(['alcohol', 'tobacco', 'gambling']);
            expect(prohibitedViolation?.type).toBe(CONST.VIOLATION_TYPES.VIOLATION);
        });
    });
});
