import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {MoneyRequestStepScanParticipantsFlowParams} from '@libs/actions/IOU/MoneyRequest';
import {createTransaction, handleMoneyRequestStepDistanceNavigation, handleMoneyRequestStepScanParticipants} from '@libs/actions/IOU/MoneyRequest';
import {startSplitBill} from '@libs/actions/IOU/Split';
import getCurrentPosition from '@libs/getCurrentPosition';
import {GeolocationErrorCode} from '@libs/getCurrentPosition/getCurrentPosition.types';
import Navigation from '@libs/Navigation/Navigation';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {QuickAction} from '@src/types/onyx';
import type {SplitShares} from '@src/types/onyx/Transaction';
import * as IOU from '../../../src/libs/actions/IOU';
import * as ReportUtils from '../../../src/libs/ReportUtils';
import createRandomPolicy from '../../utils/collections/policies';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/IOU', () => {
    const actualNav = jest.requireActual<typeof IOU>('@libs/actions/IOU');
    return {
        ...actualNav,
        requestMoney: jest.fn(),
        trackExpense: jest.fn(),
        startSplitBill: jest.fn(),
        createDistanceRequest: jest.fn(),
        resetSplitShares: jest.fn(),
    };
});

jest.mock('@libs/actions/IOU/Split', () => {
    return {
        startSplitBill: jest.fn(),
    };
});

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));

jest.mock('@libs/getCurrentPosition');

