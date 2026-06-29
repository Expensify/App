import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useTransactionViolations from '@hooks/useTransactionViolations';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import {createRandomDistanceRequestTransaction} from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        email: 'test@example.com',
        accountID: 1,
    })),
}));

describe('useTransactionViolations distance rate date sync', () => {
    const transactionID = 'distance-txn-1';
    const customUnitRateID = 'rate_id';
    const policyID = 'workspace-policy';

    const policy: Policy = {
        ...createRandomPolicy(1),
        id: policyID,
        customUnits: {
            unitId: {
                attributes: {unit: 'mi'},
                customUnitID: 'unitId',
                defaultCategory: 'Car',
                enabled: true,
                name: 'Distance',
                rates: {
                    [customUnitRateID]: {
                        currency: 'USD',
                        customUnitRateID,
                        enabled: true,
                        name: '2025 mileage',
                        rate: 65.5,
                        startDate: '2025-01-01',
                        endDate: '2025-12-31',
                    },
                },
            },
        },
    };

    const baseTransaction = createRandomDistanceRequestTransaction(1);

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await Onyx.clear();

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${CONST.REPORT.UNREPORTED_REPORT_ID}`, {
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
            ...baseTransaction,
            transactionID,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            created: '2026-06-15',
            comment: {
                ...baseTransaction.comment,
                customUnit: {
                    ...baseTransaction.comment?.customUnit,
                    customUnitRateID,
                },
            },
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, []);
        await waitForBatchedUpdates();
    });

    it('syncs customUnitRateOutOfDateRange for tracked distance expenses using the rate policy when the report has no policy', async () => {
        const {result} = renderHook(() => useTransactionViolations(transactionID));

        await waitFor(() => {
            expect(result.current).toContainEqual(
                expect.objectContaining({
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                    data: {
                        startDate: '2025-01-01',
                        endDate: '2025-12-31',
                    },
                }),
            );
        });
    });

    it('does not strip an existing customUnitRateOutOfDateRange violation when the report has no policy', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, [
            {
                name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                type: CONST.VIOLATION_TYPES.WARNING,
                showInReview: true,
                data: {
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                },
            },
        ]);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTransactionViolations(transactionID));

        await waitFor(() => {
            expect(result.current).toContainEqual(
                expect.objectContaining({
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                }),
            );
        });
    });

    it('syncs customUnitRateOutOfDateRange for workspace distance expenses using the report policy', async () => {
        const reportID = 'workspace-report';
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
            reportID,
            policyID,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
            ...baseTransaction,
            transactionID,
            reportID,
            created: '2026-06-15',
            comment: {
                ...baseTransaction.comment,
                customUnit: {
                    ...baseTransaction.comment?.customUnit,
                    customUnitRateID,
                },
            },
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useTransactionViolations(transactionID));

        await waitFor(() => {
            expect(result.current).toContainEqual(
                expect.objectContaining({
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                    data: {
                        startDate: '2025-01-01',
                        endDate: '2025-12-31',
                    },
                }),
            );
        });
    });
});
