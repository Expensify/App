import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useTodos from '@hooks/useTodos';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, TodosDerivedValue, Transaction} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// This keeps the error "@rnmapbox/maps native code not available." from causing the tests to fail
jest.mock('@components/ConfirmedRoute.tsx');

describe('useTodos', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    describe('data transformation', () => {
        it('returns empty data and metadata when no todos exist', async () => {
            const {result} = renderHook(() => useTodos());
            await waitForBatchedUpdatesWithAct();

            const {current} = result;

            expect(current[CONST.SEARCH.SEARCH_KEYS.SUBMIT].data).toEqual({});
            expect(current[CONST.SEARCH.SEARCH_KEYS.SUBMIT].metadata).toEqual({
                count: 0,
                total: 0,
                currency: undefined,
            });

            expect(current[CONST.SEARCH.SEARCH_KEYS.APPROVE].data).toEqual({});
            expect(current[CONST.SEARCH.SEARCH_KEYS.PAY].data).toEqual({});
            expect(current[CONST.SEARCH.SEARCH_KEYS.EXPORT].data).toEqual({});
        });

        it('transforms todos reports into SearchResults format', async () => {
            const mockReport: Report = {
                reportID: 'report1',
                policyID: 'policy1',
                chatReportID: 'chat1',
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: 1,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            } as Report;

            const mockTodos: TodosDerivedValue = {
                reportsToSubmit: [mockReport],
                reportsToApprove: [],
                reportsToPay: [],
                reportsToExport: [],
                transactionsByReportID: {},
            };
            await Onyx.set(ONYXKEYS.DERIVED.TODOS, mockTodos);
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useTodos());
            await waitForBatchedUpdatesWithAct();

            const submitData = result.current[CONST.SEARCH.SEARCH_KEYS.SUBMIT].data;
            expect(submitData[`${ONYXKEYS.COLLECTION.REPORT}report1`]).toEqual(mockReport);
        });

        it('computes metadata correctly with transactions', async () => {
            const mockReport: Report = {
                reportID: 'report1',
                type: CONST.REPORT.TYPE.EXPENSE,
            } as Report;

            const mockTransaction: Transaction = {
                transactionID: 'trans1',
                reportID: 'report1',
                groupAmount: 100,
                groupCurrency: 'USD',
            } as Transaction;

            const mockTodos: TodosDerivedValue = {
                reportsToSubmit: [mockReport],
                reportsToApprove: [],
                reportsToPay: [],
                reportsToExport: [],
                transactionsByReportID: {
                    report1: [mockTransaction],
                },
            };

            await act(async () => {
                await Onyx.set(ONYXKEYS.DERIVED.TODOS, mockTodos);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useTodos());
            await waitForBatchedUpdatesWithAct();

            const submitMetadata = result.current[CONST.SEARCH.SEARCH_KEYS.SUBMIT].metadata;
            expect(submitMetadata.count).toBe(1);
            expect(submitMetadata.total).toBe(-100); // groupAmount is subtracted
            expect(submitMetadata.currency).toBe('USD');
        });

        it('includes transactions in the data output', async () => {
            const mockReport: Report = {
                reportID: 'report1',
                type: CONST.REPORT.TYPE.EXPENSE,
            } as Report;

            const mockTransaction: Transaction = {
                transactionID: 'trans1',
                reportID: 'report1',
            } as Transaction;

            const mockTodos: TodosDerivedValue = {
                reportsToSubmit: [mockReport],
                reportsToApprove: [],
                reportsToPay: [],
                reportsToExport: [],
                transactionsByReportID: {
                    report1: [mockTransaction],
                },
            };

            await Onyx.set(ONYXKEYS.DERIVED.TODOS, mockTodos);
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useTodos());
            await waitForBatchedUpdatesWithAct();

            const submitData = result.current[CONST.SEARCH.SEARCH_KEYS.SUBMIT].data;
            expect(submitData[`${ONYXKEYS.COLLECTION.TRANSACTION}trans1`]).toEqual(mockTransaction);
        });

        it('handles multiple transactions for a single report', async () => {
            const mockReport: Report = {
                reportID: 'report1',
                type: CONST.REPORT.TYPE.EXPENSE,
            } as Report;

            const mockTransaction1: Transaction = {
                transactionID: 'trans1',
                reportID: 'report1',
                groupAmount: 50,
                groupCurrency: 'USD',
            } as Transaction;

            const mockTransaction2: Transaction = {
                transactionID: 'trans2',
                reportID: 'report1',
                groupAmount: 75,
                groupCurrency: 'USD',
            } as Transaction;

            const mockTodos: TodosDerivedValue = {
                reportsToSubmit: [mockReport],
                reportsToApprove: [],
                reportsToPay: [],
                reportsToExport: [],
                transactionsByReportID: {
                    report1: [mockTransaction1, mockTransaction2],
                },
            };

            await Onyx.set(ONYXKEYS.DERIVED.TODOS, mockTodos);
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useTodos());
            await waitForBatchedUpdatesWithAct();

            const submitMetadata = result.current[CONST.SEARCH.SEARCH_KEYS.SUBMIT].metadata;
            expect(submitMetadata.count).toBe(2);
            expect(submitMetadata.total).toBe(-125); // -(50 + 75)
        });
    });
});
