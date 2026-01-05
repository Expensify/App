import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {createTransaction, handleMoneyRequestStepDistanceNavigation} from '@libs/actions/IOU/MoneyRequest';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getParticipantsOption, getReportOption} from '@libs/OptionsListUtils';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import CONST from '@src/CONST';
import * as TransactionUtils from '@src/libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {QuickAction, Transaction} from '@src/types/onyx';
import type {SplitShares} from '@src/types/onyx/Transaction';
import * as IOU from '../../../src/libs/actions/IOU';
import createRandomPolicy from '../../utils/collections/policies';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/IOU', () => ({
    requestMoney: jest.fn(),
    trackExpense: jest.fn(),
    createDistanceRequest: jest.fn(),
    resetSplitShares: jest.fn(),
    setMoneyRequestPendingFields: jest.fn(),
    setMoneyRequestMerchant: jest.fn(),
    setCustomUnitRateID: jest.fn(),
    getMoneyRequestParticipantsFromReport: jest.fn(() => [{accountID: 1, login: 'test@test.com'}]),
    setMoneyRequestParticipantsFromReport: jest.fn(() => Promise.resolve()),
}));

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));

jest.mock('@src/libs/DistanceRequestUtils', () => ({
    getCustomUnitRateID: jest.fn(),
}));

