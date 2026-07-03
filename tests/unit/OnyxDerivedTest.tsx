/* eslint-disable @typescript-eslint/naming-convention */
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxUpdate} from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import reportAttributes from '@libs/actions/OnyxDerived/configs/reportAttributes';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import * as OnyxDerivedUtils from '@userActions/OnyxDerived/utils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import {createRandomCompanyCard, createRandomExpensifyCard} from '../utils/collections/card';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
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
            // Derived recomputes are coalesced onto a macrotask; pump it so the locale change is applied.
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

            it('recomputes a derived value only ONCE for a single Onyx.update touching several of its dependencies', async () => {
                // Prime so the derived value is populated and connections are warm.
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, mockReport);
                await waitForBatchedUpdates();

                const setDerivedValueSpy = jest.spyOn(OnyxDerivedUtils, 'setDerivedValue');

                // One logical update touching 3 different reportAttributes dependencies at once.
                const updates: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [
                    {onyxMethod: Onyx.METHOD.MERGE_COLLECTION, key: ONYXKEYS.COLLECTION.REPORT, value: {[`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`]: {reportName: 'Renamed report'}}},
                    {onyxMethod: Onyx.METHOD.MERGE_COLLECTION, key: ONYXKEYS.COLLECTION.TRANSACTION, value: {[`${ONYXKEYS.COLLECTION.TRANSACTION}1`]: createRandomTransaction(1)}},
                    {onyxMethod: Onyx.METHOD.MERGE_COLLECTION, key: ONYXKEYS.COLLECTION.REPORT_METADATA, value: {[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${mockReport.reportID}`]: {isOptimisticReport: false}}},
                ];
                await Onyx.update(updates);
                await waitForBatchedUpdates();

                // Without coalescing this would be one recompute per changed dependency (3).
                expect(countRecomputes(setDerivedValueSpy, ONYXKEYS.DERIVED.REPORT_ATTRIBUTES)).toBe(1);

                // And the coalesced compute must not drop any of the batched changes.
                const derived = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);
                expect(derived?.reports?.[mockReport.reportID]?.reportName).toBe('Renamed report');

                setDerivedValueSpy.mockRestore();
            });

            it('coalesces several separate Onyx.merge calls in the same tick into a single recompute', async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, mockReport);
                await waitForBatchedUpdates();

                const setDerivedValueSpy = jest.spyOn(OnyxDerivedUtils, 'setDerivedValue');

                // Separate merges to different dependencies, fired synchronously (not awaited between).
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, {reportName: 'Renamed again'});
                Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, createRandomTransaction(1));
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${mockReport.reportID}`, {isOptimisticReport: false});
                await waitForBatchedUpdates();

                expect(countRecomputes(setDerivedValueSpy, ONYXKEYS.DERIVED.REPORT_ATTRIBUTES)).toBe(1);

                setDerivedValueSpy.mockRestore();
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
