import {createTransaction, getMoneyRequestParticipantOptions} from '@libs/actions/IOU/MoneyRequest';
import Navigation from '@libs/Navigation/Navigation';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';

import handleMoneyRequestStepDistanceNavigation from '@pages/iou/request/step/IOURequestStepDistance/handleMoneyRequestStepDistanceNavigation';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, QuickAction, RecentWaypoint} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {SplitShares} from '@src/types/onyx/Transaction';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import type * as IOU from '../../../src/libs/actions/IOU';
import type * as SubmitWithDismissFirstMock from '../../__mocks__/submitWithDismissFirst';

import * as Split from '../../../src/libs/actions/IOU/Split';
import * as TrackExpense from '../../../src/libs/actions/IOU/TrackExpense';
import DistanceRequestUtils from '../../../src/libs/DistanceRequestUtils';
import createRandomPolicy from '../../utils/collections/policies';
import {createRandomReport, createSelfDM} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/IOU', () => {
    const actualNav = jest.requireActual<typeof IOU>('@libs/actions/IOU');
    return {
        ...actualNav,
    };
});

jest.mock('@libs/actions/IOU/TrackExpense', () => {
    const actual = jest.requireActual<typeof TrackExpense>('@libs/actions/IOU/TrackExpense');
    return {
        ...actual,
        trackExpense: jest.fn(),
        requestMoney: jest.fn(),
    };
});

jest.mock('@libs/actions/IOU/Split', () => {
    const actualSplit = jest.requireActual<typeof Split>('@libs/actions/IOU/Split');
    return {
        ...actualSplit,
        createDistanceRequest: jest.fn(() => ({iouReport: undefined, chatReportID: 'distance-chat-id', transactionID: 'distance-written-id'})),
        startSplitBill: jest.fn(),
        resetSplitShares: jest.fn(),
    };
});

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));

// Pass-through spy so behavior is unchanged but the call args (incl. currentUserAccountID) can be asserted.
jest.mock('@libs/shouldUseDefaultExpensePolicy', () => {
    const actual = jest.requireActual<{default: typeof shouldUseDefaultExpensePolicy}>('@libs/shouldUseDefaultExpensePolicy');
    return {
        __esModule: true,
        default: jest.fn((...args: Parameters<typeof shouldUseDefaultExpensePolicy>) => actual.default(...args)),
    };
});

jest.mock('@libs/getCurrentPosition');

// Fire executeWrite synchronously so downstream writes can be asserted.
jest.mock('@libs/Navigation/helpers/submitWithDismissFirst', () => jest.requireActual<typeof SubmitWithDismissFirstMock>('../../__mocks__/submitWithDismissFirst'));
// Cleanup helpers are spies so the move-from-track cleanup-id contract can be asserted.
const mockCleanupAndNavigateAfterExpenseCreate = jest.fn();
const mockCleanupAfterExpenseCreate = jest.fn();
jest.mock('@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate', () => ({
    __esModule: true,
    default: (...args: unknown[]): void => {
        mockCleanupAndNavigateAfterExpenseCreate(...args);
    },
}));
jest.mock('@libs/Navigation/helpers/cleanupAfterExpenseCreate', () => ({
    __esModule: true,
    default: (...args: unknown[]): void => {
        mockCleanupAfterExpenseCreate(...args);
    },
}));