describe('MoneyRequest', () => {
    const currentUserAccountID = 5;

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END]: null,
            },
        });
        return waitForBatchedUpdates();
    });

    describe('createTransaction', () => {
        const fakeTransaction = createRandomTransaction(1);
        const fakeReport = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);

        const fileObj = new File([new Blob(['test'])], 'test.jpg', {type: 'image/jpeg'});
        const fakeReceiptFile: ReceiptFile = {transactionID: fakeTransaction.transactionID, file: fileObj, source: 12345};
        const fakeQuickAction: OnyxEntry<QuickAction> = {
            action: CONST.QUICK_ACTIONS.ASSIGN_TASK,
            chatReportID: 'quick_action_chat_123',
            targetAccountID: 789,
        };

        const baseParams = {
            transactions: [fakeTransaction],
            iouType: CONST.IOU.TYPE.REQUEST,
            report: fakeReport,
            currentUserAccountID: 111,
            currentUserEmail: 'test@example.com',
            shouldGenerateTransactionThreadReport: false,
            isASAPSubmitBetaEnabled: false,
            transactionViolations: {},
            files: [fakeReceiptFile],
            participant: {accountID: 222, login: 'test@test.com'},
            quickAction: fakeQuickAction,
        };

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should call trackExpense for TRACK iouType', () => {
            createTransaction({
                ...baseParams,
                iouType: CONST.IOU.TYPE.TRACK,
            });

            expect(IOU.trackExpense).toHaveBeenCalledTimes(1);
            expect(IOU.requestMoney).toHaveBeenCalledTimes(0);

            expect(IOU.trackExpense).toHaveBeenCalledWith(
                expect.objectContaining({
                    report: fakeReport,
                    isDraftPolicy: false,
                    participantParams: expect.objectContaining({
                        payeeEmail: 'test@example.com',
                        payeeAccountID: 111,
                        participant: expect.objectContaining({accountID: 222, login: 'test@test.com'}),
                    }),
                    transactionParams: expect.objectContaining({
                        amount: 0,
                        currency: fakeTransaction.currency,
                        created: fakeTransaction.created,
                        receipt: expect.objectContaining({
                            source: fakeReceiptFile.source,
                            state: CONST.IOU.RECEIPT_STATE.SCAN_READY,
                        }),
                        billable: undefined,
                        reimbursable: true,
                        gpsPoint: undefined,
                    }),
                    shouldHandleNavigation: true,
                    isASAPSubmitBetaEnabled: false,
                }),
            );

            expect(IOU.trackExpense).toHaveBeenLastCalledWith(expect.objectContaining({shouldHandleNavigation: true}));
        });

        it('should call requestMoney for non-TRACK (SEND) iouType', () => {
            createTransaction({
                ...baseParams,
                iouType: CONST.IOU.TYPE.SEND,
            });

            expect(IOU.requestMoney).toHaveBeenCalledTimes(1);
            expect(IOU.trackExpense).toHaveBeenCalledTimes(0);

            expect(IOU.requestMoney).toHaveBeenCalledWith(
                expect.objectContaining({
                    report: fakeReport,
                    participantParams: expect.objectContaining({
                        payeeEmail: 'test@example.com',
                        payeeAccountID: 111,
                        participant: expect.objectContaining({accountID: 222, login: 'test@test.com'}),
                    }),
                    gpsPoint: undefined,
                    transactionParams: expect.objectContaining({
                        amount: 0,
                        created: fakeTransaction.created,
                        currency: fakeTransaction.currency,
                        attendees: fakeTransaction.comment?.attendees,
                        merchant: '',
                        receipt: expect.objectContaining({
                            source: fakeReceiptFile.source,
                            state: CONST.IOU.RECEIPT_STATE.SCAN_READY,
                        }),
                        billable: undefined,
                        reimbursable: true,
                    }),
                    shouldHandleNavigation: true,
                    backToReport: undefined,
                    shouldGenerateTransactionThreadReport: false,
                    isASAPSubmitBetaEnabled: false,
                    currentUserAccountIDParam: 111,
                    currentUserEmailParam: 'test@example.com',
                    transactionViolations: {},
                }),
            );
        });

        it('should pass shouldHandleNavigation as true for last file only', () => {
            const files = [
                {...fakeReceiptFile, transactionID: '111'},
                {...fakeReceiptFile, transactionID: '222'},
                {...fakeReceiptFile, transactionID: '333'},
            ];

            createTransaction({
                ...baseParams,
                iouType: CONST.IOU.TYPE.TRACK,
                files,
            });

            expect(IOU.trackExpense).toHaveBeenCalledTimes(files.length);

            expect(IOU.trackExpense).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    shouldHandleNavigation: false,
                }),
            );
            expect(IOU.trackExpense).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({
                    shouldHandleNavigation: false,
                }),
            );
            expect(IOU.trackExpense).toHaveBeenNthCalledWith(
                3,
                expect.objectContaining({
                    shouldHandleNavigation: true,
                }),
            );
        });

        it('should default receipt source and state correctly when file is missing', () => {
            const files = [{...fakeReceiptFile, file: undefined}];

            createTransaction({
                ...baseParams,
                files,
            });

            expect(IOU.requestMoney).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionParams: expect.objectContaining({
                        receipt: expect.objectContaining({
                            source: 12345,
                            state: CONST.IOU.RECEIPT_STATE.SCAN_READY,
                        }),
                    }),
                }),
            );
        });

        it('should default currentUserEmail to empty for requestMoney when not provided', () => {
            createTransaction({
                ...baseParams,
                currentUserEmail: undefined,
            });

            expect(IOU.requestMoney).toHaveBeenCalledWith(
                expect.objectContaining({
                    currentUserEmailParam: '',
                }),
            );
        });
    });

    describe('handleMoneyRequestStepDistanceNavigation', () => {
        const fakeReport = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
        const fakeTransaction = createRandomTransaction(1);
        const fakePolicy = createRandomPolicy(1);
        const fakeQuickAction: OnyxEntry<QuickAction> = {
            action: CONST.QUICK_ACTIONS.ASSIGN_TASK,
            chatReportID: 'quick_action_chat_123',
            targetAccountID: 789,
        };
        const backTo = ROUTES.REPORT_WITH_ID.getRoute('123');
        const firstSplitParticipantID = '100';
        const secondSplitParticipantID = '101';

        const baseParams = {
            iouType: CONST.IOU.TYPE.CREATE,
            report: fakeReport,
            policy: fakePolicy,
            transaction: fakeTransaction,
            reportID: '1',
            transactionID: '121',
            reportAttributesDerived: {},
            personalDetails: {},
            waypoints: {},
            customUnitRateID: 'rate1',
            currentUserLogin: 'test@test.com',
            currentUserAccountID: 1,
            backToReport: undefined,
            shouldSkipConfirmation: false,
            defaultExpensePolicy: undefined,
            isArchivedExpenseReport: false,
            isAutoReporting: false,
            isASAPSubmitBetaEnabled: false,
            transactionViolations: {},
            lastSelectedDistanceRates: {},
            setDistanceRequestData: jest.fn(),
            translate: jest.fn().mockReturnValue('Pending...'),
            quickAction: fakeQuickAction,
        };
        const splitShares: SplitShares = {
            [firstSplitParticipantID]: {
                amount: 10,
            },
            [secondSplitParticipantID]: {
                amount: 10,
            },
        };

        function getParticipantsForTest() {
            const selectedParticipants = IOU.getMoneyRequestParticipantsFromReport(baseParams.report, currentUserAccountID);
            return selectedParticipants.map((participant) => {
                const participantAccountID = participant?.accountID ?? CONST.DEFAULT_NUMBER_ID;
                return participantAccountID ? getParticipantsOption(participant, baseParams.personalDetails) : getReportOption(participant, baseParams.reportAttributesDerived);
            });
        }

        beforeEach(() => {
            Onyx.clear();
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should go back when backTo is provided', () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                backTo,
            });

            expect(Navigation.goBack).toHaveBeenCalledWith(backTo);
        });

        it('should call resetSplitShares when splitShares exists for transaction and not from manual distance step', () => {
            const splitTransaction = {
                ...fakeTransaction,
                splitShares,
            };

            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                transaction: splitTransaction,
                manualDistance: undefined,
                shouldSkipConfirmation: true,
                iouType: CONST.IOU.TYPE.TRACK,
            });

            expect(IOU.resetSplitShares).toHaveBeenCalledWith(splitTransaction);
        });

        it('call trackExpense for TRACK iouType when from manual distance step and skipping confirmation', async () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                manualDistance: 20,
                shouldSkipConfirmation: true,
                iouType: CONST.IOU.TYPE.TRACK,
            });

            expect(IOU.resetSplitShares).not.toHaveBeenCalled();
            expect(IOU.getMoneyRequestParticipantsFromReport).toHaveBeenCalledWith(baseParams.report, baseParams.currentUserAccountID);
            expect(IOU.setMoneyRequestPendingFields).toHaveBeenCalledWith(baseParams.transactionID, {
                waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            });
            expect(IOU.setMoneyRequestMerchant).toHaveBeenCalledWith(baseParams.transactionID, 'Pending...', false);

            expect(IOU.trackExpense).toHaveBeenCalledWith({
                report: baseParams.report,
                isDraftPolicy: false,
                participantParams: {
                    payeeEmail: baseParams.currentUserLogin,
                    payeeAccountID: baseParams.currentUserAccountID,
                    participant: getParticipantsForTest().at(0),
                },
                policyParams: {
                    policy: baseParams.policy,
                },
                transactionParams: {
                    amount: 0,
                    distance: 20,
                    currency: fakeTransaction?.currency ?? 'USD',
                    created: fakeTransaction?.created ?? '',
                    merchant: 'Pending...',
                    receipt: {},
                    billable: false,
                    reimbursable: undefined,
                    validWaypoints: undefined,
                    customUnitRateID: baseParams.customUnitRateID,
                    attendees: fakeTransaction?.comment?.attendees,
                },
                isASAPSubmitBetaEnabled: baseParams.isASAPSubmitBetaEnabled,
                quickAction: baseParams.quickAction,
            });

            // The function must return after trackExpense and not call createDistanceRequest
            expect(IOU.createDistanceRequest).not.toHaveBeenCalled();
        });

        it('should call trackExpense for TRACK iouType with valid waypoints when not from manual distance step and skipping confirmation', async () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                manualDistance: undefined,
                shouldSkipConfirmation: true,
                iouType: CONST.IOU.TYPE.TRACK,
            });

            expect(IOU.resetSplitShares).not.toHaveBeenCalled();
            expect(IOU.getMoneyRequestParticipantsFromReport).toHaveBeenCalledWith(baseParams.report, baseParams.currentUserAccountID);
            expect(IOU.setMoneyRequestPendingFields).toHaveBeenCalledWith(baseParams.transactionID, {
                waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            });
            expect(IOU.setMoneyRequestMerchant).toHaveBeenCalledWith(baseParams.transactionID, 'Pending...', false);

            const validWaypoints = TransactionUtils.getValidWaypoints(baseParams.waypoints, true);

            expect(IOU.trackExpense).toHaveBeenCalledWith({
                report: baseParams.report,
                isDraftPolicy: false,
                participantParams: {
                    payeeEmail: baseParams.currentUserLogin,
                    payeeAccountID: baseParams.currentUserAccountID,
                    participant: getParticipantsForTest().at(0),
                },
                policyParams: {
                    policy: baseParams.policy,
                },
                transactionParams: {
                    amount: 0,
                    distance: undefined,
                    currency: fakeTransaction?.currency ?? 'USD',
                    created: fakeTransaction?.created ?? '',
                    merchant: 'Pending...',
                    receipt: {},
                    billable: false,
                    reimbursable: true,
                    validWaypoints,
                    customUnitRateID: baseParams.customUnitRateID,
                    attendees: fakeTransaction?.comment?.attendees,
                },
                isASAPSubmitBetaEnabled: baseParams.isASAPSubmitBetaEnabled,
                quickAction: baseParams.quickAction,
            });
        });

        it('should call createDistanceRequest for non-TRACK iouType when from manual distance step and skipping confirmation', () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                shouldSkipConfirmation: true,
                manualDistance: 20,
                iouType: CONST.IOU.TYPE.SUBMIT,
            });

            expect(IOU.getMoneyRequestParticipantsFromReport).toHaveBeenCalledWith(baseParams.report, baseParams.currentUserAccountID);
            expect(IOU.setMoneyRequestPendingFields).toHaveBeenCalledWith(baseParams.transactionID, {
                waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            });
            expect(IOU.setMoneyRequestMerchant).toHaveBeenCalledWith(baseParams.transactionID, 'Pending...', false);

            const customUnitRateID = DistanceRequestUtils.getCustomUnitRateID({
                reportID: fakeReport.reportID,
                isPolicyExpenseChat: true,
                policy: fakePolicy,
                lastSelectedDistanceRates: baseParams.lastSelectedDistanceRates,
            });

            expect(IOU.createDistanceRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    report: baseParams.report,
                    participants: getParticipantsForTest(),
                    currentUserLogin: baseParams.currentUserLogin,
                    currentUserAccountID: baseParams.currentUserAccountID,
                    iouType: CONST.IOU.TYPE.SUBMIT,
                    transactionParams: expect.objectContaining({
                        amount: 0,
                        distance: 20,
                        comment: '',
                        created: fakeTransaction?.created ?? '',
                        currency: fakeTransaction?.currency ?? 'USD',
                        merchant: 'Pending...',
                        billable: !!fakePolicy.defaultBillable,
                        reimbursable: undefined,
                        validWaypoints: undefined,
                        customUnitRateID,
                        splitShares: fakeTransaction?.splitShares,
                        attendees: fakeTransaction?.comment?.attendees,
                    }),
                    backToReport: baseParams.backToReport,
                    isASAPSubmitBetaEnabled: baseParams.isASAPSubmitBetaEnabled,
                    transactionViolations: baseParams.transactionViolations,
                    quickAction: baseParams.quickAction,
                    policyRecentlyUsedCurrencies: [],
                }),
            );
        });

        it('should call createDistanceRequest for non-TRACK iouType when not from manual distance step and skipping confirmation', () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                shouldSkipConfirmation: true,
                manualDistance: undefined,
                iouType: CONST.IOU.TYPE.SUBMIT,
            });

            expect(IOU.getMoneyRequestParticipantsFromReport).toHaveBeenCalledWith(baseParams.report, baseParams.currentUserAccountID);
            expect(IOU.setMoneyRequestPendingFields).toHaveBeenCalledWith(baseParams.transactionID, {
                waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            });
            expect(IOU.setMoneyRequestMerchant).toHaveBeenCalledWith(baseParams.transactionID, 'Pending...', false);

            const validWaypoints = TransactionUtils.getValidWaypoints(baseParams.waypoints, true);
            const customUnitRateID = DistanceRequestUtils.getCustomUnitRateID({
                reportID: fakeReport.reportID,
                isPolicyExpenseChat: true,
                policy: fakePolicy,
                lastSelectedDistanceRates: baseParams.lastSelectedDistanceRates,
            });

            expect(IOU.createDistanceRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    report: baseParams.report,
                    participants: getParticipantsForTest(),
                    currentUserLogin: baseParams.currentUserLogin,
                    currentUserAccountID: baseParams.currentUserAccountID,
                    iouType: CONST.IOU.TYPE.SUBMIT,
                    transactionParams: expect.objectContaining({
                        amount: 0,
                        distance: undefined,
                        comment: '',
                        created: fakeTransaction?.created ?? '',
                        currency: fakeTransaction?.currency ?? 'USD',
                        merchant: 'Pending...',
                        billable: !!fakePolicy.defaultBillable,
                        reimbursable: !!fakePolicy?.defaultReimbursable,
                        validWaypoints,
                        customUnitRateID,
                        splitShares: fakeTransaction?.splitShares,
                        attendees: fakeTransaction?.comment?.attendees,
                    }),
                    backToReport: baseParams.backToReport,
                    isASAPSubmitBetaEnabled: baseParams.isASAPSubmitBetaEnabled,
                    transactionViolations: baseParams.transactionViolations,
                    quickAction: baseParams.quickAction,
                    policyRecentlyUsedCurrencies: [],
                }),
            );
        });

        it('should navigate to confirmation page when not skipping confirmation', async () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                shouldSkipConfirmation: false,
                iouType: CONST.IOU.TYPE.SUBMIT,
            });

            expect(IOU.setMoneyRequestParticipantsFromReport).toHaveBeenCalledWith(baseParams.transactionID, baseParams.report, baseParams.currentUserAccountID);

            await waitForBatchedUpdates();

            expect(Navigation.navigate).toHaveBeenCalledWith(
                ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, baseParams.transactionID, baseParams.reportID, baseParams.backToReport),
            );
        });

        it('should navigate to confirmation page for CREATE flow from global menu', async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, {...fakeReport, reportID: '1'});

            const defaultExpensePolicy = {
                ...fakePolicy,
                isPolicyExpenseChatEnabled: true,
            };

            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                report: undefined,
                defaultExpensePolicy,
                isAutoReporting: true,
                iouType: CONST.IOU.TYPE.CREATE,
            });
            await waitForBatchedUpdates();

            const draftTransactionOnyx = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${baseParams.transactionID}`,
                    waitForCollectionCallback: false,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            const rateID = DistanceRequestUtils.getCustomUnitRateID({
                reportID: fakeReport.reportID,
                isPolicyExpenseChat: true,
                policy: defaultExpensePolicy,
                lastSelectedDistanceRates: {},
            });

            expect(DistanceRequestUtils.getCustomUnitRateID).toHaveBeenCalledWith({
                reportID: fakeReport.reportID,
                isPolicyExpenseChat: true,
                policy: defaultExpensePolicy,
                lastSelectedDistanceRates: {},
            });

            expect(draftTransactionOnyx).toMatchObject({reportID: '1'});

            expect(IOU.setCustomUnitRateID).toHaveBeenCalledWith(baseParams.transactionID, rateID);
            expect(IOU.setMoneyRequestParticipantsFromReport).toHaveBeenCalledWith(baseParams.transactionID, fakeReport, baseParams.currentUserAccountID);

            expect(Navigation.navigate).toHaveBeenCalledWith(
                ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, baseParams.transactionID, fakeReport?.reportID),
            );
        });

        it('should use UNREPORTED_REPORT_ID for transaction when autoReporting is disabled', async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, {...fakeReport, reportID: '1'});

            const defaultExpensePolicy = {
                ...fakePolicy,
                autoReporting: false,
                isPolicyExpenseChatEnabled: true,
            };

            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                report: undefined,
                defaultExpensePolicy,
                iouType: CONST.IOU.TYPE.CREATE,
            });
            await waitForBatchedUpdates();

            const draftTransactionOnyx = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${baseParams.transactionID}`,
                    waitForCollectionCallback: false,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            expect(draftTransactionOnyx).toMatchObject({reportID: '0'});
            expect(DistanceRequestUtils.getCustomUnitRateID).toHaveBeenCalledWith(expect.objectContaining({reportID: '0'}));
        });

        it('should navigate to participants page when the user click create expense option (combined submit/track flow)', () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                iouType: CONST.IOU.TYPE.CREATE,
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(CONST.IOU.TYPE.CREATE, baseParams.transactionID, baseParams.reportID));
        });
    });
});
