import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useTransactionViolations from '@hooks/useTransactionViolations';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Transaction, TransactionViolations} from '@src/types/onyx';
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
    } as Policy;

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
            transactionID,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
            created: '2026-06-15',
            comment: {
                customUnit: {
                    customUnitRateID,
                },
            },
        } as Transaction);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, [] as TransactionViolations);
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
});