describe('MoneyRequest', () => {
    const currentUserAccountID = 111;
    const currentUserLogin = 'test@example.com';
    const TEST_USER_ACCOUNT_ID = 123;
    const TEST_USER_EMAIL = 'test@test.com';
    const SELF_DM_REPORT_ID = '2';
    const TEST_LATITUDE = 37.7749;
    const TEST_LONGITUDE = -122.4194;

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

    describe('handleMoneyRequestStepScanParticipants', () => {
        const fakeReport = {
            ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
            ownerAccountID: currentUserAccountID,
            policyID: '1',
        };

        const fakeTransaction = createRandomTransaction(1);
        const fakePolicy = createRandomPolicy(1, CONST.POLICY.TYPE.TEAM);
        const fakeQuickAction: OnyxEntry<QuickAction> = {
            action: CONST.QUICK_ACTIONS.ASSIGN_TASK,
            chatReportID: '555',
        };
        const fileObj = new File([new Blob(['test'])], 'test.jpg', {type: 'image/jpeg'});
        const fakeReceiptFile: ReceiptFile = {transactionID: fakeTransaction.transactionID, file: fileObj, source: 12345};
        const backTo = ROUTES.REPORT_WITH_ID.getRoute('123');
        const managerMcTestAccountID = 444;

        const baseParams: MoneyRequestStepScanParticipantsFlowParams = {
            iouType: CONST.IOU.TYPE.CREATE,
            policy: fakePolicy,
            report: fakeReport,
            reportID: '1',
            reportAttributesDerived: {},
            transactions: [fakeTransaction],
            initialTransaction: {
                transactionID: '1',
                reportID: '1',
                taxCode: '',
                taxAmount: 0,
                currency: CONST.CURRENCY.USD,
            },
            currentUserAccountID,
            currentUserLogin,
            personalDetails: {
                [TEST_USER_ACCOUNT_ID]: {
                    accountID: TEST_USER_ACCOUNT_ID,
                    displayName: 'Test Participant',
                    login: TEST_USER_EMAIL,
                },
            },
            shouldSkipConfirmation: false,
            isArchivedExpenseReport: false,
            isAutoReporting: false,
            isASAPSubmitBetaEnabled: false,
            quickAction: fakeQuickAction,
            files: [fakeReceiptFile],
            shouldGenerateTransactionThreadReport: false,
        };

        beforeEach(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, {
                ...fakeReport,
                participants: {
                    [TEST_USER_ACCOUNT_ID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        role: CONST.REPORT.ROLE.MEMBER,
                    },
                },
            });
        });

        afterEach(async () => {
            await Onyx.clear();
            jest.clearAllMocks();
        });

        it(`should go back when backTo is provided`, () => {
            handleMoneyRequestStepScanParticipants({
                ...baseParams,
                backTo,
            });

            expect(Navigation.goBack).toHaveBeenCalledWith(backTo);
        });

        it('should set manager mc test participant for the test transaction and navigate to confirmation page', async () => {
            jest.spyOn(ReportUtils, 'generateReportID').mockReturnValue('123');

            await Onyx.set(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {
                [managerMcTestAccountID]: {
                    accountID: managerMcTestAccountID,
                    login: CONST.EMAIL.MANAGER_MCTEST,
                    displayName: 'Manager MC Test',
                },
            });

            handleMoneyRequestStepScanParticipants({
                ...baseParams,
                isTestTransaction: true,
            });

            await waitForBatchedUpdates();

            const updatedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${baseParams.initialTransaction.transactionID}`);
            expect(updatedTransaction).toMatchObject({
                participants: [
                    expect.objectContaining({
                        accountID: managerMcTestAccountID,
                        login: CONST.EMAIL.MANAGER_MCTEST,
                        selected: true,
                    }),
                ],
                isFromGlobalCreate: true,
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(
                ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.ACTION.SUBMIT, baseParams.initialTransaction.transactionID, '123'),
            );
        });

        it('should startSplitBill for SPLIT iouType when not from global create menu and skipping confirmation', async () => {
            handleMoneyRequestStepScanParticipants({
                ...baseParams,
                iouType: CONST.IOU.TYPE.SPLIT,
                shouldSkipConfirmation: true,
                initialTransaction: {
                    ...baseParams.initialTransaction,
                    isFromGlobalCreate: false,
                },
            });

            await waitForBatchedUpdates();

            expect(startSplitBill).toHaveBeenCalledWith({
                participants: [
                    expect.objectContaining({
                        accountID: 0,
                        selected: true,
                        isSelected: true,
                    }),
                ],
                currentUserLogin: baseParams.currentUserLogin,
                currentUserAccountID: baseParams.currentUserAccountID,
                comment: '',
                receipt: fakeReceiptFile.file,
                existingSplitChatReportID: baseParams.reportID,
                billable: false,
                category: '',
                tag: '',
                currency: baseParams.initialTransaction.currency,
                taxCode: baseParams.initialTransaction.taxCode,
                taxAmount: baseParams.initialTransaction.taxAmount,
                quickAction: baseParams.quickAction,
                policyRecentlyUsedCurrencies: [],
            });
        });

        it('should return if no participants found for non-SPLIT iouType when not from global create menu and skipping confirmation', async () => {
            handleMoneyRequestStepScanParticipants({
                ...baseParams,
                iouType: CONST.IOU.TYPE.TRACK,
                report: {
                    ...fakeReport,
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                },
                shouldSkipConfirmation: true,
                initialTransaction: {
                    ...baseParams.initialTransaction,
                    isFromGlobalCreate: false,
                },
            });

            await waitForBatchedUpdates();
            expect(IOU.trackExpense).not.toHaveBeenCalled();
        });

        it('should trackExpense with GPS coordinates when location permission is granted', async () => {
            const mockGetCurrentPosition = getCurrentPosition as jest.MockedFunction<typeof getCurrentPosition>;
            mockGetCurrentPosition.mockImplementation((successCallback) => {
                successCallback({
                    coords: {
                        latitude: TEST_LATITUDE,
                        longitude: TEST_LONGITUDE,
                        altitude: null,
                        accuracy: null,
                        altitudeAccuracy: null,
                        heading: null,
                        speed: null,
                    },
                    timestamp: 1000,
                });
                return Promise.resolve();
            });

            handleMoneyRequestStepScanParticipants({
                ...baseParams,
                iouType: CONST.IOU.TYPE.TRACK,
                shouldSkipConfirmation: true,
                initialTransaction: {
                    ...baseParams.initialTransaction,
                    isFromGlobalCreate: false,
                },
                locationPermissionGranted: true,
            });

            expect(IOU.trackExpense).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionParams: expect.objectContaining({
                        gpsPoint: {
                            lat: TEST_LATITUDE,
                            long: TEST_LONGITUDE,
                        },
                    }),
                }),
            );
        });

        it('should track expense without GPS coordinates when location permission is denied', async () => {
            const mockGetCurrentPosition = getCurrentPosition as jest.MockedFunction<typeof getCurrentPosition>;
            mockGetCurrentPosition.mockImplementation((successCallback, errorCallback) => {
                errorCallback({
                    code: GeolocationErrorCode.PERMISSION_DENIED,
                    message: 'Permission Denied',
                });
                return Promise.resolve();
            });

            handleMoneyRequestStepScanParticipants({
                ...baseParams,
                iouType: CONST.IOU.TYPE.TRACK,
                shouldSkipConfirmation: true,
                initialTransaction: {
                    ...baseParams.initialTransaction,
                    isFromGlobalCreate: false,
                },
                locationPermissionGranted: true,
            });

            expect(IOU.trackExpense).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionParams: expect.objectContaining({
                        gpsPoint: undefined,
                    }),
                }),
            );
        });

        it('should trackExpense for TRACK iouType when not from global create menu and skipping confirmation', async () => {
            handleMoneyRequestStepScanParticipants({
                ...baseParams,
                iouType: CONST.IOU.TYPE.TRACK,
                shouldSkipConfirmation: true,
                initialTransaction: {
                    ...baseParams.initialTransaction,
                    isFromGlobalCreate: false,
                },
            });

            await waitForBatchedUpdates();

            expect(IOU.trackExpense).toHaveBeenCalledWith({
                report: baseParams.report,
                isDraftPolicy: false,
                participantParams: {
                    payeeEmail: baseParams.currentUserLogin,
                    payeeAccountID: baseParams.currentUserAccountID,
                    participant: expect.objectContaining({
                        accountID: 0,
                        selected: true,
                        isSelected: true,
                        ownerAccountID: fakeReport.ownerAccountID,
                    }),
                },
                transactionParams: {
                    amount: 0,
                    currency: fakeTransaction?.currency ?? 'USD',
                    created: fakeTransaction?.created,
                    receipt: fakeReceiptFile.file,
                    billable: undefined,
                    reimbursable: true,
                    gpsPoint: undefined,
                },
                isASAPSubmitBetaEnabled: baseParams.isASAPSubmitBetaEnabled,
                currentUserAccountIDParam: baseParams.currentUserAccountID,
                currentUserEmailParam: baseParams.currentUserLogin,
                quickAction: baseParams.quickAction,
                shouldHandleNavigation: true,
            });
            // Should not call request money inside createTransaction function
            expect(IOU.requestMoney).not.toHaveBeenCalled();
        });

        it(`should assign participants from report and navigate to confirmation page when not from global create menu`, async () => {
            handleMoneyRequestStepScanParticipants({
                ...baseParams,
                iouType: CONST.IOU.TYPE.TRACK,
                initialTransaction: {
                    ...baseParams.initialTransaction,
                    isFromGlobalCreate: false,
                },
            });

            await waitForBatchedUpdates();

            const updatedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${fakeReceiptFile.transactionID}`);
            expect(updatedTransaction).toMatchObject({
                participants: [
                    {
                        accountID: 0,
                        isPolicyExpenseChat: true,
                        reportID: fakeReport.reportID,
                        selected: true,
                    },
                ],
                participantsAutoAssigned: true,
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(
                ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.TRACK, baseParams.initialTransaction.transactionID, baseParams.reportID),
            );
        });

        it("should set initial transaction's participants if it is different from policyExpenseChat participants", async () => {
            const defaultExpensePolicy = {
                ...fakePolicy,
                autoReporting: false,
                type: CONST.POLICY.TYPE.TEAM,
                isPolicyExpenseChatEnabled: true,
            };

            handleMoneyRequestStepScanParticipants({
                ...baseParams,
                initialTransaction: {
                    ...baseParams.initialTransaction,
                    participants: [
                        {
                            accountID: TEST_USER_ACCOUNT_ID,
                            reportID: '123',
                        },
                    ],
                },
                defaultExpensePolicy,
            });

            await waitForBatchedUpdates();

            const updatedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${fakeReceiptFile.transactionID}`);
            expect(updatedTransaction).toMatchObject({
                participants: [
                    expect.objectContaining({
                        accountID: TEST_USER_ACCOUNT_ID,
                        reportID: '123',
                    }),
                ],
            });
            expect(Navigation.navigate).toHaveBeenCalledWith(
                ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
                    CONST.IOU.ACTION.CREATE,
                    CONST.IOU.TYPE.SUBMIT,
                    baseParams.initialTransaction.transactionID,
                    baseParams.reportID,
                    baseParams.backToReport,
                ),
            );
        });

        it('should navigate to confirmation page of track expense for self DM', async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${SELF_DM_REPORT_ID}`, {
                ...fakeReport,
                reportID: SELF_DM_REPORT_ID,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            });

            const defaultExpensePolicy = {
                ...fakePolicy,
                autoReporting: false,
                type: CONST.POLICY.TYPE.TEAM,
                isPolicyExpenseChatEnabled: true,
            };

            handleMoneyRequestStepScanParticipants({
                ...baseParams,
                initialTransaction: {
                    ...baseParams.initialTransaction,
                    participants: [
                        {
                            accountID: TEST_USER_ACCOUNT_ID,
                            reportID: SELF_DM_REPORT_ID,
                        },
                    ],
                },
                defaultExpensePolicy,
            });

            await waitForBatchedUpdates();

            expect(Navigation.navigate).toHaveBeenCalledWith(
                ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.TRACK, baseParams.initialTransaction.transactionID, SELF_DM_REPORT_ID),
            );
        });

        it('should set participants and navigate to confirmation page when from global create menu', async () => {
            const defaultExpensePolicy = {
                ...fakePolicy,
                autoReporting: false,
                type: CONST.POLICY.TYPE.TEAM,
                isPolicyExpenseChatEnabled: true,
            };

            handleMoneyRequestStepScanParticipants({
                ...baseParams,
                defaultExpensePolicy,
            });

            await waitForBatchedUpdates();

            const draftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${fakeTransaction.transactionID}`);
            expect(draftTransaction).toMatchObject({
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                participants: [
                    {
                        accountID: 0,
                        isPolicyExpenseChat: true,
                        reportID: fakeReport.reportID,
                        selected: true,
                    },
                ],
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(
                ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, baseParams.initialTransaction.transactionID, '1'),
            );
        });

        it('should navigate to participants page when the user click create expense option (combined submit/track flow)', () => {
            handleMoneyRequestStepScanParticipants(baseParams);

            expect(Navigation.navigate).toHaveBeenCalledWith(
                ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(baseParams.iouType, baseParams.initialTransaction.transactionID, baseParams.reportID),
            );
        });
    });

    describe('handleMoneyRequestStepDistanceNavigation', () => {
        const fakeReport = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
        const fakeTransaction = createRandomTransaction(1);
        const fakePolicy = createRandomPolicy(1, CONST.POLICY.TYPE.TEAM);
        const fakeQuickAction: OnyxEntry<QuickAction> = {
            action: CONST.QUICK_ACTIONS.ASSIGN_TASK,
            chatReportID: '555',
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

        beforeEach(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, {
                ...fakeReport,
                participants: {
                    [TEST_USER_ACCOUNT_ID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        role: CONST.REPORT.ROLE.MEMBER,
                    },
                },
            });
        });

        afterEach(async () => {
            await Onyx.clear();
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

            expect(IOU.trackExpense).toHaveBeenCalledWith({
                report: baseParams.report,
                isDraftPolicy: false,
                participantParams: {
                    payeeEmail: baseParams.currentUserLogin,
                    payeeAccountID: baseParams.currentUserAccountID,
                    participant: expect.objectContaining({
                        accountID: 0,
                        selected: true,
                        isSelected: true,
                        allReportErrors: {},
                        brickRoadIndicator: null,
                        isPolicyExpenseChat: true,
                    }),
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
                currentUserAccountIDParam: baseParams.currentUserAccountID,
                currentUserEmailParam: baseParams.currentUserLogin,
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

            await waitForBatchedUpdates();

            expect(IOU.resetSplitShares).not.toHaveBeenCalled();

            const updatedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${baseParams.transactionID}`);
            const updatedDraftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${baseParams.transactionID}`);

            expect(updatedTransaction?.merchant).toBe('Pending...');
            expect(updatedDraftTransaction?.pendingFields).toMatchObject({
                waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            });

            expect(IOU.trackExpense).toHaveBeenCalledWith({
                report: baseParams.report,
                isDraftPolicy: false,
                participantParams: {
                    payeeEmail: baseParams.currentUserLogin,
                    payeeAccountID: baseParams.currentUserAccountID,
                    participant: expect.objectContaining({
                        accountID: 0,
                        selected: true,
                        isSelected: true,
                        allReportErrors: {},
                        brickRoadIndicator: null,
                        isPolicyExpenseChat: true,
                    }),
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
                    validWaypoints: {},
                    customUnitRateID: baseParams.customUnitRateID,
                    attendees: fakeTransaction?.comment?.attendees,
                },
                isASAPSubmitBetaEnabled: baseParams.isASAPSubmitBetaEnabled,
                currentUserAccountIDParam: baseParams.currentUserAccountID,
                currentUserEmailParam: baseParams.currentUserLogin,
                quickAction: baseParams.quickAction,
            });
        });

        it('should call createDistanceRequest for non-TRACK iouType when from manual distance step and skipping confirmation', async () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                shouldSkipConfirmation: true,
                manualDistance: 20,
                iouType: CONST.IOU.TYPE.SUBMIT,
            });

            expect(IOU.createDistanceRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    report: baseParams.report,
                    // participants: getParticipantsForTest(),
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
                        customUnitRateID: CONST.CUSTOM_UNITS.FAKE_P2P_ID,
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

            expect(IOU.createDistanceRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    report: baseParams.report,
                    // participants: getParticipantsForTest(),
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
                        validWaypoints: {},
                        customUnitRateID: CONST.CUSTOM_UNITS.FAKE_P2P_ID,
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

            await waitForBatchedUpdates();

            const updatedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${baseParams.transactionID}`);
            expect(updatedTransaction).toMatchObject({
                participants: [
                    {
                        accountID: 0,
                        isPolicyExpenseChat: true,
                        reportID: fakeReport.reportID,
                        selected: true,
                    },
                ],
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(
                ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, baseParams.transactionID, baseParams.reportID, baseParams.backToReport),
            );
        });

        it('should navigate to confirmation page for CREATE flow from global menu', async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

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

            const updatedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${baseParams.transactionID}`);
            expect(updatedTransaction).toMatchObject({
                reportID: fakeReport.reportID,
                participants: [
                    {
                        accountID: 0,
                        isPolicyExpenseChat: true,
                        reportID: fakeReport.reportID,
                        selected: true,
                    },
                ],
                comment: {
                    customUnit: {
                        customUnitRateID: CONST.CUSTOM_UNITS.FAKE_P2P_ID,
                    },
                },
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(
                ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, baseParams.transactionID, fakeReport?.reportID),
            );
        });

        it('should use UNREPORTED_REPORT_ID for transaction when autoReporting is disabled', async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

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

            const updatedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${baseParams.transactionID}`);
            expect(updatedTransaction?.reportID).toBe(CONST.REPORT.UNREPORTED_REPORT_ID);
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
