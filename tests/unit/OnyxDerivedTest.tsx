import reportAttributes from '@libs/actions/OnyxDerived/configs/reportAttributes';

import initOnyxDerivedValues from '@userActions/OnyxDerived';
import * as OnyxDerivedUtils from '@userActions/OnyxDerived/utils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction, TransactionViolation, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxCollection, OnyxUpdate} from 'react-native-onyx';

/* eslint-disable @typescript-eslint/naming-convention */
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

import {createRandomCompanyCard, createRandomExpensifyCard} from '../utils/collections/card';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import {createMockReport, getFakeReportAction} from '../utils/ReportTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const onyxDerivedTestSetup = () => {
    Onyx.init({keys: ONYXKEYS});
    initOnyxDerivedValues();
};

describe('OnyxDerived', () => {
    beforeAll(async () => {
        onyxDerivedTestSetup();
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    describe('reportAttributes', () => {
        beforeAll(async () => {
            await IntlStore.load(CONST.LOCALES.EN);
            await waitForBatchedUpdates();
        });

        beforeEach(async () => {
            await Onyx.set(ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING, false);
            await waitForBatchedUpdates();
        });

        const mockReport: Report = {
            reportID: `test_1`,
            reportName: 'Test Report',
            type: 'chat',
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            lastVisibleActionCreated: '2023-01-01T00:00:00.000Z',
            lastMessageText: 'Test message',
            lastActorAccountID: 1,
            lastMessageHtml: '<p>Test message</p>',
            policyID: '123',
            ownerAccountID: 1,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };

        it('returns empty reports when dependencies are not set', async () => {
            await waitForBatchedUpdates();
            const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
            expect(derivedReportAttributes).toMatchObject({
                reports: {},
            });
        });

        it('computes report attributes when reports are set', async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, mockReport);
            await waitForBatchedUpdates();

            const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            expect(derivedReportAttributes).toMatchObject({
                reports: {
                    [mockReport.reportID]: {
                        reportName: mockReport.reportName,
                    },
                },
            });
        });

        it('should clear the report attributes when the report is cleared', async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, mockReport);
            await waitForBatchedUpdates();

            let derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            expect(derivedReportAttributes).toMatchObject({
                reports: {
                    [mockReport.reportID]: {
                        reportName: mockReport.reportName,
                    },
                },
            });

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, null);

            derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            expect(derivedReportAttributes).toMatchObject({
                reports: {},
            });
        });

        it('updates when locale changes', async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, mockReport);
            await IntlStore.load(CONST.LOCALES.ES);
            // Derived recomputes are coalesced onto a microtask; pump it so the locale change is applied.
            await waitForBatchedUpdates();

            const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            expect(derivedReportAttributes).toMatchObject({
                locale: 'es',
            });
        });

        describe('coalescing', () => {
            // Each flush/recompute writes the derived value exactly once via setDerivedValue, so counting
            // its calls for a given derived key = counting how many times that value was recomputed.
            const countRecomputes = (spy: jest.SpyInstance, derivedKey: string) => spy.mock.calls.filter(([calledKey]) => calledKey === derivedKey).length;

            it('coalesces the dependency changes from a single Onyx.update batch (without dropping any)', async () => {
                // Prime so the derived value is populated and connections are warm.
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, mockReport);
                await waitForBatchedUpdates();

                const setDerivedValueSpy = jest.spyOn(OnyxDerivedUtils, 'setDerivedValue');

                // One logical update touching 3 different reportAttributes dependencies at once.
                const updates: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
                    {
                        onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
                        key: ONYXKEYS.COLLECTION.REPORT,
                        value: {[`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`]: {reportName: 'Renamed report'}},
                    },
                    {onyxMethod: Onyx.METHOD.MERGE_COLLECTION, key: ONYXKEYS.COLLECTION.TRANSACTION, value: {[`${ONYXKEYS.COLLECTION.TRANSACTION}1`]: createRandomTransaction(1)}},
                    {
                        onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
                        key: ONYXKEYS.COLLECTION.REPORT_METADATA,
                        value: {[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${mockReport.reportID}`]: {isOptimisticReport: false}},
                    },
                ];
                await Onyx.update(updates);
                await waitForBatchedUpdates();

                // Microtask flushing coalesces the changes delivered within a synchronous broadcast burst, so
                // this recomputes fewer times than one-per-changed-dependency (3). We assert it's reduced rather
                // than a brittle exact count, because Onyx.update can span a couple of microtask turns and a
                // microtask flush does not batch across Onyx's async pipeline.
                expect(countRecomputes(setDerivedValueSpy, ONYXKEYS.DERIVED.REPORT_ATTRIBUTES)).toBeLessThan(3);

                // And the coalesced compute must not drop any of the batched changes.
                const derived = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
                expect(derived?.reports?.[mockReport.reportID]?.reportName).toBe('Renamed report');

                setDerivedValueSpy.mockRestore();
            });

            it('applies every change from separate merges in the same tick without dropping any', async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, mockReport);
                await waitForBatchedUpdates();

                // Separate merges to different dependencies, fired synchronously (not awaited between). Microtask
                // flushing intentionally does NOT batch these into a single recompute — batching across ticks would
                // require deferring the flush past render, reintroducing stale-frame reads. The invariant that must
                // hold is that no update is dropped: every change is reflected in the final derived value.
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, {reportName: 'Renamed again'});
                Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, createRandomTransaction(1));
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${mockReport.reportID}`, {isOptimisticReport: false});
                await waitForBatchedUpdates();

                const derived = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
                expect(derived?.reports?.[mockReport.reportID]?.reportName).toBe('Renamed again');
            });
        });

        it('should contain both report attributes update when there are report and transaction updates', async () => {
            await waitForBatchedUpdates();
            // Given 2 reports and 1 transaction
            const reportID1 = '0';
            const reportID2 = '1';
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}${reportID1}`]: createRandomReport(Number(reportID1), undefined),
                [`${ONYXKEYS.COLLECTION.REPORT}${reportID2}`]: createRandomReport(Number(reportID2), undefined),
            };
            const transaction = createRandomTransaction(1);

            // When the report attributes are recomputed with both report and transaction updates
            reportAttributes.compute(
                [reports, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
                {},
            );
            const reportAttributesComputedValue = reportAttributes.compute(
                [reports, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
                {
                    sourceValues: {
                        [ONYXKEYS.COLLECTION.REPORT]: {
                            [`${ONYXKEYS.COLLECTION.REPORT}${reportID1}`]: reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID1}`],
                        },
                        [ONYXKEYS.COLLECTION.TRANSACTION]: {
                            [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
                        },
                    },
                },
            ).reports;

            // Then the computed report attributes should contain both reports
            expect(Object.keys(reportAttributesComputedValue)).toEqual([reportID1, reportID2]);
        });

        it('should not recompute reportAttributes when personalDetailsList changes without displayName change', async () => {
            // Set up initial state with report and personalDetailsList
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, mockReport);
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                '1': {
                    accountID: 1,
                    displayName: 'John Doe',
                    login: 'john.doe@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                },
            });
            await waitForBatchedUpdates();

            // Get initial computed value
            const initialDerivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            // Spy on generateReportAttributes - this function should NOT be called
            // when the optimization kicks in and skips the computation
            const generateReportAttributesSpy = jest.spyOn(require('@libs/ReportUtils'), 'generateReportAttributes');

            // Change only the login (not displayName) - this should trigger the optimization
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                '1': {
                    login: 'john.newemail@example.com',
                },
            });
            await waitForBatchedUpdates();

            // The generateReportAttributes function should not have been called
            // because the optimization should have returned early
            expect(generateReportAttributesSpy).not.toHaveBeenCalled();

            // Get the computed value after login change
            const derivedReportAttributesAfterLoginChange = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            // And the values should be preserved correctly
            expect(derivedReportAttributesAfterLoginChange).toEqual(initialDerivedReportAttributes);

            generateReportAttributesSpy.mockRestore();
        });

        it('should recompute reportAttributes when personalDetailsList displayName changes', async () => {
            // Set up initial state with report and personalDetailsList
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, mockReport);
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                '1': {
                    accountID: 1,
                    displayName: 'John Doe',
                    login: 'john.doe@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                },
            });
            await waitForBatchedUpdates();

            // Get initial computed value reference
            const initialDerivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            // Change the displayName - this should trigger full recomputation
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                '1': {
                    displayName: 'Jane Doe',
                    firstName: 'Jane',
                },
            });
            await waitForBatchedUpdates();

            // Get the computed value after displayName change
            const derivedReportAttributesAfterDisplayNameChange = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            // The computed value should not be the same object (new computation happened)
            expect(derivedReportAttributesAfterDisplayNameChange).not.toBe(initialDerivedReportAttributes);
        });

        it('should only recompute reports that reference the changed accountID when a display name changes', () => {
            // Two reports: one owned by account 2, the other owned by account 3.
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}ref_report`]: {...mockReport, reportID: 'ref_report', ownerAccountID: 2},
                [`${ONYXKEYS.COLLECTION.REPORT}unrelated_report`]: {...mockReport, reportID: 'unrelated_report', policyID: '456', ownerAccountID: 3},
            };
            const personalDetails = {
                '2': {accountID: 2, displayName: 'Alice', login: 'alice@example.com'},
                '3': {accountID: 3, displayName: 'Bob', login: 'bob@example.com'},
            };
            const changedPersonalDetails = {...personalDetails, '2': {accountID: 2, displayName: 'Alice Smith', login: 'alice@example.com'}};

            // PERSONAL_DETAILS_LIST is a valid runtime source key (hasKeyTriggeredCompute reads it), but the
            // sourceValues type only models collection keys, so there's no representable type for this marker.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- non-collection source keys aren't modeled by DerivedSourceValues
            const personalDetailsSource = {
                sourceValues: {[ONYXKEYS.PERSONAL_DETAILS_LIST]: true},
                triggeredKeys: new Set([ONYXKEYS.PERSONAL_DETAILS_LIST]),
            } as unknown as Parameters<typeof reportAttributes.compute>[1];

            // Reset the module-level diff baseline (no sourceValues clears it) so the seed below is deterministic.
            reportAttributes.compute(
                [reports, undefined, undefined, undefined, undefined, undefined, personalDetails, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
                {},
            );
            // First personal-details compute computes both reports (no prior currentValue) and seeds the baseline.
            const initial = reportAttributes.compute(
                [reports, undefined, undefined, undefined, undefined, undefined, personalDetails, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
                personalDetailsSource,
            );
            // Changing only account 2's display name should recompute just its report, carrying the other by reference.
            const afterChange = reportAttributes.compute(
                [reports, undefined, undefined, undefined, undefined, undefined, changedPersonalDetails, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
                {...personalDetailsSource, currentValue: initial},
            );

            // A recomputed report gets a brand-new object; an untouched report is carried over by reference.
            expect(afterChange.reports.ref_report).not.toBe(initial.reports.ref_report);
            expect(afterChange.reports.unrelated_report).toBe(initial.reports.unrelated_report);
        });

        describe('reportErrors', () => {
            it('returns empty errors when no errors exist', async () => {
                const report = createRandomReport(1, undefined);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await waitForBatchedUpdates();

                const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
                expect(derivedReportAttributes?.reports[report.reportID].reportErrors).toEqual({});
            });

            it('combines report error fields with report action errors', async () => {
                const report = {
                    ...createRandomReport(1, undefined),
                    errorFields: {
                        field1: {
                            '1234567890': 'Error message 1',
                        },
                    },
                };

                const reportActions: ReportActions = {
                    '1': {
                        reportActionID: '1',
                        actionName: 'ADDCOMMENT',
                        created: '2024-01-01',
                        message: [{html: 'some content', text: 'some content', type: 'text'}],
                        errors: {
                            field2: {
                                '1234567891': 'Error message 2',
                            },
                        },
                    },
                };

                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, reportActions);

                await waitForBatchedUpdates();

                const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

                await waitForBatchedUpdates();

                expect(derivedReportAttributes?.reports[report.reportID].reportErrors).toEqual({
                    '1234567890': 'Error message 1',
                    '1234567891': 'Error message 2',
                });
            });

            it('handles multiple error sources', async () => {
                const report = {
                    ...createRandomReport(1, undefined),
                    errorFields: {
                        field1: {
                            '1234567890': 'Error message 1',
                        },
                        field2: {
                            '1234567891': 'Error message 2',
                        },
                    },
                };

                const reportActions: ReportActions = {
                    '1': {
                        reportActionID: '1',
                        actionName: 'ADDCOMMENT',
                        created: '2024-01-01',
                        message: [{html: 'some content', text: 'some content', type: 'text'}],
                        errors: {
                            field3: {
                                '1234567892': 'Error message 3',
                            },
                        },
                    },
                    '2': {
                        reportActionID: '2',
                        actionName: 'ADDCOMMENT',
                        created: '2024-01-01',
                        message: [{html: 'some content', text: 'some content', type: 'text'}],
                        errors: {
                            field4: {
                                '1234567893': 'Error message 4',
                            },
                        },
                    },
                };

                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, reportActions);
                await waitForBatchedUpdates();

                const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
                expect(derivedReportAttributes?.reports[report.reportID].reportErrors).toEqual({
                    '1234567890': 'Error message 1',
                    '1234567891': 'Error message 2',
                    '1234567892': 'Error message 3',
                    '1234567893': 'Error message 4',
                });
            });

            it('handles empty error objects in sources', async () => {
                const report = {
                    ...createRandomReport(1, undefined),
                    errorFields: {
                        field1: {},
                        field2: {
                            '1234567890': 'Error message 1',
                        },
                    },
                };

                const reportActions: ReportActions = {
                    '1': {
                        reportActionID: '1',
                        actionName: 'ADDCOMMENT',
                        created: '2024-01-01',
                        message: [{html: 'some content', text: 'some content', type: 'text'}],
                        errors: {},
                    },
                    '2': {
                        reportActionID: '2',
                        actionName: 'ADDCOMMENT',
                        created: '2024-01-01',
                        message: [{html: 'some content', text: 'some content', type: 'text'}],
                        errors: {
                            field3: {
                                '1234567891': 'Error message 2',
                            },
                        },
                    },
                };

                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, reportActions);
                await waitForBatchedUpdates();

                const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
                expect(derivedReportAttributes?.reports[report.reportID].reportErrors).toEqual({
                    '1234567890': 'Error message 1',
                    '1234567891': 'Error message 2',
                });
            });
        });

        describe('RBR propagation for IOU reports', () => {
            it('should correctly propagate and resolve RBR for IOU reports', async () => {
                const parentReport = createRandomReport(2, undefined);
                const iouReport = {
                    ...createRandomReport(2, undefined),
                    chatReportID: parentReport.reportID,
                    ownerAccountID: 1,
                    type: CONST.REPORT.TYPE.IOU,
                    errorFields: {
                        generic: {
                            '1234567890': 'Generic error',
                        },
                    },
                };

                // --- Setup ---
                // Set the reports in Onyx.
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`, parentReport);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
                await waitForBatchedUpdates();

                // --- Assertion 1: Propagation Works ---
                // The parent report should have an error RBR because the child IOU report has an error.
                let derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
                expect(derivedReportAttributes?.reports[parentReport.reportID].brickRoadStatus).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);

                // --- Action: Resolve Error ---
                // Remove the error from the IOU report. This will trigger a partial update.
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, {errorFields: null});
                await waitForBatchedUpdates();

                // --- Assertion 2: RBR is Cleared ---
                // The parent report's RBR should be cleared now that the child's error is gone.
                derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
                expect(derivedReportAttributes?.reports[parentReport.reportID].brickRoadStatus).toBeUndefined();
            });
        });
    });

    describe('reportTransactionsAndViolations', () => {
        it('keeps a violations-only change for one transaction when coalesced with a transaction change for another', async () => {
            const transactionA: Transaction = {...createRandomTransaction(1), transactionID: 'A', reportID: 'rA', amount: 100};
            const transactionB: Transaction = {...createRandomTransaction(2), transactionID: 'B', reportID: 'rB', amount: 200};

            // Prime so both transactions are tracked and the connections are warm.
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.TRANSACTION}A` as const]: transactionA,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}B` as const]: transactionB,
            });
            await waitForBatchedUpdates();

            const violation: TransactionViolation = {type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY};

            // One logical update: transaction A changes AND violations change for transaction B.
            const updates: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = [
                {onyxMethod: Onyx.METHOD.MERGE_COLLECTION, key: ONYXKEYS.COLLECTION.TRANSACTION, value: {[`${ONYXKEYS.COLLECTION.TRANSACTION}A`]: {amount: 999}}},
                {onyxMethod: Onyx.METHOD.MERGE_COLLECTION, key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, value: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}B`]: [violation]}},
            ];
            await Onyx.update(updates);
            await waitForBatchedUpdates();

            const derived = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS);

            // The batched violations change for B must not be dropped...
            expect(derived?.rB?.violations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}B`]).toEqual([violation]);
            // ...and the transaction change for A must also land.
            expect(derived?.rA?.transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}A`]?.amount).toBe(999);
        });
    });

    describe('sortedReportActions', () => {
        it('applies a REPORT change that is coalesced with a REPORT_ACTIONS change for another report', async () => {
            const chatReportID = '10';
            const expenseReportID = '20';
            const parentChatReportID = '30';
            const threadReportID = '40';

            const iouAction = getFakeReportAction(100, {
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportID: threadReportID,
                reportID: expenseReportID,
                originalMessage: {IOUTransactionID: 'txn1', type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, amount: 100, currency: 'USD'},
            } as Partial<ReportAction>);

            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}` as const]: createMockReport({reportID: chatReportID, type: CONST.REPORT.TYPE.CHAT}),
                // The expense report starts as a CHAT, so its one-transaction thread does not resolve yet.
                [`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}` as const]: createMockReport({reportID: expenseReportID, type: CONST.REPORT.TYPE.CHAT, chatReportID: parentChatReportID}),
                [`${ONYXKEYS.COLLECTION.REPORT}${parentChatReportID}` as const]: createMockReport({reportID: parentChatReportID, type: CONST.REPORT.TYPE.CHAT}),
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}` as const]: {'1': getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT})},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReportID}` as const]: {'100': iouAction},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}` as const]: {'200': getFakeReportAction(200, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT})},
            });
            await waitForBatchedUpdates();

            // Precondition: while it is a CHAT, no transaction thread is resolved for the report.
            let derived = await OnyxUtils.get(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS);
            expect(derived?.transactionThreadIDs?.[expenseReportID]).toBeUndefined();

            // One logical update: flip the report to EXPENSE (a REPORT change that resolves its thread) batched
            // with an unrelated REPORT_ACTIONS change to a different report.
            const updates: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
                {onyxMethod: Onyx.METHOD.MERGE_COLLECTION, key: ONYXKEYS.COLLECTION.REPORT, value: {[`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`]: {type: CONST.REPORT.TYPE.EXPENSE}}},
                {
                    onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    value: {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`]: {'2': getFakeReportAction(2, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT})}},
                },
            ];
            await Onyx.update(updates);
            await waitForBatchedUpdates();

            // The batched REPORT change must be applied: the expense report's transaction thread now resolves.
            derived = await OnyxUtils.get(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS);
            expect(derived?.transactionThreadIDs?.[expenseReportID]).toBe(threadReportID);
        });
    });

    describe('nonPersonalAndWorkspaceCardList', () => {
        beforeAll(async () => {
            // Initialize dependency keys so Onyx.clear() in beforeEach triggers derived value recomputation
            await Onyx.set(ONYXKEYS.CARD_LIST, {});
            await waitForBatchedUpdates();
        });

        it('returns empty object when dependencies are not set', async () => {
            await waitForBatchedUpdates();
            const derivedCardList = await OnyxUtils.get(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST);
            expect(derivedCardList).toEqual({});
        });

        it('merges cardList and workspaceCardFeeds when dependencies are set', async () => {
            // Non-personal cards (fundID !== '0') from cardList are kept, workspace cards are always included
            const nonPersonalCard1 = createRandomExpensifyCard(1, {fundID: '123'});
            const nonPersonalCard2 = createRandomExpensifyCard(2, {fundID: '456'});
            const workspaceCard3 = createRandomCompanyCard(3, {bank: 'vcf'});

            await Onyx.set(ONYXKEYS.CARD_LIST, {
                '1': nonPersonalCard1,
                '2': nonPersonalCard2,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}workspace_123`, {
                '3': workspaceCard3,
            });
            await waitForBatchedUpdates();
            const derivedCardList = await OnyxUtils.get(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST);

            expect(derivedCardList).toMatchObject({
                '1': expect.objectContaining({cardID: 1}),
                '2': expect.objectContaining({cardID: 2}),
                '3': expect.objectContaining({cardID: 3}),
            });
        });

        it('filters out personal cards from cardList when dependencies are set', async () => {
            const nonPersonalCard = createRandomExpensifyCard(1, {fundID: '123'});
            const personalCard = createRandomExpensifyCard(2, {fundID: '0'});
            const workspaceCard = createRandomCompanyCard(3, {bank: 'vcf'});

            await Onyx.set(ONYXKEYS.CARD_LIST, {
                '1': nonPersonalCard,
                '2': personalCard,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}workspace_123`, {
                '3': workspaceCard,
            });
            await waitForBatchedUpdates();
            const derivedCardList = await OnyxUtils.get(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST);

            expect(derivedCardList?.['1']).toBeDefined();
            expect(derivedCardList?.['1']).toMatchObject({cardID: 1});
            expect(derivedCardList?.['2']).toBeUndefined();
            expect(derivedCardList?.['3']).toBeDefined();
            expect(derivedCardList?.['3']).toMatchObject({cardID: 3});
        });

        it('handles empty cardList when workspaceCardFeeds are set', async () => {
            const workspaceCard = createRandomCompanyCard(1, {bank: 'vcf'});

            await Onyx.set(ONYXKEYS.CARD_LIST, {});
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}workspace_123`, {
                '1': workspaceCard,
            });
            await waitForBatchedUpdates();
            const derivedCardList = await OnyxUtils.get(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST);

            expect(derivedCardList).toMatchObject({
                '1': expect.objectContaining({cardID: 1}),
            });
        });

        it('handles empty workspaceCardFeeds when cardList is set', async () => {
            const nonPersonalCard = createRandomExpensifyCard(1, {fundID: '123'});

            await Onyx.set(ONYXKEYS.CARD_LIST, {
                '1': nonPersonalCard,
            });
            await waitForBatchedUpdates();
            const derivedCardList = await OnyxUtils.get(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST);

            expect(derivedCardList).toMatchObject({
                '1': expect.objectContaining({cardID: 1}),
            });
        });

        it('includes cards from multiple workspace feeds when dependencies are set', async () => {
            const card1 = createRandomCompanyCard(1, {bank: 'vcf'});
            const card2 = createRandomCompanyCard(2, {bank: 'stripe'});

            await Onyx.set(ONYXKEYS.CARD_LIST, {});
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}workspace_123`, {
                '1': card1,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}workspace_456`, {
                '2': card2,
            });
            await waitForBatchedUpdates();
            const derivedCardList = await OnyxUtils.get(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST);

            expect(derivedCardList).toMatchObject({
                '1': expect.objectContaining({cardID: 1}),
                '2': expect.objectContaining({cardID: 2}),
            });
        });
    });

    describe('personalAndWorkspaceCardList', () => {
        it('merges cardList and workspaceCardFeeds when dependencies are set', async () => {
            // Non-personal cards (fundID !== '0') from cardList are kept, workspace cards are always included
            const nonPersonalCard1 = createRandomExpensifyCard(1, {fundID: '123'});
            const nonPersonalCard2 = createRandomExpensifyCard(2, {fundID: '456'});
            const personalCard = createRandomExpensifyCard(3, {fundID: '0'});
            const workspaceCard3 = createRandomCompanyCard(4, {bank: 'vcf'});

            await Onyx.set(ONYXKEYS.CARD_LIST, {
                '1': nonPersonalCard1,
                '2': nonPersonalCard2,
                '3': personalCard,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}workspace_123`, {
                '4': workspaceCard3,
            });
            await waitForBatchedUpdates();
            const derivedCardList = await OnyxUtils.get(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);

            expect(derivedCardList).toMatchObject({
                '1': expect.objectContaining({cardID: 1}),
                '2': expect.objectContaining({cardID: 2}),
                '3': expect.objectContaining({cardID: 3}),
                '4': expect.objectContaining({cardID: 4}),
            });
        });

        it('handles empty cardList when workspaceCardFeeds are set', async () => {
            const workspaceCard = createRandomCompanyCard(1, {bank: 'vcf'});

            await Onyx.set(ONYXKEYS.CARD_LIST, {});
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}workspace_123`, {
                '1': workspaceCard,
            });
            await waitForBatchedUpdates();
            const derivedCardList = await OnyxUtils.get(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);

            expect(derivedCardList).toMatchObject({
                '1': expect.objectContaining({cardID: 1}),
            });
        });

        it('handles empty workspaceCardFeeds when cardList is set', async () => {
            const nonPersonalCard = createRandomExpensifyCard(1, {fundID: '123'});

            await Onyx.set(ONYXKEYS.CARD_LIST, {
                '1': nonPersonalCard,
            });
            await waitForBatchedUpdates();
            const derivedCardList = await OnyxUtils.get(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);

            expect(derivedCardList).toMatchObject({
                '1': expect.objectContaining({cardID: 1}),
            });
        });

        it('includes cards from multiple workspace feeds when dependencies are set', async () => {
            const card1 = createRandomCompanyCard(1, {bank: 'vcf'});
            const card2 = createRandomCompanyCard(2, {bank: 'stripe'});

            await Onyx.set(ONYXKEYS.CARD_LIST, {});
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}workspace_123`, {
                '1': card1,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}workspace_456`, {
                '2': card2,
            });
            await waitForBatchedUpdates();
            const derivedCardList = await OnyxUtils.get(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST);

            expect(derivedCardList).toMatchObject({
                '1': expect.objectContaining({cardID: 1}),
                '2': expect.objectContaining({cardID: 2}),
            });
        });
    });
});
