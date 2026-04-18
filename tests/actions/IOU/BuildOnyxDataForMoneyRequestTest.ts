import Onyx from 'react-native-onyx';
import {buildOnyxDataForMoneyRequest} from '@libs/actions/IOU';
import {getOriginalMessage} from '@libs/ReportActionsUtils';
import type {OptimisticCreatedReportAction, OptimisticIOUReportAction} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';
import {createSelfDM} from '../../utils/collections/reports';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'user@example.com';
const PAYER_ACCOUNT_ID = 2;
const SELF_DM_REPORT_ID = '100';
const CHAT_REPORT_ID = '200';
const IOU_REPORT_ID = '300';
const TRANSACTION_ID = 'txn-111';
const IOU_ACTION_ID = 'action-222';
const CREATED_ACTION_ID = 'created-action-333';
const REPORT_PREVIEW_ACTION_ID = 'preview-action-444';
const THREAD_REPORT_ID = 'thread-555';

function buildMockIouAction(iouReportID: string): OptimisticIOUReportAction {
    return {
        reportActionID: IOU_ACTION_ID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: CURRENT_USER_ACCOUNT_ID,
        automatic: false,
        avatar: '',
        isAttachmentOnly: false,
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        originalMessage: {
            amount: 1000,
            comment: 'Test split',
            currency: CONST.CURRENCY.USD,
            IOUTransactionID: TRANSACTION_ID,
            IOUReportID: iouReportID,
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        },
        message: undefined,
        person: [],
        shouldShow: true,
        created: '2024-01-01 00:00:00.000',
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        receipt: undefined,
        childReportID: undefined,
        childVisibleActionCount: undefined,
        childCommenterCount: undefined,
        delegateAccountID: undefined,
    } as unknown as OptimisticIOUReportAction;
}

function buildMockCreatedAction(reportActionID: string): OptimisticCreatedReportAction {
    return {
        reportActionID,
        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
        actorAccountID: CURRENT_USER_ACCOUNT_ID,
        automatic: false,
        avatar: '',
        created: '2024-01-01 00:00:00.000',
        message: undefined,
        person: [],
        shouldShow: true,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    } as unknown as OptimisticCreatedReportAction;
}

function buildMockReportPreviewAction(): ReportAction {
    return {
        reportActionID: REPORT_PREVIEW_ACTION_ID,
        actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
        actorAccountID: CURRENT_USER_ACCOUNT_ID,
        created: '2024-01-01 00:00:00.000',
        shouldShow: true,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        message: undefined,
        person: [],
    } as unknown as ReportAction;
}

