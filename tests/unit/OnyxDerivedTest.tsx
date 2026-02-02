/* eslint-disable @typescript-eslint/naming-convention */
import {render} from '@testing-library/react-native';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxMultiSetInput} from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import reportAttributes from '@libs/actions/OnyxDerived/configs/reportAttributes';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import {createRandomCompanyCard, createRandomExpensifyCard} from '../utils/collections/card';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const renderLocaleContextProvider = () => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <View>TEST</View>
        </ComposeProviders>,
    );
};

const onyxDerivedTestSetup = () => {
    Onyx.clear();
    Onyx.init({keys: ONYXKEYS});
    initOnyxDerivedValues();
};

describe('OnyxDerived', () => {
    beforeEach(() => {
        Onyx.clear();
    });

    describe('reportAttributes', () => {
        beforeAll(() => {
            onyxDerivedTestSetup();
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
            renderLocaleContextProvider();
            await waitForBatchedUpdates();

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, mockReport);
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'en');

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
            renderLocaleContextProvider();
            await waitForBatchedUpdates();

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, mockReport);
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'en');

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
            renderLocaleContextProvider();
            await waitForBatchedUpdates();

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, mockReport);
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'es');

            const derivedReportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            expect(derivedReportAttributes).toMatchObject({
                locale: 'es',
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
            reportAttributes.compute([reports, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined], {areAllConnectionsSet: true});
            const reportAttributesComputedValue = reportAttributes.compute([reports, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined], {
                sourceValues: {
                    [ONYXKEYS.COLLECTION.REPORT]: {
                        [`${ONYXKEYS.COLLECTION.REPORT}${reportID1}`]: reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID1}`],
                    },
                    [ONYXKEYS.COLLECTION.TRANSACTION]: {
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
                    },
                },
                areAllConnectionsSet: true,
            }).reports;

            // Then the computed report attributes should contain both reports
            expect(Object.keys(reportAttributesComputedValue)).toEqual([reportID1, reportID2]);
        });

        it('should not recompute reportAttributes when personalDetailsList changes without displayName change', async () => {
            renderLocaleContextProvider();
            await waitForBatchedUpdates();

            // Set up initial state with report and personalDetailsList
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, mockReport);
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'en');
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
            renderLocaleContextProvider();
            await waitForBatchedUpdates();

            // Set up initial state with report and personalDetailsList
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`, mockReport);
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'en');
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
                renderLocaleContextProvider();
                await waitForBatchedUpdates();
                await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'en');
                await waitForBatchedUpdates();

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
            onyxDerivedTestSetup();
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

    describe('todos', () => {
        beforeAll(async () => {
            onyxDerivedTestSetup();
        });

        const CURRENT_USER_ACCOUNT_ID = 1;
        const CURRENT_USER_EMAIL = 'tester@mail.com';
        const OTHER_USER_ACCOUNT_ID = 2;

        const POLICY_ID = 'policy123';
        const POLICY_WITH_CONNECTION_ID = 'policy_with_connection';

        // Helper functions that use collection utilities as base but allow precise control
        const createMockReport = (reportID: string, overrides: Partial<Report> = {}): Report => {
            return {
                reportID,
                chatReportID: `chat_${reportID}`,
                policyID: POLICY_ID,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                managerID: OTHER_USER_ACCOUNT_ID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                type: CONST.REPORT.TYPE.EXPENSE,
                parentReportID: '123',
                parentReportActionID: '456',
                reportName: 'Test Report',
                currency: 'USD',
                isOwnPolicyExpenseChat: false,
                isPinned: false,
                isWaitingOnBankAccount: false,
                ...overrides,
            };
        };

        const createMockPolicy = (policyID: string, overrides: Partial<Policy> = {}): Policy => {
            return {
                id: policyID,
                name: 'Test Policy',
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                role: CONST.POLICY.ROLE.USER,
                ...overrides,
            } as Policy;
        };

        const createMockTransaction = (transactionID: string, reportID: string, overrides: Partial<Transaction> = {}): Transaction => {
            return {
                transactionID,
                reportID,
                amount: 100,
                modifiedAmount: 0,
                reimbursable: true,
                status: CONST.TRANSACTION.STATUS.POSTED,
                currency: 'USD',
                merchant: 'Test Merchant',
                created: '2024-01-01',
                ...overrides,
            } as Transaction;
        };

        it('returns empty object when dependencies are not set', async () => {
            await waitForBatchedUpdates();
            const todos = await OnyxUtils.get(ONYXKEYS.DERIVED.TODOS);
            expect(todos).toEqual({
                reportsToSubmit: [],
                reportsToApprove: [],
                reportsToPay: [],
                reportsToExport: [],
                transactionsByReportID: {},
            });
        });

        describe('categorizes reports correctly', () => {
            const SUBMIT_REPORT_IDS = ['submit_1', 'submit_2', 'submit_3', 'submit_4'];
            const APPROVE_REPORT_IDS = ['approve_1', 'approve_2', 'approve_3'];
            const PAY_REPORT_IDS = ['pay_1', 'pay_2'];
            const EXPORT_REPORT_ID = 'export_1';
            const EXCLUDED_REPORT_IDS = ['excluded_1', 'excluded_2'];

            beforeEach(async () => {
                // Create 4 reports that can be submitted (open, owned by current user, with transactions)
                const reportsToSubmit = SUBMIT_REPORT_IDS.map((id) =>
                    createMockReport(id, {
                        stateNum: CONST.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                    }),
                );

                // Create 3 reports that can be approved (submitted, current user is manager, with transactions)
                const reportsToApprove = APPROVE_REPORT_IDS.map((id) =>
                    createMockReport(id, {
                        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                        ownerAccountID: OTHER_USER_ACCOUNT_ID,
                        managerID: CURRENT_USER_ACCOUNT_ID,
                    }),
                );

                // Create 2 reports that can be paid (approved, current user is admin/payer, with reimbursable transactions)
                const reportsToPay = PAY_REPORT_IDS.map((id) =>
                    createMockReport(id, {
                        stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                        statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                        ownerAccountID: OTHER_USER_ACCOUNT_ID,
                        managerID: CURRENT_USER_ACCOUNT_ID,
                        total: -100,
                        isWaitingOnBankAccount: false,
                    }),
                );

                // Create 1 report that can be exported:
                // - Approved status
                // - User is admin
                // - Policy has a valid accounting connection with auto-sync disabled
                // - Not waiting on bank account
                const reportToExport = createMockReport(EXPORT_REPORT_ID, {
                    policyID: POLICY_WITH_CONNECTION_ID,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                    ownerAccountID: OTHER_USER_ACCOUNT_ID,
                    isWaitingOnBankAccount: false,
                });

                // Create 2 reports that don't fit any condition:
                // 1. A chat report (not expense type)
                // 2. An expense report owned by another user that's not submitted (can't submit, approve, pay, or export)
                const excludedReports = [
                    createMockReport(EXCLUDED_REPORT_IDS.at(0) ?? '', {
                        type: CONST.REPORT.TYPE.CHAT,
                    }),
                    createMockReport(EXCLUDED_REPORT_IDS.at(1) ?? '', {
                        stateNum: CONST.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                        ownerAccountID: OTHER_USER_ACCOUNT_ID,
                        managerID: OTHER_USER_ACCOUNT_ID,
                    }),
                ];

                // Create main policy (for submit, approve, pay reports)
                const policy = createMockPolicy(POLICY_ID, {
                    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                    role: CONST.POLICY.ROLE.ADMIN,
                    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                });

                // Create policy with accounting connection (for export report)
                const policyWithConnection = {
                    ...createMockPolicy(POLICY_WITH_CONNECTION_ID, {
                        role: CONST.POLICY.ROLE.ADMIN,
                    }),
                    connections: {
                        // QuickBooks Online connection with auto-sync disabled
                        [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                            lastSync: {
                                isConnected: true,
                                isSuccessful: true,
                                isAuthenticationError: false,
                                source: 'DIRECT',
                            },
                            config: {
                                autoSync: {
                                    jobID: 'job123',
                                    enabled: false, // Auto-sync disabled so manual export is available
                                },
                            },
                        },
                    },
                } as Policy;

                const transactions: OnyxCollection<Transaction> = {};

                for (const reportID of SUBMIT_REPORT_IDS) {
                    const transactionID = `trans_submit_${reportID}`;
                    transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = createMockTransaction(transactionID, reportID);
                }

                for (const reportID of APPROVE_REPORT_IDS) {
                    const transactionID = `trans_approve_${reportID}`;
                    transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = createMockTransaction(transactionID, reportID);
                }

                for (const reportID of PAY_REPORT_IDS) {
                    const transactionID = `trans_pay_${reportID}`;
                    transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = createMockTransaction(transactionID, reportID);
                }

                const reports: OnyxCollection<Report> = {};
                for (const report of [...reportsToSubmit, ...reportsToApprove, ...reportsToPay, reportToExport, ...excludedReports]) {
                    reports[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = report;
                }

                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {
                        email: CURRENT_USER_EMAIL,
                        accountID: CURRENT_USER_ACCOUNT_ID,
                    },
                    [`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: policy,
                    [`${ONYXKEYS.COLLECTION.POLICY}${POLICY_WITH_CONNECTION_ID}`]: policyWithConnection,
                    ...reports,
                    ...transactions,
                } as OnyxMultiSetInput);

                await waitForBatchedUpdates();
            });

            it('returns correct number of reports for each category', async () => {
                const todos = await OnyxUtils.get(ONYXKEYS.DERIVED.TODOS);

                expect(todos?.reportsToSubmit).toHaveLength(4);
                expect(todos?.reportsToApprove).toHaveLength(3);
                expect(todos?.reportsToPay).toHaveLength(2);
                expect(todos?.reportsToExport).toHaveLength(1);
            });

            it('includes correct report IDs in each category', async () => {
                const todos = await OnyxUtils.get(ONYXKEYS.DERIVED.TODOS);

                const submitReportIDs = todos?.reportsToSubmit.map((r) => r.reportID) ?? [];
                const approveReportIDs = todos?.reportsToApprove.map((r) => r.reportID) ?? [];
                const payReportIDs = todos?.reportsToPay.map((r) => r.reportID) ?? [];
                const exportReportIDs = todos?.reportsToExport.map((r) => r.reportID) ?? [];

                expect(submitReportIDs).toEqual(expect.arrayContaining(SUBMIT_REPORT_IDS));
                expect(approveReportIDs).toEqual(expect.arrayContaining(APPROVE_REPORT_IDS));
                expect(payReportIDs).toEqual(expect.arrayContaining(PAY_REPORT_IDS));
                expect(exportReportIDs).toContain(EXPORT_REPORT_ID);
            });

            it('excludes reports that do not match any category', async () => {
                const todos = await OnyxUtils.get(ONYXKEYS.DERIVED.TODOS);

                const allReportIDs = [
                    ...(todos?.reportsToSubmit.map((r) => r.reportID) ?? []),
                    ...(todos?.reportsToApprove.map((r) => r.reportID) ?? []),
                    ...(todos?.reportsToPay.map((r) => r.reportID) ?? []),
                    ...(todos?.reportsToExport.map((r) => r.reportID) ?? []),
                ];

                expect(allReportIDs).not.toContain(EXCLUDED_REPORT_IDS.at(0));
                expect(allReportIDs).not.toContain(EXCLUDED_REPORT_IDS.at(1));
            });

            it('builds transactionsByReportID mapping correctly', async () => {
                const todos = await OnyxUtils.get(ONYXKEYS.DERIVED.TODOS);

                expect(todos?.transactionsByReportID).toBeDefined();
                const firstSubmitReportID = SUBMIT_REPORT_IDS.at(0) ?? '';
                expect(todos?.transactionsByReportID[firstSubmitReportID]).toHaveLength(1);
                expect(todos?.transactionsByReportID[firstSubmitReportID]?.at(0)?.transactionID).toBe(`trans_submit_${firstSubmitReportID}`);
                expect(todos?.transactionsByReportID[APPROVE_REPORT_IDS.at(0) ?? '']).toHaveLength(1);
                expect(todos?.transactionsByReportID[PAY_REPORT_IDS.at(0) ?? '']).toHaveLength(1);
            });

            it('handles reports with multiple transactions', async () => {
                // Add a second transaction to one of the submit reports
                const reportID = SUBMIT_REPORT_IDS.at(0) ?? '';
                const secondTransactionID = `trans_submit_${reportID}_2`;
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${secondTransactionID}`, createMockTransaction(secondTransactionID, reportID));
                await waitForBatchedUpdates();

                const todos = await OnyxUtils.get(ONYXKEYS.DERIVED.TODOS);

                expect(todos?.transactionsByReportID[reportID]).toHaveLength(2);
                expect(todos?.transactionsByReportID[reportID]?.map((t) => t.transactionID)).toEqual(expect.arrayContaining([`trans_submit_${reportID}`, secondTransactionID]));
            });

            it('handles reports without transactions', async () => {
                const reportWithoutTransactions = createMockReport('no_transactions_report', {
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                });

                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportWithoutTransactions.reportID}`, reportWithoutTransactions);
                await waitForBatchedUpdates();

                const todos = await OnyxUtils.get(ONYXKEYS.DERIVED.TODOS);

                // The report should still be categorized, but transactionsByReportID should be undefined
                expect(todos?.transactionsByReportID[reportWithoutTransactions.reportID]).toBeUndefined();
            });

            it('updates when report state changes', async () => {
                // Start with a report that can be submitted
                const reportID = SUBMIT_REPORT_IDS.at(0);
                let todos = await OnyxUtils.get(ONYXKEYS.DERIVED.TODOS);
                expect(todos?.reportsToSubmit.map((r) => r.reportID)).toContain(reportID);

                // Change the report to submitted state
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                });
                await waitForBatchedUpdates();

                todos = await OnyxUtils.get(ONYXKEYS.DERIVED.TODOS);

                // The report should no longer be in reportsToSubmit
                expect(todos?.reportsToSubmit.map((r) => r.reportID)).not.toContain(reportID);
            });

            it('updates when transaction is added', async () => {
                // Add a transaction to a report that previously had none
                const reportID = 'new_report_with_transaction';
                const report = createMockReport(reportID, {
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                });

                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
                await waitForBatchedUpdates();

                let todos = await OnyxUtils.get(ONYXKEYS.DERIVED.TODOS);
                expect(todos?.transactionsByReportID[reportID] ?? []).toEqual([]);

                const transactionID = `trans_${reportID}`;
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, createMockTransaction(transactionID, reportID));
                await waitForBatchedUpdates();

                todos = await OnyxUtils.get(ONYXKEYS.DERIVED.TODOS);
                expect(todos?.transactionsByReportID[reportID]).toHaveLength(1);
                expect(todos?.transactionsByReportID[reportID]?.at(0)?.transactionID).toBe(transactionID);
            });
        });
    });
});