describe('MoneyRequest', () => {
    const currentUserAccountID = 111;
    const TEST_USER_ACCOUNT_ID = 123;
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

        const selfDMReport = createSelfDM(Number(SELF_DM_REPORT_ID), TEST_USER_ACCOUNT_ID);

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
            allTransactionDrafts: {},
            selfDMReport,
            isSelfTourViewed: false,
            betas: [CONST.BETAS.ALL],
            personalDetails: {},
            recentWaypoints: [] as RecentWaypoint[],
            optimisticTransactionIDs: ['mock-txn-id'],
            optimisticChatReportID: undefined,
            currentUserLocalCurrency: undefined,
        };

        beforeEach(async () => {
            baseParams.recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should call trackExpense for TRACK iouType', async () => {
            createTransaction({
                ...baseParams,
                iouType: CONST.IOU.TYPE.TRACK,
                allTransactionDrafts: {},
            });

            expect(TrackExpense.trackExpense).toHaveBeenCalledTimes(1);
            expect(TrackExpense.requestMoney).toHaveBeenCalledTimes(0);

            expect(TrackExpense.trackExpense).toHaveBeenCalledWith(
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
                    isASAPSubmitBetaEnabled: false,
                }),
            );

            // Deferral is channel-driven; the action no longer receives a shouldDeferForSearch / shouldHandleNavigation flag.
            const lastTrackExpenseParams = jest.mocked(TrackExpense.trackExpense).mock.calls.at(-1)?.at(0);
            expect(lastTrackExpenseParams && 'shouldDeferForSearch' in lastTrackExpenseParams).toBeFalsy();
            expect(lastTrackExpenseParams && 'shouldHandleNavigation' in lastTrackExpenseParams).toBeFalsy();
        });

        it('should call requestMoney for non-TRACK (SEND) iouType', () => {
            createTransaction({
                ...baseParams,
                iouType: CONST.IOU.TYPE.SEND,
                allTransactionDrafts: {},
            });

            expect(TrackExpense.requestMoney).toHaveBeenCalledTimes(1);
            expect(TrackExpense.trackExpense).toHaveBeenCalledTimes(0);

            expect(TrackExpense.requestMoney).toHaveBeenCalledWith(
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
                    shouldGenerateTransactionThreadReport: false,
                    isASAPSubmitBetaEnabled: false,
                    currentUserAccountIDParam: 111,
                    currentUserEmailParam: 'test@example.com',
                    transactionViolations: {},
                }),
            );
        });

        it('should not pass shouldDeferAPIWrite to the action (V2: deferral is channel-driven)', () => {
            const files = [
                {...fakeReceiptFile, transactionID: '111'},
                {...fakeReceiptFile, transactionID: '222'},
                {...fakeReceiptFile, transactionID: '333'},
            ];

            createTransaction({
                ...baseParams,
                iouType: CONST.IOU.TYPE.TRACK,
                files,
                allTransactionDrafts: {},
            });

            expect(TrackExpense.trackExpense).toHaveBeenCalledTimes(files.length);
            const trackExpenseCallsHaveDeferFlag = jest.mocked(TrackExpense.trackExpense).mock.calls.some(([params]) => !!params && 'shouldDeferAPIWrite' in params);
            expect(trackExpenseCallsHaveDeferFlag).toBe(false);
        });

        it('should default receipt source and state correctly when file is missing', () => {
            const files = [{...fakeReceiptFile, file: undefined}];

            createTransaction({
                ...baseParams,
                files,
                allTransactionDrafts: {},
            });

            expect(TrackExpense.requestMoney).toHaveBeenCalledWith(
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
                allTransactionDrafts: {},
            });

            expect(TrackExpense.requestMoney).toHaveBeenCalledWith(
                expect.objectContaining({
                    currentUserEmailParam: '',
                }),
            );
        });

        it('should pass existingTransactionDraft and draftTransactionIDs to requestMoney when allTransactionDrafts is provided', () => {
            const draftTransaction = createRandomTransaction(99);
            const linkedAction = {
                reportActionID: 'action1',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                created: '',
                reportID: 'report456',
                originalMessage: {
                    IOUTransactionID: draftTransaction.transactionID,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };
            const transactionWithLinkedAction = {
                ...fakeTransaction,
                linkedTrackedExpenseReportAction: linkedAction,
            };

            createTransaction({
                ...baseParams,
                transactions: [transactionWithLinkedAction],
                allTransactionDrafts: {
                    [draftTransaction.transactionID]: draftTransaction,
                },
            });

            expect(TrackExpense.requestMoney).toHaveBeenCalledWith(
                expect.objectContaining({
                    existingTransactionDraft: draftTransaction,
                    draftTransactionIDs: [draftTransaction.transactionID],
                }),
            );
        });

        it('should default draftTransactionIDs to empty array when allTransactionDrafts is undefined', () => {
            createTransaction({
                ...baseParams,
                allTransactionDrafts: undefined,
            });

            expect(TrackExpense.requestMoney).toHaveBeenCalledWith(
                expect.objectContaining({
                    draftTransactionIDs: [],
                }),
            );
        });

        it('should pass billable and reimbursable flags to trackExpense', () => {
            createTransaction({
                ...baseParams,
                iouType: CONST.IOU.TYPE.TRACK,
                billable: true,
                reimbursable: false,
            });

            expect(TrackExpense.trackExpense).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionParams: expect.objectContaining({
                        billable: true,
                        reimbursable: false,
                    }),
                }),
            );
        });

        it('should pass undefined existingTransactionDraft when no matching draft exists', () => {
            createTransaction({
                ...baseParams,
                allTransactionDrafts: {},
            });

            expect(TrackExpense.requestMoney).toHaveBeenCalledWith(
                expect.objectContaining({
                    existingTransactionDraft: undefined,
                    draftTransactionIDs: [],
                }),
            );
        });

        // getMoneyRequestInformation derives isScanRequest from existingTransaction; dropping it would silently downgrade a scanned receipt to a manual request.
        it('should pass the receipt transaction as existingTransaction to requestMoney', () => {
            createTransaction({...baseParams});

            expect(TrackExpense.requestMoney).toHaveBeenCalledWith(expect.objectContaining({existingTransaction: fakeTransaction}));
        });

        it('should pass the receipt transaction as existingTransaction to trackExpense', () => {
            createTransaction({...baseParams, iouType: CONST.IOU.TYPE.TRACK});

            expect(TrackExpense.trackExpense).toHaveBeenCalledWith(expect.objectContaining({existingTransaction: fakeTransaction}));
        });

        it('should compute draftTransactionIDs from allTransactionDrafts', () => {
            const draft1 = createRandomTransaction(101);
            const draft2 = createRandomTransaction(102);

            createTransaction({
                ...baseParams,
                allTransactionDrafts: {
                    [draft1.transactionID]: draft1,
                    [draft2.transactionID]: draft2,
                },
            });

            expect(TrackExpense.requestMoney).toHaveBeenCalledWith(
                expect.objectContaining({
                    draftTransactionIDs: expect.arrayContaining([draft1.transactionID, draft2.transactionID]),
                }),
            );
        });

        it('should pass gpsPoint to trackExpense when provided', () => {
            const gpsPoint = {lat: TEST_LATITUDE, long: TEST_LONGITUDE};
            createTransaction({
                ...baseParams,
                iouType: CONST.IOU.TYPE.TRACK,
                gpsPoint,
            });

            expect(TrackExpense.trackExpense).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionParams: expect.objectContaining({
                        gpsPoint,
                    }),
                }),
            );
        });

        it('should pass default tax code from policy when transaction has no taxCode (trackExpense)', () => {
            const policyWithTax = {
                ...createRandomPolicy(10, CONST.POLICY.TYPE.TEAM),
                outputCurrency: CONST.CURRENCY.USD,
                taxRates: {
                    defaultExternalID: 'TAX_DEFAULT_123',
                    foreignTaxDefault: 'TAX_FOREIGN_456',
                    defaultValue: '',
                    name: 'Tax',
                    taxes: {},
                },
            };
            const transactionWithoutTax = {
                ...fakeTransaction,
                taxCode: undefined,
                taxAmount: undefined,
                currency: CONST.CURRENCY.USD,
            };

            createTransaction({
                ...baseParams,
                iouType: CONST.IOU.TYPE.TRACK,
                transactions: [transactionWithoutTax],
                policyParams: {policy: policyWithTax},
            });

            expect(TrackExpense.trackExpense).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionParams: expect.objectContaining({
                        taxCode: 'TAX_DEFAULT_123',
                        taxAmount: 0,
                    }),
                }),
            );
        });

        it('should pass default tax code from policy when transaction has no taxCode (requestMoney)', () => {
            const policyWithTax = {
                ...createRandomPolicy(11, CONST.POLICY.TYPE.TEAM),
                outputCurrency: CONST.CURRENCY.USD,
                taxRates: {
                    defaultExternalID: 'TAX_DEFAULT_789',
                    foreignTaxDefault: 'TAX_FOREIGN_012',
                    defaultValue: '',
                    name: 'Tax',
                    taxes: {},
                },
            };
            const transactionWithoutTax = {
                ...fakeTransaction,
                taxCode: undefined,
                taxAmount: undefined,
                currency: CONST.CURRENCY.USD,
            };

            createTransaction({
                ...baseParams,
                iouType: CONST.IOU.TYPE.REQUEST,
                transactions: [transactionWithoutTax],
                policyParams: {policy: policyWithTax},
            });

            expect(TrackExpense.requestMoney).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionParams: expect.objectContaining({
                        taxCode: 'TAX_DEFAULT_789',
                        taxAmount: 0,
                    }),
                }),
            );
        });

        it('should use transaction taxCode when it exists instead of default', () => {
            const policyWithTax = {
                ...createRandomPolicy(12, CONST.POLICY.TYPE.TEAM),
                outputCurrency: CONST.CURRENCY.USD,
                taxRates: {
                    defaultExternalID: 'TAX_DEFAULT_SHOULD_NOT_USE',
                    foreignTaxDefault: 'TAX_FOREIGN_SHOULD_NOT_USE',
                    defaultValue: '',
                    name: 'Tax',
                    taxes: {},
                },
            };
            const transactionWithTax = {
                ...fakeTransaction,
                taxCode: 'TAX_CUSTOM_999',
                taxAmount: 500,
                currency: CONST.CURRENCY.USD,
            };

            createTransaction({
                ...baseParams,
                iouType: CONST.IOU.TYPE.TRACK,
                transactions: [transactionWithTax],
                policyParams: {policy: policyWithTax},
            });

            expect(TrackExpense.trackExpense).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionParams: expect.objectContaining({
                        taxCode: 'TAX_CUSTOM_999',
                        taxAmount: 500,
                    }),
                }),
            );
        });

        it('should pass empty taxCode and zero taxAmount when no policy and no transaction tax', () => {
            const transactionWithoutTax = {
                ...fakeTransaction,
                taxCode: undefined,
                taxAmount: undefined,
            };

            createTransaction({
                ...baseParams,
                iouType: CONST.IOU.TYPE.REQUEST,
                transactions: [transactionWithoutTax],
                policyParams: undefined,
            });

            expect(TrackExpense.requestMoney).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionParams: expect.objectContaining({
                        taxCode: '',
                        taxAmount: 0,
                    }),
                }),
            );
        });

        it('should pass each UI-provided optimistic transaction ID to the per-file write (so the UI can target the same id for nav)', () => {
            createTransaction({
                ...baseParams,
                iouType: CONST.IOU.TYPE.REQUEST,
                optimisticTransactionIDs: ['ui-id-1'],
                allTransactionDrafts: {},
            });
            const requestMoneyArg = jest.mocked(TrackExpense.requestMoney).mock.calls.at(0)?.at(0);
            expect(requestMoneyArg?.optimisticTransactionID).toBe('ui-id-1');
        });

        it('should forward the UI-resolved optimisticChatReportID to requestMoney (so the action builds the chat with the same id the UI navigates to)', () => {
            createTransaction({
                ...baseParams,
                iouType: CONST.IOU.TYPE.REQUEST,
                report: undefined,
                participant: {accountID: 222, login: 'test@test.com'},
                optimisticChatReportID: 'ui-resolved-chat',
                allTransactionDrafts: {},
            });
            const requestMoneyArg = jest.mocked(TrackExpense.requestMoney).mock.calls.at(0)?.at(0);
            expect(requestMoneyArg?.optimisticChatReportID).toBe('ui-resolved-chat');
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

        const selfDMReport = createSelfDM(Number(SELF_DM_REPORT_ID), TEST_USER_ACCOUNT_ID);

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
            selfDMReport,
            betas: [CONST.BETAS.ALL],
            recentWaypoints: [] as RecentWaypoint[],
            optimisticTransactionID: 'mock-txn-id',
            optimisticChatReportID: 'mock-chat-id',
            isSelfTourViewed: false,
            amountOwed: 0,
            draftTransactionIDs: undefined,
            userBillingGracePeriodEnds: undefined,
            conciergeReportID: undefined,
            action: CONST.IOU.ACTION.CREATE,
            reportDraft: undefined,
            currentUserLocalCurrency: undefined,
            policyTagList: {},
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
            baseParams.recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];
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
                draftTransactionIDs: [baseParams.transactionID],
            });

            expect(Navigation.goBack).toHaveBeenCalledWith(backTo);
        });

        it('should default draftTransactionIDs to empty array when undefined is passed', () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                backTo,
                draftTransactionIDs: undefined,
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
                draftTransactionIDs: [baseParams.transactionID],
            });

            expect(Split.resetSplitShares).toHaveBeenCalledWith(splitTransaction, undefined, undefined, 1);
        });

        it('call trackExpense for TRACK iouType when from manual distance step and skipping confirmation', async () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                manualDistance: 20,
                shouldSkipConfirmation: true,
                iouType: CONST.IOU.TYPE.TRACK,
                draftTransactionIDs: [baseParams.transactionID],
            });

            expect(Split.resetSplitShares).not.toHaveBeenCalled();

            expect(TrackExpense.trackExpense).toHaveBeenCalledWith(
                expect.objectContaining({
                    report: baseParams.report,
                    isDraftPolicy: false,
                    // Action is nav-free — UI owns navigation; draft + optimistic IDs are threaded in.
                    existingTransaction: baseParams.transaction,
                    transactionParams: expect.objectContaining({
                        amount: 0,
                        distance: 20,
                        merchant: 'Pending...',
                        customUnitRateID: '_FAKE_P2P_ID_',
                    }),
                    currentUser: {accountID: baseParams.currentUserAccountID, email: baseParams.currentUserLogin},
                }),
            );
            const distanceTrackExpenseParams = jest.mocked(TrackExpense.trackExpense).mock.calls.at(-1)?.at(0);
            expect(typeof distanceTrackExpenseParams?.optimisticTransactionID).toBe('string');
            expect(typeof distanceTrackExpenseParams?.optimisticChatReportID).toBe('string');
            expect(distanceTrackExpenseParams && 'shouldHandleNavigation' in distanceTrackExpenseParams).toBeFalsy();

            // The function must return after trackExpense and not call createDistanceRequest
            expect(Split.createDistanceRequest).not.toHaveBeenCalled();
        });

        it('should pass the existing tracked transaction ID (not the optimistic id) to cleanup for a move-from-track distance submission', async () => {
            const EXISTING_TRACKED_TRANSACTION_ID = 'tracked-transaction-88';
            const linkedTrackedExpenseReportAction = {
                reportActionID: 'linked-action-1',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                created: '',
                originalMessage: {
                    IOUTransactionID: EXISTING_TRACKED_TRANSACTION_ID,
                    IOUReportID: 'tracked-report-1',
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };
            const movedTransaction = {
                ...fakeTransaction,
                linkedTrackedExpenseReportAction,
            };

            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                transaction: movedTransaction,
                manualDistance: 20,
                shouldSkipConfirmation: true,
                iouType: CONST.IOU.TYPE.TRACK,
                optimisticTransactionID: 'optimistic-should-be-ignored',
                draftTransactionIDs: [baseParams.transactionID],
            });

            await waitForBatchedUpdates();

            expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledTimes(1);
            expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionID: EXISTING_TRACKED_TRANSACTION_ID,
                }),
            );
        });

        // createDistanceRequest writes under the draft transaction, so cleanup must target that id — not the UI's optimistic one.
        it('should pass the written transaction id from createDistanceRequest (not the draft or optimistic id) to cleanup for a non-track distance submission', async () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                shouldSkipConfirmation: true,
                manualDistance: 20,
                iouType: CONST.IOU.TYPE.SUBMIT,
                optimisticTransactionID: 'optimistic-should-be-ignored',
                draftTransactionIDs: [baseParams.transactionID],
            });

            await waitForBatchedUpdates();

            expect(mockCleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionID: 'distance-written-id',
                }),
            );
        });

        it('should call trackExpense for TRACK iouType with valid waypoints when not from manual distance step and skipping confirmation', async () => {
            const policyForMovingExpenses: Policy = {
                ...fakePolicy,
                customUnits: {
                    C3745400EBD18: {
                        attributes: {
                            unit: 'mi',
                        },
                        customUnitID: 'C3745400EBD18',
                        defaultCategory: 'Car',
                        enabled: true,
                        name: 'Distance',
                        rates: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '4542B77F7C3F8': {
                                currency: 'ETB',
                                customUnitRateID: '4542B77F7C3F8',
                                enabled: true,
                                index: 0,
                                name: 'Default Rate',
                                rate: 70,
                            },
                        },
                    },
                },
            };
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                policyForMovingExpenses,
                manualDistance: undefined,
                shouldSkipConfirmation: true,
                iouType: CONST.IOU.TYPE.TRACK,
                draftTransactionIDs: [baseParams.transactionID],
            });

            await waitForBatchedUpdates();

            expect(Split.resetSplitShares).not.toHaveBeenCalled();

            const updatedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${baseParams.transactionID}`);
            const updatedDraftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${baseParams.transactionID}`);

            expect(updatedTransaction?.merchant).toBe('Pending...');
            expect(updatedDraftTransaction?.pendingFields).toMatchObject({
                waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            });

            expect(TrackExpense.trackExpense).toHaveBeenCalledWith(
                expect.objectContaining({
                    report: baseParams.report,
                    isDraftPolicy: false,
                    participantParams: expect.objectContaining({
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
                    }),
                    policyParams: expect.objectContaining({
                        policy: policyForMovingExpenses,
                    }),
                    transactionParams: expect.objectContaining({
                        amount: 0,
                        distance: undefined,
                        currency: fakeTransaction?.currency ?? 'USD',
                        created: fakeTransaction?.created ?? '',
                        merchant: 'Pending...',
                        receipt: {},
                        billable: false,
                        reimbursable: true,
                        validWaypoints: {},
                        customUnitRateID: DistanceRequestUtils.getCustomUnitRateID({
                            reportID: baseParams.report.reportID,
                            isTrackDistanceExpense: true,
                            policy: policyForMovingExpenses,
                            isPolicyExpenseChat: false,
                        }),
                    }),
                    isASAPSubmitBetaEnabled: baseParams.isASAPSubmitBetaEnabled,
                    currentUser: {accountID: baseParams.currentUserAccountID, email: baseParams.currentUserLogin},
                    quickAction: baseParams.quickAction,
                    recentWaypoints: baseParams.recentWaypoints,
                }),
            );
        });

        it('should call createDistanceRequest for non-TRACK iouType when from manual distance step and skipping confirmation', async () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                shouldSkipConfirmation: true,
                manualDistance: 20,
                iouType: CONST.IOU.TYPE.SUBMIT,
                draftTransactionIDs: [baseParams.transactionID],
            });

            expect(Split.createDistanceRequest).toHaveBeenCalledWith(
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
                        reimbursable: fakePolicy?.defaultReimbursable ?? true,
                        validWaypoints: undefined,
                        customUnitRateID: CONST.CUSTOM_UNITS.FAKE_P2P_ID,
                        splitShares: fakeTransaction?.splitShares,
                        attendees: fakeTransaction?.comment?.attendees,
                    }),
                    isASAPSubmitBetaEnabled: baseParams.isASAPSubmitBetaEnabled,
                    transactionViolations: baseParams.transactionViolations,
                    quickAction: baseParams.quickAction,
                    policyRecentlyUsedCurrencies: [],
                }),
            );
            const distanceParams = jest.mocked(Split.createDistanceRequest).mock.calls.at(-1)?.at(0);
            expect(distanceParams && 'shouldHandleNavigation' in distanceParams).toBeFalsy();
            expect(distanceParams && 'shouldDeferForSearch' in distanceParams).toBeFalsy();
            expect(distanceParams && 'backToReport' in distanceParams).toBeFalsy();
        });

        it('should call createDistanceRequest for non-TRACK iouType when not from manual distance step and skipping confirmation', () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                shouldSkipConfirmation: true,
                manualDistance: undefined,
                iouType: CONST.IOU.TYPE.SUBMIT,
                draftTransactionIDs: [baseParams.transactionID],
            });

            expect(Split.createDistanceRequest).toHaveBeenCalledWith(
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
                        reimbursable: fakePolicy?.defaultReimbursable ?? true,
                        validWaypoints: {},
                        customUnitRateID: CONST.CUSTOM_UNITS.FAKE_P2P_ID,
                        splitShares: fakeTransaction?.splitShares,
                        attendees: fakeTransaction?.comment?.attendees,
                    }),
                    isASAPSubmitBetaEnabled: baseParams.isASAPSubmitBetaEnabled,
                    transactionViolations: baseParams.transactionViolations,
                    quickAction: baseParams.quickAction,
                    policyRecentlyUsedCurrencies: [],
                }),
            );
            const distanceParams = jest.mocked(Split.createDistanceRequest).mock.calls.at(-1)?.at(0);
            expect(distanceParams && 'shouldHandleNavigation' in distanceParams).toBeFalsy();
            expect(distanceParams && 'shouldDeferForSearch' in distanceParams).toBeFalsy();
            expect(distanceParams && 'backToReport' in distanceParams).toBeFalsy();
        });

        it('should navigate to confirmation page when not skipping confirmation', async () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                shouldSkipConfirmation: false,
                iouType: CONST.IOU.TYPE.SUBMIT,
                draftTransactionIDs: [baseParams.transactionID],
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
                draftTransactionIDs: [baseParams.transactionID],
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
                draftTransactionIDs: [baseParams.transactionID],
            });
            await waitForBatchedUpdates();

            const updatedTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${baseParams.transactionID}`);
            expect(updatedTransaction?.reportID).toBe(CONST.REPORT.UNREPORTED_REPORT_ID);
        });

        it('should navigate to participants page when the user click create expense option (combined submit/track flow)', () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                iouType: CONST.IOU.TYPE.CREATE,
                draftTransactionIDs: [baseParams.transactionID],
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(CONST.IOU.TYPE.CREATE, baseParams.transactionID, baseParams.reportID));
        });

        it('should pass amountOwed through to shouldUseDefaultExpensePolicy and navigate to participants page when no default policy', () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                report: undefined,
                defaultExpensePolicy: undefined,
                iouType: CONST.IOU.TYPE.CREATE,
                amountOwed: 8010,
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(CONST.IOU.TYPE.CREATE, baseParams.transactionID, baseParams.reportID));
        });

        it('should pass ownerBillingGracePeriodEnd through to shouldUseDefaultExpensePolicy', () => {
            const pastDate = Math.floor(Date.now() / 1000) - 86400 * 30;
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                report: undefined,
                defaultExpensePolicy: undefined,
                iouType: CONST.IOU.TYPE.CREATE,
                amountOwed: 100,
                ownerBillingGracePeriodEnd: pastDate,
            });

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(CONST.IOU.TYPE.CREATE, baseParams.transactionID, baseParams.reportID));
        });

        it('should pass currentUserAccountID to shouldUseDefaultExpensePolicy so the billing restriction uses the explicit account, not the deprecated session value', () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                report: undefined,
                defaultExpensePolicy: fakePolicy,
                iouType: CONST.IOU.TYPE.CREATE,
            });

            const lastCallArgs = jest.mocked(shouldUseDefaultExpensePolicy).mock.calls.at(-1) ?? [];
            expect(lastCallArgs.at(5)).toBe(baseParams.currentUserAccountID);
        });

        it('should pass conciergeReportID through to getMoneyRequestParticipantOptions when report exists', async () => {
            const conciergeReportID = 'concierge789';
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                iouType: CONST.IOU.TYPE.SUBMIT,
                shouldSkipConfirmation: false,
                isArchivedExpenseReport: false,
                draftTransactionIDs: [baseParams.transactionID],
                conciergeReportID,
            });

            // When report exists and iouType is not CREATE, the function calls getMoneyRequestParticipantOptions
            // with conciergeReportID, sets distance request data, and then navigates to confirmation page
            await waitForBatchedUpdates();
            expect(baseParams.setDistanceRequestData).toHaveBeenCalled();
        });

        it('should set distance request data when conciergeReportID is undefined', async () => {
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                iouType: CONST.IOU.TYPE.SUBMIT,
                shouldSkipConfirmation: false,
                isArchivedExpenseReport: false,
                draftTransactionIDs: [baseParams.transactionID],
                conciergeReportID: undefined,
            });

            await waitForBatchedUpdates();
            expect(baseParams.setDistanceRequestData).toHaveBeenCalled();
        });

        it('should pass reportDraft to getMoneyRequestParticipantOptions and mark participant as disabled', async () => {
            let capturedParticipants: Participant[] = [];
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                iouType: CONST.IOU.TYPE.SUBMIT,
                shouldSkipConfirmation: false,
                isArchivedExpenseReport: false,
                draftTransactionIDs: [baseParams.transactionID],
                reportDraft: fakeReport,
                setDistanceRequestData: (participants) => {
                    capturedParticipants = participants;
                },
            });

            await waitForBatchedUpdates();
            expect(capturedParticipants.length).toBeGreaterThan(0);
            expect(capturedParticipants.at(0)).toMatchObject({isDisabled: true});
        });

        it('should not mark participant as disabled when reportDraft is undefined', async () => {
            let capturedParticipants: Participant[] = [];
            handleMoneyRequestStepDistanceNavigation({
                ...baseParams,
                iouType: CONST.IOU.TYPE.SUBMIT,
                shouldSkipConfirmation: false,
                isArchivedExpenseReport: false,
                draftTransactionIDs: [baseParams.transactionID],
                reportDraft: undefined,
                setDistanceRequestData: (participants) => {
                    capturedParticipants = participants;
                },
            });

            await waitForBatchedUpdates();
            expect(capturedParticipants.length).toBeGreaterThan(0);
            expect(capturedParticipants.at(0)).toMatchObject({isDisabled: false});
        });
    });

    describe('getMoneyRequestParticipantOptions', () => {
        const fakeReport = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
        const fakePolicy = createRandomPolicy(1, CONST.POLICY.TYPE.TEAM);

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
        });

        it('should return participants when conciergeReportID is undefined', () => {
            const participants = getMoneyRequestParticipantOptions(currentUserAccountID, fakeReport, fakePolicy, {}, undefined, undefined, undefined, undefined, translateLocal);
            expect(Array.isArray(participants)).toBe(true);
        });

        it('should return participants when conciergeReportID is provided', () => {
            const participants = getMoneyRequestParticipantOptions(currentUserAccountID, fakeReport, fakePolicy, {}, 'concierge123', undefined, undefined, undefined, translateLocal);
            expect(Array.isArray(participants)).toBe(true);
        });

        it('should pass conciergeReportID through to getReportOption for policy expense chat participants', () => {
            const participants = getMoneyRequestParticipantOptions(currentUserAccountID, fakeReport, fakePolicy, {}, 'concierge456', undefined, undefined, undefined, translateLocal);
            // For policy expense chat, participants have accountID 0 and go through getReportOption
            // which uses conciergeReportID for identifying concierge chat
            expect(Array.isArray(participants)).toBe(true);
            expect(participants.length).toBeGreaterThan(0);
        });

        it('should return participants with privateIsArchived passed through', () => {
            const participants = getMoneyRequestParticipantOptions(currentUserAccountID, fakeReport, fakePolicy, {}, undefined, true, undefined, undefined, translateLocal);
            expect(Array.isArray(participants)).toBe(true);
        });

        it('should return participants for report with no chat participants (DM-like)', () => {
            const dmReport = {
                ...createRandomReport(2, undefined),
                participants: {},
            };
            const participants = getMoneyRequestParticipantOptions(currentUserAccountID, dmReport, fakePolicy, {}, undefined, undefined, undefined, undefined, translateLocal);
            expect(Array.isArray(participants)).toBe(true);
        });

        it('should mark policy expense chat participant as disabled when reportDrafts contains the report', () => {
            const participants = getMoneyRequestParticipantOptions(currentUserAccountID, fakeReport, fakePolicy, {}, undefined, undefined, undefined, fakeReport, translateLocal);
            expect(Array.isArray(participants)).toBe(true);
            expect(participants.length).toBeGreaterThan(0);
            expect(participants.at(0)).toMatchObject({isDisabled: true});
        });

        it('should not mark participant as disabled when reportDraft is undefined', () => {
            const participants = getMoneyRequestParticipantOptions(currentUserAccountID, fakeReport, fakePolicy, {}, undefined, undefined, undefined, undefined, translateLocal);
            expect(Array.isArray(participants)).toBe(true);
            expect(participants.length).toBeGreaterThan(0);
            expect(participants.at(0)).toMatchObject({isDisabled: false});
        });

        it('should not mark participant as disabled when reportDrafts is undefined', () => {
            const participants = getMoneyRequestParticipantOptions(currentUserAccountID, fakeReport, fakePolicy, {}, undefined, undefined, undefined, undefined, translateLocal);
            expect(Array.isArray(participants)).toBe(true);
            expect(participants.length).toBeGreaterThan(0);
            // When reportDrafts is undefined, isDraftReport is called which checks Onyx directly
            // and since no draft is set, isDisabled should be false
            expect(participants.at(0)).toMatchObject({isDisabled: false});
        });
    });

    describe('shouldUseDefaultExpensePolicy', () => {
        const fakePolicy = createRandomPolicy(1, CONST.POLICY.TYPE.TEAM);

        it('should return true when iouType is CREATE with a paid group policy that has expense chat enabled and no billing restrictions', () => {
            const policy = {
                ...fakePolicy,
                type: CONST.POLICY.TYPE.TEAM,
                isPolicyExpenseChatEnabled: true,
            };

            expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.CREATE, policy, 0, undefined, undefined, currentUserAccountID)).toBe(true);
        });

        it('should return false when iouType is not CREATE', () => {
            const policy = {
                ...fakePolicy,
                type: CONST.POLICY.TYPE.TEAM,
                isPolicyExpenseChatEnabled: true,
            };

            expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.SUBMIT, policy, 0, undefined, undefined, currentUserAccountID)).toBe(false);
            expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.TRACK, policy, 0, undefined, undefined, currentUserAccountID)).toBe(false);
            expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.SPLIT, policy, 0, undefined, undefined, currentUserAccountID)).toBe(false);
        });

        it('should return false when policy is not a paid group policy', () => {
            const policy = {
                ...fakePolicy,
                type: CONST.POLICY.TYPE.PERSONAL,
                isPolicyExpenseChatEnabled: true,
            };

            expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.CREATE, policy, 0, undefined, undefined, currentUserAccountID)).toBe(false);
        });

        it('should return false when isPolicyExpenseChatEnabled is false', () => {
            const policy = {
                ...fakePolicy,
                type: CONST.POLICY.TYPE.TEAM,
                isPolicyExpenseChatEnabled: false,
            };

            expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.CREATE, policy, 0, undefined, undefined, currentUserAccountID)).toBe(false);
        });

        it('should return false when policy is undefined', () => {
            expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.CREATE, undefined, 0, undefined, undefined, currentUserAccountID)).toBe(false);
        });

        it('should return false when policy is null', () => {
            expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.CREATE, null, 0, undefined, undefined, currentUserAccountID)).toBe(false);
        });

        it('should handle amountOwed being undefined', () => {
            const policy = {
                ...fakePolicy,
                type: CONST.POLICY.TYPE.TEAM,
                isPolicyExpenseChatEnabled: true,
            };

            expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.CREATE, policy, undefined, undefined, undefined, currentUserAccountID)).toBe(true);
        });

        it('should pass ownerBillingGracePeriodEnd through to shouldRestrictUserBillableActions', async () => {
            const policy = {
                ...fakePolicy,
                type: CONST.POLICY.TYPE.TEAM,
                isPolicyExpenseChatEnabled: true,
                ownerAccountID: TEST_USER_ACCOUNT_ID,
            };
            const pastDate = Math.floor(Date.now() / 1000) - 86400 * 30;

            await Onyx.set(ONYXKEYS.SESSION, {accountID: TEST_USER_ACCOUNT_ID});
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            expect(shouldUseDefaultExpensePolicy(CONST.IOU.TYPE.CREATE, policy, 100, undefined, pastDate, TEST_USER_ACCOUNT_ID)).toBe(false);

            await Onyx.clear();
        });
    });
});