function buildMockTransaction(reportID: string): Transaction {
    return {
        transactionID: TRANSACTION_ID,
        reportID,
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        created: '2024-01-01',
        merchant: 'Test Merchant',
        comment: {comment: ''},
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        pendingFields: {amount: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
    } as unknown as Transaction;
}

function buildMockIouReport(reportID: string, chatReportID: string): Report {
    return {
        reportID,
        type: CONST.REPORT.TYPE.IOU,
        chatReportID,
        currency: CONST.CURRENCY.USD,
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        managerID: PAYER_ACCOUNT_ID,
        total: 1000,
        participants: {
            [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
            [PAYER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
        },
    } as unknown as Report;
}

function buildMockChatReport(reportID: string): Report {
    return {
        reportID,
        type: CONST.REPORT.TYPE.CHAT,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        participants: {
            [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            [PAYER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
        },
    } as unknown as Report;
}

function buildMockThreadReport(reportID: string, parentReportID: string): Report {
    return {
        reportID,
        type: CONST.REPORT.TYPE.CHAT,
        parentReportID,
    } as unknown as Report;
}

type BuildOnyxDataParams = Parameters<typeof buildOnyxDataForMoneyRequest>[0];

function buildBaseOptimisticParams(iouReportID: string): BuildOnyxDataParams['optimisticParams'] {
    return {
        chat: {
            report: buildMockChatReport(CHAT_REPORT_ID),
            createdAction: buildMockCreatedAction(CREATED_ACTION_ID),
            reportPreviewAction: buildMockReportPreviewAction(),
        },
        iou: {
            report: buildMockIouReport(iouReportID, CHAT_REPORT_ID),
            createdAction: buildMockCreatedAction(`${CREATED_ACTION_ID}-iou`),
            action: buildMockIouAction(iouReportID),
        },
        transactionParams: {
            transaction: buildMockTransaction(iouReportID),
            transactionThreadReport: buildMockThreadReport(THREAD_REPORT_ID, iouReportID),
            transactionThreadCreatedReportAction: buildMockCreatedAction(`${CREATED_ACTION_ID}-thread`),
        },
        policyRecentlyUsed: {},
    };
}

describe('buildOnyxDataForMoneyRequest', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('isSelfDMSplit behavior', () => {
        describe('when isSelfDMSplit=true and selfDMReportID is provided', () => {
            const selfDMReport = createSelfDM(Number(SELF_DM_REPORT_ID), CURRENT_USER_ACCOUNT_ID);

            function buildSelfDMParams(): BuildOnyxDataParams {
                return {
                    isNewChatReport: false,
                    shouldCreateNewMoneyRequestReport: false,
                    shouldGenerateTransactionThreadReport: true,
                    isASAPSubmitBetaEnabled: false,
                    currentUserAccountIDParam: CURRENT_USER_ACCOUNT_ID,
                    currentUserEmailParam: CURRENT_USER_EMAIL,
                    hasViolations: false,
                    quickAction: undefined,
                    isSelfDMSplit: true,
                    selfDMReportID: selfDMReport.reportID,
                    optimisticParams: buildBaseOptimisticParams(IOU_REPORT_ID),
                };
            }

            it('optimisticData sets transaction via SET', () => {
                const {optimisticData} = buildOnyxDataForMoneyRequest(buildSelfDMParams());
                const txnEntry = optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);

                expect(txnEntry).toBeDefined();
                expect(txnEntry?.onyxMethod).toBe(Onyx.METHOD.SET);
            });

            it('optimisticData adds IOU action to selfDM report actions with type patched to TRACK', () => {
                const {optimisticData} = buildOnyxDataForMoneyRequest(buildSelfDMParams());
                const actionsEntry = optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`);

                expect(actionsEntry).toBeDefined();
                expect(actionsEntry?.onyxMethod).toBe(Onyx.METHOD.MERGE);

                const entryValue = actionsEntry?.value as Record<string, ReportAction>;
                const storedAction = entryValue?.[IOU_ACTION_ID] as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>;
                const originalMessage = getOriginalMessage(storedAction);

                expect(storedAction).toBeDefined();
                expect(originalMessage?.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.TRACK);
                expect(originalMessage?.IOUReportID).toBeUndefined();
            });

            it('optimisticData updates selfDM report lastVisibleActionCreated', () => {
                const {optimisticData} = buildOnyxDataForMoneyRequest(buildSelfDMParams());
                const reportEntry = optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`);

                expect(reportEntry).toBeDefined();
                expect(reportEntry?.onyxMethod).toBe(Onyx.METHOD.MERGE);
                expect((reportEntry?.value as Partial<Report>)?.lastVisibleActionCreated).toBeDefined();
            });

            it('optimisticData adds transaction thread report with parentReportID and chatReportID pointing to selfDM', () => {
                const {optimisticData} = buildOnyxDataForMoneyRequest(buildSelfDMParams());
                const threadEntry = optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`);

                expect(threadEntry).toBeDefined();
                expect((threadEntry?.value as Partial<Report>)?.parentReportID).toBe(selfDMReport.reportID);
                expect((threadEntry?.value as Partial<Report>)?.chatReportID).toBe(selfDMReport.reportID);
            });

            it('optimisticData does NOT add a standard IOU report entry', () => {
                const {optimisticData} = buildOnyxDataForMoneyRequest(buildSelfDMParams());
                const iouReportEntry = optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`);

                expect(iouReportEntry).toBeUndefined();
            });

            it('optimisticData does NOT add a standard chat report entry', () => {
                const {optimisticData} = buildOnyxDataForMoneyRequest(buildSelfDMParams());
                const chatReportEntry = optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`);

                expect(chatReportEntry).toBeUndefined();
            });

            it('optimisticData does NOT add IOU report actions', () => {
                const {optimisticData} = buildOnyxDataForMoneyRequest(buildSelfDMParams());
                const iouActionsEntry = optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`);

                expect(iouActionsEntry).toBeUndefined();
            });

            it('successData clears transaction pendingAction and pendingFields', () => {
                const {successData} = buildOnyxDataForMoneyRequest(buildSelfDMParams());
                const txnEntry = successData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);

                expect(txnEntry).toBeDefined();
                expect((txnEntry?.value as Partial<Transaction>)?.pendingAction).toBeNull();
                expect((txnEntry?.value as Partial<Transaction>)?.pendingFields).toBeDefined();
            });

            it('successData clears IOU action pending state in selfDM report', () => {
                const {successData} = buildOnyxDataForMoneyRequest(buildSelfDMParams());
                const actionsEntry = successData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`);

                expect(actionsEntry).toBeDefined();
                const entryValue = actionsEntry?.value as Record<string, Partial<ReportAction>>;
                const storedAction = entryValue?.[IOU_ACTION_ID];
                expect(storedAction?.pendingAction).toBeNull();
                expect(storedAction?.errors).toBeNull();
                expect(storedAction?.isOptimisticAction).toBeNull();
            });

            it('successData does NOT include standard IOU report success entry', () => {
                const {successData} = buildOnyxDataForMoneyRequest(buildSelfDMParams());
                const iouReportEntry = successData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`);

                expect(iouReportEntry).toBeUndefined();
            });

            it('successData does NOT include standard chat report success entry', () => {
                const {successData} = buildOnyxDataForMoneyRequest(buildSelfDMParams());
                const chatReportEntry = successData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`);

                expect(chatReportEntry).toBeUndefined();
            });

            it('failureData sets error on transaction', () => {
                const {failureData} = buildOnyxDataForMoneyRequest(buildSelfDMParams());
                const txnEntry = failureData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);

                expect(txnEntry).toBeDefined();
                expect((txnEntry?.value as Partial<Transaction>)?.errors).toBeDefined();
            });

            it('failureData sets error on IOU action in selfDM report', () => {
                const {failureData} = buildOnyxDataForMoneyRequest(buildSelfDMParams());
                const actionsEntry = failureData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`);

                expect(actionsEntry).toBeDefined();
                const entryValue = actionsEntry?.value as Record<string, Partial<ReportAction>>;
                const storedAction = entryValue?.[IOU_ACTION_ID];
                expect(storedAction?.errors).toBeDefined();
            });

            it('failureData does NOT include standard chat report failure entry', () => {
                const {failureData} = buildOnyxDataForMoneyRequest(buildSelfDMParams());
                const chatReportEntry = failureData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`);

                expect(chatReportEntry).toBeUndefined();
            });
        });

        describe('when isSelfDMSplit=false (standard flow)', () => {
            function buildStandardParams(): BuildOnyxDataParams {
                return {
                    isNewChatReport: false,
                    shouldCreateNewMoneyRequestReport: false,
                    shouldGenerateTransactionThreadReport: false,
                    isASAPSubmitBetaEnabled: false,
                    currentUserAccountIDParam: CURRENT_USER_ACCOUNT_ID,
                    currentUserEmailParam: CURRENT_USER_EMAIL,
                    hasViolations: false,
                    quickAction: undefined,
                    isSelfDMSplit: false,
                    optimisticParams: buildBaseOptimisticParams(IOU_REPORT_ID),
                };
            }

            it('optimisticData includes IOU report entry', () => {
                const {optimisticData} = buildOnyxDataForMoneyRequest(buildStandardParams());
                const iouReportEntry = optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`);

                expect(iouReportEntry).toBeDefined();
            });

            it('optimisticData includes chat report entry', () => {
                const {optimisticData} = buildOnyxDataForMoneyRequest(buildStandardParams());
                const chatReportEntry = optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`);

                expect(chatReportEntry).toBeDefined();
            });

            it('optimisticData does NOT add an IOU action to selfDM report', () => {
                const {optimisticData} = buildOnyxDataForMoneyRequest(buildStandardParams());
                const selfDMActionsEntry = optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${SELF_DM_REPORT_ID}`);

                expect(selfDMActionsEntry).toBeUndefined();
            });
        });

        describe('when isSelfDMSplit=true but selfDMReportID is undefined', () => {
            function buildNoSelfDMReportIDParams(): BuildOnyxDataParams {
                return {
                    isNewChatReport: false,
                    shouldCreateNewMoneyRequestReport: false,
                    shouldGenerateTransactionThreadReport: false,
                    isASAPSubmitBetaEnabled: false,
                    currentUserAccountIDParam: CURRENT_USER_ACCOUNT_ID,
                    currentUserEmailParam: CURRENT_USER_EMAIL,
                    hasViolations: false,
                    quickAction: undefined,
                    isSelfDMSplit: true,
                    selfDMReportID: undefined,
                    optimisticParams: buildBaseOptimisticParams(IOU_REPORT_ID),
                };
            }

            it('falls back to standard flow and includes IOU report entry', () => {
                const {optimisticData} = buildOnyxDataForMoneyRequest(buildNoSelfDMReportIDParams());
                const iouReportEntry = optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`);

                expect(iouReportEntry).toBeDefined();
            });

            it('does NOT add IOU action to selfDM report when selfDMReportID is undefined', () => {
                const {optimisticData} = buildOnyxDataForMoneyRequest(buildNoSelfDMReportIDParams());
                const selfDMActionsEntry = optimisticData?.find((entry) => entry.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${SELF_DM_REPORT_ID}`);

                expect(selfDMActionsEntry).toBeUndefined();
            });
        });
    });
});
