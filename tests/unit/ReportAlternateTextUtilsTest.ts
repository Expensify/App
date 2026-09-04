/* eslint-disable @typescript-eslint/naming-convention */
import {act, renderHook} from '@testing-library/react-native';

import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import useReportIsArchived from '@hooks/useReportIsArchived';

import {getAddAgentRuleMessage, getDeleteAgentRuleMessage, getUpdateAgentRuleMessage} from '@libs/AgentRuleChangeLogUtils';
import DateUtils from '@libs/DateUtils';
import {translate} from '@libs/Localize';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Parser from '@libs/Parser';
import {
    getAddedCardFeedMessage,
    getAssignedCompanyCardMessage,
    getChangedApproverActionMessage,
    getCurrencyDefaultTaxUpdateMessage,
    getCustomTaxNameUpdateMessage,
    getDynamicExternalWorkflowRoutedMessage,
    getForeignCurrencyDefaultTaxUpdateMessage,
    getRemovedCardFeedMessage,
    getRenamedCardFeedMessage,
    getRequireCompanyCardsEnabledMessage,
    getRequiresCategoryMessage,
    getRequiresTagMessage,
    getUnassignedCompanyCardMessage,
    getUpdatedAutoHarvestingMessage,
    getUpdatedCardFeedLiabilityMessage,
    getUpdatedCardFeedStatementPeriodMessage,
    getWorkspaceCustomUnitRateUpdatedMessage,
} from '@libs/ReportActionsUtils';
import {
    getLastActorDisplayName,
    getLastActorDisplayNameFromLastVisibleActions,
    getLastMessageTextForReport,
    getReportAlternateText,
    getWelcomeMessage,
    shouldShowLastActorDisplayName,
} from '@libs/ReportAlternateTextUtils';
import {formatReportLastMessageText, getMovedActionMessage, getMovedTransactionMessage, getReportPreviewReportActionMessage, parseMovedTransactionReportIDs} from '@libs/ReportUtils';
import {isScanning} from '@libs/TransactionUtils';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList, Policy, Report, ReportAction, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import createMock from '../utils/createMock';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import {convertToDisplayString, formatPhoneNumber, getCurrencyDecimalsLocal, localeCompare, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());

const CURRENT_USER_LOGIN = 'test@example.com';
const CURRENT_USER_ACCOUNT_ID = 5;

const PERSONAL_DETAILS: PersonalDetailsList = {
    1: {accountID: 1, login: 'alice@test.com', displayName: 'Alice Aluminum', firstName: 'Alice'},
    2: {accountID: 2, login: 'bob@test.com', displayName: 'Bob Boron', firstName: 'Bob'},
    [CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_LOGIN, displayName: 'Current User'},
};

const policyID = 'ABC123';

const POLICY: Policy = {
    id: policyID,
    name: 'Hero Policy',
    role: 'user',
    type: CONST.POLICY.TYPE.TEAM,
    owner: 'reedrichards@expensify.com',
    outputCurrency: '',
    approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
};

function makeReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: '100',
        type: CONST.REPORT.TYPE.CHAT,
        reportName: '#test-room',
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
        policyID: '6',
        lastVisibleActionCreated: '2024-01-01 00:00:00.000',
        participants: {
            1: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
        },
        ...overrides,
    };
}

function makeAction(actionName: ReportAction['actionName'], overrides: Partial<ReportAction> = {}): ReportAction {
    return {
        reportActionID: '1',
        actionName,
        created: '2024-01-01 00:00:00.000',
        actorAccountID: 1,
        person: [{type: 'TEXT', style: 'strong', text: 'Alice Aluminum'}],
        message: [{type: 'COMMENT', html: '<em>Fixture message html</em>', text: 'Fixture message text', isDeletedParentAction: false, deleted: ''}],
        ...overrides,
    } as ReportAction;
}

type AlternateTextCase = {
    report?: Report;
    lastAction?: ReportAction;
    lastMessageTextFromReport?: string;
    isReportArchived?: boolean;
};

function getAlternateText({report = makeReport(), lastAction, lastMessageTextFromReport = 'Fixture last message', isReportArchived = false}: AlternateTextCase): string | undefined {
    return getReportAlternateText({
        report,
        lastAction,
        lastActionReport: undefined,
        card: undefined,
        lastMessageTextFromReport,
        personalDetails: PERSONAL_DETAILS,
        policy: undefined,
        invoiceReceiverPolicy: undefined,
        isReportArchived,
        privateIsArchived: isReportArchived,
        conciergeReportID: '999',
        currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
        currentUserLogin: CURRENT_USER_LOGIN,
        translate: translateLocal,
        localeCompare,
        formatPhoneNumber,
        dateFnsLocale: undefined,
        convertToDisplayString,
    });
}

describe('ReportAlternateTextUtils', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        IntlStore.load(CONST.LOCALES.EN);
        initOnyxDerivedValues();
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    describe('getLastActorDisplayName', () => {
        it('should return an empty string when lastActorDetails is null', () => {
            expect(getLastActorDisplayName(null, CURRENT_USER_ACCOUNT_ID, translateLocal)).toBe('');
        });

        it('should return the Concierge display name for the Concierge account', () => {
            expect(getLastActorDisplayName({accountID: CONST.ACCOUNT_ID.CONCIERGE}, CURRENT_USER_ACCOUNT_ID, translateLocal)).toBe(CONST.CONCIERGE_DISPLAY_NAME);
        });

        it('should return the "you" translation when the actor is the current user', () => {
            expect(getLastActorDisplayName(PERSONAL_DETAILS[CURRENT_USER_ACCOUNT_ID], CURRENT_USER_ACCOUNT_ID, translateLocal)).toBe(translateLocal('common.you'));
        });

        it('should prefer firstName for other users', () => {
            expect(getLastActorDisplayName(PERSONAL_DETAILS[1], CURRENT_USER_ACCOUNT_ID, translateLocal)).toBe('Alice');
        });

        it('should fall back to displayName when firstName is missing', () => {
            const details: Partial<PersonalDetails> = {accountID: 42, displayName: 'Mystery Person'};
            expect(getLastActorDisplayName(details, CURRENT_USER_ACCOUNT_ID, translateLocal)).toBe('Mystery Person');
        });

        it('should resolve the you label and hidden fallback through the provided translate function', () => {
            const translateWithMarkers: LocalizedTranslate = (path, ...parameters) => {
                if (path === 'common.you') {
                    return 'YouMarker';
                }
                if (path === 'common.hidden') {
                    return 'HiddenMarker';
                }
                return translateLocal(path, ...parameters);
            };

            expect(getLastActorDisplayName(PERSONAL_DETAILS[CURRENT_USER_ACCOUNT_ID], CURRENT_USER_ACCOUNT_ID, translateWithMarkers)).toBe('YouMarker');
            expect(getLastActorDisplayName({accountID: 999}, CURRENT_USER_ACCOUNT_ID, translateWithMarkers)).toBe('HiddenMarker');
        });
    });

    describe('shouldShowLastActorDisplayName', () => {
        const lastActorDetails: Partial<PersonalDetails> = PERSONAL_DETAILS[1] ?? {};

        it('should return false when there is no last action and no report lastActionType', () => {
            expect(shouldShowLastActorDisplayName(makeReport(), lastActorDetails, undefined, CURRENT_USER_ACCOUNT_ID, translateLocal)).toBe(false);
        });

        it('should return false for a self DM', () => {
            const report = makeReport({chatType: CONST.REPORT.CHAT_TYPE.SELF_DM});
            expect(shouldShowLastActorDisplayName(report, lastActorDetails, makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT), CURRENT_USER_ACCOUNT_ID, translateLocal)).toBe(false);
        });

        it('should return false for a DM when the actor is another user', () => {
            const report = makeReport({
                chatType: undefined,
                participants: {
                    1: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            });
            expect(shouldShowLastActorDisplayName(report, lastActorDetails, makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT), CURRENT_USER_ACCOUNT_ID, translateLocal)).toBe(false);
        });

        it('should return false when the last action is an IOU action', () => {
            expect(shouldShowLastActorDisplayName(makeReport(), lastActorDetails, makeAction(CONST.REPORT.ACTIONS.TYPE.IOU), CURRENT_USER_ACCOUNT_ID, translateLocal)).toBe(false);
        });

        it('should return true in a room when the actor is known', () => {
            expect(shouldShowLastActorDisplayName(makeReport(), lastActorDetails, makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT), CURRENT_USER_ACCOUNT_ID, translateLocal)).toBe(true);
        });

        it('should return false when lastActorDetails is null', () => {
            expect(shouldShowLastActorDisplayName(makeReport(), null, makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT), CURRENT_USER_ACCOUNT_ID, translateLocal)).toBe(false);
        });

        it('should return true in a group chat when the last actor is the current user', () => {
            expect(
                shouldShowLastActorDisplayName(
                    makeReport({chatType: CONST.REPORT.CHAT_TYPE.GROUP}),
                    PERSONAL_DETAILS[CURRENT_USER_ACCOUNT_ID],
                    makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT),
                    CURRENT_USER_ACCOUNT_ID,
                    translateLocal,
                ),
            ).toBe(true);
        });

        it('should return true in a DM when the last actor is the current user', () => {
            expect(
                shouldShowLastActorDisplayName(
                    makeReport({
                        chatType: undefined,
                        participants: {
                            1: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                            [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                        },
                    }),
                    PERSONAL_DETAILS[CURRENT_USER_ACCOUNT_ID],
                    makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT),
                    CURRENT_USER_ACCOUNT_ID,
                    translateLocal,
                ),
            ).toBe(true);
        });
    });

    describe('getLastActorDisplayNameFromLastVisibleActions', () => {
        it('should resolve the actor from personal details via the last action actorAccountID', () => {
            const result = getLastActorDisplayNameFromLastVisibleActions(
                makeReport(),
                null,
                CURRENT_USER_ACCOUNT_ID,
                PERSONAL_DETAILS,
                false,
                translateLocal,
                undefined,
                makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT),
            );
            expect(result).toBe('Alice');
        });

        it('should fall back to the action person text when personal details miss the actor', () => {
            const result = getLastActorDisplayNameFromLastVisibleActions(
                makeReport(),
                null,
                CURRENT_USER_ACCOUNT_ID,
                PERSONAL_DETAILS,
                false,
                translateLocal,
                undefined,
                makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, {actorAccountID: 42, person: [{type: 'TEXT', style: 'strong', text: 'Mystery Person'}]}),
            );
            expect(result).toBe('Mystery Person');
        });

        it('should fall back to the passed lastActorDetails when there is no last action', () => {
            const result = getLastActorDisplayNameFromLastVisibleActions(makeReport(), PERSONAL_DETAILS[2] ?? null, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, false, translateLocal);
            expect(result).toBe('Bob');
        });

        // These cases don't pass lastAction, so the actor is resolved through getLastVisibleAction reading report actions from Onyx
        describe('with Onyx-backed last visible actions', () => {
            const SPIDER_MAN_DETAILS: Partial<PersonalDetails> = {
                accountID: 3,
                displayName: 'Spider-Man',
                login: 'spiderman@test.com',
            };
            const PERSONAL_DETAILS_WITH_SPIDER_MAN: PersonalDetailsList = {
                ...PERSONAL_DETAILS,
                3: {accountID: 3, login: 'spiderman@test.com', displayName: 'Spider-Man'},
            };

            function makeCommentAction(actorAccountID: number | undefined, overrides: Partial<ReportAction> = {}): ReportAction {
                return {
                    ...createRandomReportAction(actorAccountID ?? CONST.DEFAULT_NUMBER_ID),
                    reportActionID: 'action-1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    actorAccountID,
                    created: DateUtils.getDBTime(),
                    message: [
                        {
                            type: 'COMMENT',
                            text: 'Test message',
                            html: 'Test message',
                            isEdited: false,
                            isDeletedParentAction: false,
                            whisperedTo: [],
                        },
                    ],
                    shouldShow: true,
                    pendingAction: null,
                    ...overrides,
                } as ReportAction;
            }

            async function mergeReportWithAction(reportID: string, report: Report, reportAction: ReportAction) {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                    [reportAction.reportActionID]: reportAction,
                });
                await waitForBatchedUpdates();
            }

            it('should return display name from lastActorDetails when no last visible action exists', () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'test-report-1',
                };

                const result = getLastActorDisplayNameFromLastVisibleActions(report, SPIDER_MAN_DETAILS, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, undefined, translateLocal);

                expect(result).toBe('Spider-Man');
            });

            it('should return display name from personalDetails when last visible action exists and actor is found in personalDetails', async () => {
                const reportID = 'test-report-2';
                const actorAccountID = 3;
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID,
                    lastActorAccountID: actorAccountID,
                };
                const lastActorDetails: Partial<PersonalDetails> = PERSONAL_DETAILS[1] ?? {};

                await mergeReportWithAction(reportID, report, makeCommentAction(actorAccountID));

                const result = getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS_WITH_SPIDER_MAN, undefined, translateLocal);

                expect(result).toBe('Spider-Man');
            });

            it('should return display name from reportAction.person when actor is not found in personalDetails', async () => {
                const reportID = 'test-report-3';
                const actorAccountID = 999;
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID,
                    lastActorAccountID: actorAccountID,
                };
                const lastActorDetails: Partial<PersonalDetails> = PERSONAL_DETAILS[1] ?? {};

                await mergeReportWithAction(reportID, report, makeCommentAction(actorAccountID, {reportActionID: 'action-2', person: [{text: 'Unknown User', type: 'TEXT'}]}));

                const result = getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, undefined, translateLocal);

                expect(result).toBe('Unknown User');
            });

            it('should return "You" when the last actor is the current user', async () => {
                const reportID = 'test-report-4';
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID,
                    lastActorAccountID: CURRENT_USER_ACCOUNT_ID,
                };
                const lastActorDetails: Partial<PersonalDetails> = PERSONAL_DETAILS[1] ?? {};

                await mergeReportWithAction(reportID, report, makeCommentAction(CURRENT_USER_ACCOUNT_ID, {reportActionID: 'action-3'}));

                const result = getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, undefined, translateLocal);

                expect(result).toBe('You');
            });

            it('should fall back to lastActorDetails when last visible action exists but actor cannot be determined', async () => {
                const reportID = 'test-report-5';
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID,
                };
                const lastActorDetails: Partial<PersonalDetails> = {
                    ...SPIDER_MAN_DETAILS,
                    firstName: 'Spider',
                };

                // Empty person array so no actorDetails can be built from the action itself
                await mergeReportWithAction(reportID, report, makeCommentAction(undefined, {reportActionID: 'action-4', person: []}));

                const result = getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, undefined, translateLocal);

                // getLastActorDisplayName prefers firstName when available
                expect(result).toBe('Spider');
            });

            it('should use privateIsArchived string to determine archived status', () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'test-report-archived',
                };

                const result = getLastActorDisplayNameFromLastVisibleActions(report, SPIDER_MAN_DETAILS, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, true, translateLocal);

                // Still resolves from lastActorDetails since there's no last visible action
                expect(result).toBe('Spider-Man');
            });
        });
    });

    describe('getReportAlternateText', () => {
        it('should prefix a room comment with the actor display name', () => {
            expect(getAlternateText({lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT)})).toBe('Alice: Fixture last message');
        });

        it('should use the "you" prefix for the current user comment', () => {
            const lastAction = makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, {actorAccountID: CURRENT_USER_ACCOUNT_ID, person: [{type: 'TEXT', style: 'strong', text: 'Current User'}]});
            expect(getAlternateText({lastAction})).toBe(`${translateLocal('common.you')}: Fixture last message`);
        });

        it('should not prefix the message when the report is archived', () => {
            expect(getAlternateText({lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT), isReportArchived: true})).toBe('Fixture last message');
        });

        it('should strip the SMS domain from the last message text', () => {
            expect(getAlternateText({lastMessageTextFromReport: `+15857527441${CONST.SMS.DOMAIN}`, lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT)})).toBe(
                'Alice: +15857527441',
            );
        });

        it('should return the renamed room message for a RENAMED action', () => {
            const lastAction = makeAction(CONST.REPORT.ACTIONS.TYPE.RENAMED, {originalMessage: {oldName: '#old-room', newName: '#new-room', lastModified: ''}});
            expect(getAlternateText({lastAction})).toBe('Alice renamed this room to "#new-room" (previously "#old-room")');
        });

        it('should return the plain last message for a report preview in a workspace chat', () => {
            const report = makeReport({chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, reportName: 'Workspace chat'});
            expect(getAlternateText({report, lastAction: makeAction(CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW), lastMessageTextFromReport: 'owes $1.00'})).toBe('owes $1.00');
        });
    });

    describe('getLastMessageTextForReport', () => {
        describe('getReportPreviewMessage', () => {
            it('should format report preview message correctly for non-policy expense chat with IOU action', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    isOwnPolicyExpenseChat: false,
                };
                const iouReport: Report = {
                    ...createRandomReport(1, undefined),
                    isOwnPolicyExpenseChat: false,
                    type: CONST.REPORT.TYPE.IOU,
                    isWaitingOnBankAccount: false,
                    currency: CONST.CURRENCY.USD,
                    total: 100,
                    unheldTotal: 100,
                };
                const reportPreviewAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                    childMoneyRequestCount: 1,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        linkedReportID: iouReport.reportID,
                    },
                    shouldShow: true,
                };
                const transaction: Transaction = {
                    ...createRandomTransaction(0),
                    amount: 100,
                    currency: CONST.CURRENCY.USD,
                    merchant: '',
                    modifiedMerchant: '',
                    comment: {
                        comment: '<strong>A</strong><br />A<br />A',
                    },
                };
                const iouAction: ReportAction = {
                    ...createRandomReportAction(2),
                    reportID: iouReport.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        IOUTransactionID: transaction.transactionID,
                        type: 'create',
                    },
                    shouldShow: true,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [reportPreviewAction.reportActionID]: reportPreviewAction,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`, {
                    [iouAction.reportActionID]: iouAction,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
                const reportPreviewMessage = getReportPreviewReportActionMessage(
                    {
                        reportOrID: iouReport,
                        iouReportAction: iouAction,
                        shouldConsiderScanningReceiptOrPendingRoute: true,
                        policy: null,
                        isForListPreview: true,
                        originalReportAction: reportPreviewAction,
                    },
                    getCurrencyDecimalsLocal,
                );
                const formattedMessage = formatReportLastMessageText(Parser.htmlToText(reportPreviewMessage));
                expect(formattedMessage).toBe('$1.00 for A A A');
            });
        });
        describe('canonical money request preview fallback', () => {
            it('should preserve the minus sign when formatting negative expense previews', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'expense-report-1',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    currency: CONST.CURRENCY.USD,
                    transactionCount: 1,
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(1),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                const moneyRequestAction: ReportAction = {
                    ...createRandomReportAction(2),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2026-04-01 10:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: -2500,
                        currency: CONST.CURRENCY.USD,
                        comment: '<strong>Dinner</strong>',
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                    [moneyRequestAction.reportActionID]: moneyRequestAction,
                });
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_LOGIN,
                });

                expect(lastMessage).toBe('-$25.00 for Dinner');
            });

            it('should ignore deleted money request actions when building canonical expense preview', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'expense-report-2',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    currency: CONST.CURRENCY.USD,
                    transactionCount: 1,
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(3),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                const deletedMoneyRequestAction: ReportAction = {
                    ...createRandomReportAction(4),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2026-04-01 11:00:00.000',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: -9900,
                        currency: CONST.CURRENCY.USD,
                        comment: 'Deleted comment',
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };
                const visibleMoneyRequestAction: ReportAction = {
                    ...createRandomReportAction(5),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2026-04-01 10:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: -4500,
                        currency: CONST.CURRENCY.USD,
                        comment: 'Visible comment',
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                    [deletedMoneyRequestAction.reportActionID]: deletedMoneyRequestAction,
                    [visibleMoneyRequestAction.reportActionID]: visibleMoneyRequestAction,
                });
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_LOGIN,
                });

                expect(lastMessage).toBe('-$45.00 for Visible comment');
            });

            it('should format amount-only preview when the canonical money request has an empty comment', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'expense-report-3',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    currency: CONST.CURRENCY.USD,
                    transactionCount: 1,
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(6),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                const moneyRequestAction: ReportAction = {
                    ...createRandomReportAction(7),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2026-04-01 12:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: -2500,
                        currency: CONST.CURRENCY.USD,
                        comment: '',
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                    [moneyRequestAction.reportActionID]: moneyRequestAction,
                });
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_LOGIN,
                });

                expect(lastMessage).toBe('-$25.00');
            });

            it('should format zero-value expense previews without adding a minus sign', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'expense-report-zero',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    currency: CONST.CURRENCY.USD,
                    transactionCount: 1,
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(14),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                const moneyRequestAction: ReportAction = {
                    ...createRandomReportAction(15),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2026-04-01 16:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: 0,
                        currency: CONST.CURRENCY.USD,
                        comment: 'Zero amount',
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                    [moneyRequestAction.reportActionID]: moneyRequestAction,
                });
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_LOGIN,
                });

                expect(lastMessage).toBe('$0.00 for Zero amount');
            });

            it('should format preview correctly for non-USD currencies', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'expense-report-4',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    currency: CONST.CURRENCY.EUR,
                    transactionCount: 1,
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(8),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                const moneyRequestAction: ReportAction = {
                    ...createRandomReportAction(9),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2026-04-01 13:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: -2500,
                        currency: CONST.CURRENCY.EUR,
                        comment: 'Lunch',
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                    [moneyRequestAction.reportActionID]: moneyRequestAction,
                });
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_LOGIN,
                });

                expect(lastMessage).toBe('-€25.00 for Lunch');
            });

            it('should return an empty preview when the canonical money request is missing amount', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'expense-report-5',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    currency: CONST.CURRENCY.USD,
                    transactionCount: 1,
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(10),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                const moneyRequestAction: ReportAction = {
                    ...createRandomReportAction(11),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2026-04-01 14:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        currency: CONST.CURRENCY.USD,
                        comment: 'Missing amount',
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                    [moneyRequestAction.reportActionID]: moneyRequestAction,
                });
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_LOGIN,
                });

                expect(lastMessage).toBe('');
            });

            it('should return an empty preview when only a created action is visible after expense deletion', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'expense-report-deleted',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    currency: CONST.CURRENCY.USD,
                    transactionCount: 1,
                    lastMessageText: '-$25.00 for Deleted expense',
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(16),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                });
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_LOGIN,
                });

                expect(lastMessage).toBe('');
            });

            it('should preserve last visible message fallback for non-expense IOU reports', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'iou-report-created-last-action',
                    type: CONST.REPORT.TYPE.IOU,
                    currency: CONST.CURRENCY.USD,
                    transactionCount: 1,
                    ownerAccountID: 1,
                    managerID: CURRENT_USER_ACCOUNT_ID,
                    isWaitingOnBankAccount: false,
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(17),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    created: '2026-04-01 09:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                const transaction: Transaction = {
                    ...createRandomTransaction(1),
                    amount: 2500,
                    currency: CONST.CURRENCY.USD,
                    merchant: 'Coffee',
                    modifiedMerchant: '',
                };
                const moneyRequestAction: ReportAction = {
                    ...createRandomReportAction(18),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    actorAccountID: 1,
                    created: '2026-04-01 10:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: -2500,
                        currency: CONST.CURRENCY.USD,
                        IOUTransactionID: transaction.transactionID,
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                    [moneyRequestAction.reportActionID]: moneyRequestAction,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_LOGIN,
                });

                expect(lastMessage).toBe('');
            });

            it('should fall back to the report currency when the canonical money request is missing currency', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    reportID: 'expense-report-6',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    currency: CONST.CURRENCY.USD,
                    transactionCount: 1,
                };
                const createdAction: ReportAction = {
                    ...createRandomReportAction(12),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                const moneyRequestAction: ReportAction = {
                    ...createRandomReportAction(13),
                    reportID: report.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    created: '2026-04-01 15:00:00.000',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: -2500,
                        comment: 'Missing currency',
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                    [moneyRequestAction.reportActionID]: moneyRequestAction,
                });
                await waitForBatchedUpdates();

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    lastAction: createdAction,
                    currentUserLogin: CURRENT_USER_LOGIN,
                });

                expect(lastMessage).toBe('-$25.00 for Missing currency');
            });
        });
        it('MOVED_TRANSACTION action', async () => {
            const mockIsSearchTopmostFullScreenRoute = jest.mocked(isSearchTopmostFullScreenRoute);
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
            const report: Report = createRandomReport(2, undefined);
            const report2: Report = {
                ...createRandomReport(1, undefined),
                reportName: 'Expense Report #123',
            };
            const movedTransactionAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {
                    toReportID: report2.reportID,
                    fromReportID: report.reportID,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`, report2);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [movedTransactionAction.reportActionID]: movedTransactionAction,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });
            const {fromReportID, toReportID} = parseMovedTransactionReportIDs(movedTransactionAction);
            expect(lastMessage).toBe(Parser.htmlToText(getMovedTransactionMessage({translate: translateLocal, fromReportID, toReportID})));
        });
        describe('SUBMITTED action', () => {
            it('should return automatic submitted message if submitted via harvesting', async () => {
                const report: Report = createRandomReport(0, undefined);
                const submittedAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: 1,
                        harvesting: true,
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [submittedAction.reportActionID]: submittedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: false,

                    currentUserLogin: CURRENT_USER_LOGIN,
                });
                expect(lastMessage).toBe(Parser.htmlToText(translate(CONST.LOCALES.EN, 'iou.automaticallySubmitted')));
            });
        });
        describe('APPROVED action', () => {
            it('should return automatic approved message if approved automatically', async () => {
                const report: Report = createRandomReport(0, undefined);
                const approvedAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
                        automaticAction: true,
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [approvedAction.reportActionID]: approvedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: false,

                    currentUserLogin: CURRENT_USER_LOGIN,
                });
                expect(lastMessage).toBe(Parser.htmlToText(translate(CONST.LOCALES.EN, 'iou.automaticallyApproved')));
            });
        });
        describe('FORWARDED action', () => {
            it('should return forwarded message with memo', async () => {
                const report: Report = createRandomReport(0, undefined);
                const memo = 'Testing approval memo';
                const forwardedAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        automaticAction: false,
                        message: memo,
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [forwardedAction.reportActionID]: forwardedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: false,

                    currentUserLogin: CURRENT_USER_LOGIN,
                });
                expect(lastMessage).toBe(translateLocal('iou.forwarded', memo));
            });

            it('should return automatic forwarded message if forwarded automatically', async () => {
                const report: Report = createRandomReport(0, undefined);
                const forwardedAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        automaticAction: true,
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [forwardedAction.reportActionID]: forwardedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: false,

                    currentUserLogin: CURRENT_USER_LOGIN,
                });
                expect(lastMessage).toBe(Parser.htmlToText(translate(CONST.LOCALES.EN, 'iou.automaticallyForwarded')));
            });
        });
        describe('POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE action', () => {
            it('should return forced corporate upgrade message', async () => {
                const report: Report = createRandomReport(0, undefined);
                const corporateForceUpgradeAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [corporateForceUpgradeAction.reportActionID]: corporateForceUpgradeAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: false,

                    currentUserLogin: CURRENT_USER_LOGIN,
                });
                expect(lastMessage).toBe(Parser.htmlToText(translate(CONST.LOCALES.EN, 'workspaceActions.forcedCorporateUpgrade')));
            });
        });
        it('UPDATE_CUSTOM_TAX_NAME action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_TAX_NAME,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {oldName: 'Sales Tax', newName: 'VAT'},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(getCustomTaxNameUpdateMessage(translateLocal, action));
        });
        it('UPDATE_CURRENCY_DEFAULT_TAX action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY_DEFAULT_TAX,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {oldName: 'Standard Rate', newName: 'Reduced Rate'},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(getCurrencyDefaultTaxUpdateMessage(translateLocal, action));
        });
        it('ADD_AGENT_RULE action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_AGENT_RULE,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {ruleTitle: 'Receipts required', prompt: 'Flag any expense over $25 that is missing a receipt'},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                currentUserLogin: CURRENT_USER_LOGIN,
                conciergeReportID: undefined,
            });
            expect(lastMessage).toBe(getAddAgentRuleMessage(translateLocal, action));
        });
        it('UPDATE_AGENT_RULE action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AGENT_RULE,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {ruleTitle: 'Receipts required', prompt: 'Reject any expense that includes alcohol'},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                conciergeReportID: undefined,
                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(getUpdateAgentRuleMessage(translateLocal, action));
        });
        it('DELETE_AGENT_RULE action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_AGENT_RULE,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {ruleTitle: 'Receipts required'},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                conciergeReportID: undefined,
                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(getDeleteAgentRuleMessage(translateLocal, action));
        });
        it('UPDATE_FOREIGN_CURRENCY_DEFAULT_TAX action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FOREIGN_CURRENCY_DEFAULT_TAX,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {
                    oldName: 'Foreign Tax (15%)',
                    newName: 'Foreign Tax (10%)',
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(getForeignCurrencyDefaultTaxUpdateMessage(translateLocal, action));
        });
        it('UPDATE_REQUIRE_COMPANY_CARDS_ENABLED action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRE_COMPANY_CARDS_ENABLED,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {enabled: true},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(getRequireCompanyCardsEnabledMessage(translateLocal, action));
        });
        it('UPDATE_REQUIRES_CATEGORY action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRES_CATEGORY,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {enabled: true},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(getRequiresCategoryMessage(translateLocal, action));
        });
        it.each([
            [CONST.POLICY.GLOBAL_REIMBURSEMENT_FX_PREFERENCE.COMPANY, 'updated the currency conversion fee setting to "Company pays"'],
            [CONST.POLICY.GLOBAL_REIMBURSEMENT_FX_PREFERENCE.EMPLOYEE, 'updated the currency conversion fee setting to "Employee pays"'],
        ])('UPDATE_GLOBAL_REIMBURSEMENTS_FX_PREFERENCE action with the %s preference', async (preference, expectedMessage) => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_GLOBAL_REIMBURSEMENTS_FX_PREFERENCE,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {preference},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(expectedMessage);
        });
        it('UPDATE_AUTO_HARVESTING action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_HARVESTING,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {value: true},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(getUpdatedAutoHarvestingMessage(translateLocal, action));
        });
        it('UPDATE_CUSTOM_UNIT_RATE action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {
                    customUnitName: 'Distance',
                    customUnitRateName: 'Default Rate',
                    updatedField: 'taxClaimablePercentage',
                    oldValue: 0.5,
                    newValue: 0.7,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(getWorkspaceCustomUnitRateUpdatedMessage(translateLocal, undefined, action));
        });
        it('UPDATE_REQUIRES_TAG action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRES_TAG,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {enabled: false},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(getRequiresTagMessage(translateLocal, action));
        });
        it('ADD_CARD_FEED action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CARD_FEED,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {feedName: 'Visa Commercial'},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(getAddedCardFeedMessage(translateLocal, action));
        });
        it('DELETE_CARD_FEED action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CARD_FEED,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {feedName: 'Amex Corporate'},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(getRemovedCardFeedMessage(translateLocal, action));
        });
        it('RENAME_CARD_FEED action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.RENAME_CARD_FEED,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {oldName: 'Old Feed', newName: 'New Feed'},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(getRenamedCardFeedMessage(translateLocal, action));
        });
        it('ASSIGN_COMPANY_CARD action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ASSIGN_COMPANY_CARD,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {
                    email: 'user@example.com',
                    feedName: 'US Bank',
                    cardLastFour: '1234',
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(getAssignedCompanyCardMessage(translateLocal, action));
        });
        it('UNASSIGN_COMPANY_CARD action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UNASSIGN_COMPANY_CARD,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {
                    email: 'user@example.com',
                    feedName: 'US Bank',
                    cardLastFour: '5678',
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(getUnassignedCompanyCardMessage(translateLocal, action));
        });
        it('UPDATE_CARD_FEED_LIABILITY action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_LIABILITY,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {
                    feedName: 'Visa Commercial',
                    liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.ALLOW,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(getUpdatedCardFeedLiabilityMessage(translateLocal, action));
        });
        it('UPDATE_CARD_FEED_STATEMENT_PERIOD action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_STATEMENT_PERIOD,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {
                    feedName: 'Visa Commercial',
                    statementPeriodEndDay: '15',
                    previousStatementPeriodEndDay: '20',
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(getUpdatedCardFeedStatementPeriodMessage(translateLocal, action));
        });
        it('TAKE_CONTROL action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const takeControlAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [takeControlAction.reportActionID]: takeControlAction,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(Parser.htmlToText(getChangedApproverActionMessage(translateLocal, takeControlAction)));
        });
        it('REROUTE action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const rerouteAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REROUTE,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [rerouteAction.reportActionID]: rerouteAction,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(Parser.htmlToText(getChangedApproverActionMessage(translateLocal, rerouteAction)));
        });
        it('MOVED action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const movedAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MOVED,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [movedAction.reportActionID]: movedAction,
            });
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(Parser.htmlToText(getMovedActionMessage(translateLocal, movedAction, report)));
        });
        it('DYNAMIC_EXTERNAL_WORKFLOW_ROUTED action', async () => {
            // Given a DYNAMIC_EXTERNAL_WORKFLOW_ROUTED as the last action
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED> = {
                reportActionID: '1',
                created: '',
                actionName: CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {to: 'example@gmail.com', message: ''},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });

            // When getting the last message text for the report
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });

            // Then it should return the DYNAMIC_EXTERNAL_WORKFLOW_ROUTED message
            expect(lastMessage).toBe(Parser.htmlToText(getDynamicExternalWorkflowRoutedMessage(action, translateLocal)));
        });
        it('should return last visible message text when last action is hidden (e.g. whisper)', async () => {
            const report: Report = {
                ...createRandomReport(0, undefined),
                lastMessageText: 'joined the chat',
            };
            const whisperAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [whisperAction.reportActionID]: whisperAction,
            });
            await waitForBatchedUpdates();

            const expectedVisibleText = '';
            const result = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(result).toBe(expectedVisibleText);
        });
        it('should return "@Hidden" when last action is an ADD_COMMENT mentioning a user not in personal details', async () => {
            // Given a chat report whose last action is an ADD_COMMENT that mentions a user who does not exist in personal details
            const mentionedAccountID = 999999;
            const report: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.CHAT,
                lastActionType: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            };
            const addCommentAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                created: DateUtils.getDBTime(),
                message: [
                    {
                        type: 'COMMENT',
                        html: `<mention-user accountID="${mentionedAccountID}"></mention-user>`,
                        text: '',
                        isEdited: false,
                        isDeletedParentAction: false,
                        whisperedTo: [],
                    },
                ],
                originalMessage: {
                    html: `<mention-user accountID="${mentionedAccountID}"></mention-user>`,
                    mentionedAccountIDs: [mentionedAccountID],
                },
                shouldShow: true,
                pendingAction: null,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [addCommentAction.reportActionID]: addCommentAction,
            });
            await waitForBatchedUpdates();

            // When we get the last message text while the mentioned user is absent from personal details
            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,
                lastAction: addCommentAction,
                currentUserLogin: CURRENT_USER_LOGIN,
            });

            // Then the mention should fall back to the hidden placeholder
            expect(lastMessage).toBe(`@${translateLocal('common.hidden')}`);
        });
        it('should return "No activity yet" for MoneyRequestReport with zero transactions', async () => {
            const report: Report = {
                ...createRandomReport(0, undefined),
                type: Math.floor(Math.random() * 2) === 1 ? CONST.REPORT.TYPE.IOU : CONST.REPORT.TYPE.EXPENSE,
                transactionCount: 0,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

            const lastMessage = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(lastMessage).toBe(translateLocal('report.noActivityYet'));
        });
        it('should return "Receipt scanning..." for MoneyRequestReport with scanning transactions', async () => {
            const report: Report = {
                ...createRandomReport(0, undefined),
                type: Math.floor(Math.random() * 2) === 1 ? CONST.REPORT.TYPE.IOU : CONST.REPORT.TYPE.EXPENSE,
                transactionCount: 1,
            };
            const scannedTransaction: Transaction = {
                ...createRandomTransaction(2),
                reportID: report.reportID,
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                modifiedMerchant: '',
                amount: 0,
                receipt: {
                    state: CONST.IOU.RECEIPT_STATE.SCANNING,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${scannedTransaction.transactionID}`, scannedTransaction);
            await waitForBatchedUpdates();

            const result = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                translate: translateLocal,
                report,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });
            const transactions = [scannedTransaction];
            const scanningTransactions = transactions.filter((transaction) => isScanning(transaction));
            expect(result).toBe(
                translateLocal('iou.receiptScanning', {
                    count: scanningTransactions.length,
                }),
            );
        });
        it('should NOT leak fraud alert text when user cannot perform write actions', async () => {
            const report: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                permissions: [CONST.REPORT.PERMISSIONS.READ],
                lastMessageText: 'Fraud alert: Sensitive transaction details',
            };
            const fraudAction: ReportAction = {
                ...createRandomReportAction(2),
                actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT,
                message: [
                    {
                        text: 'Sensitive',
                        type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                        whisperedTo: [],
                    },
                ],
                originalMessage: {
                    whisperedTo: [],
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [fraudAction.reportActionID]: fraudAction,
            });
            await waitForBatchedUpdates();

            const result = getLastMessageTextForReport({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                personalDetails: undefined,
                report,
                translate: translateLocal,
                lastActorDetails: null,
                policy: undefined,
                isReportArchived: false,

                currentUserLogin: CURRENT_USER_LOGIN,
            });
            expect(result).toBe('');
        });

        describe('DEW (Dynamic External Workflow)', () => {
            it('should show queued message for SUBMITTED action with DEW policy when offline and pending submit', async () => {
                const reportID = 'dewReport1';
                const report: Report = {
                    reportID,
                    reportName: 'Test Report',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    policyID: 'dewPolicy1',
                };
                const policy: Policy = {
                    ...POLICY,
                    id: 'dewPolicy1',
                    name: 'Test Policy',
                    type: CONST.POLICY.TYPE.CORPORATE,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
                };
                const submittedAction: ReportAction = {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    created: '2024-01-01 00:00:00',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    message: [{type: 'COMMENT', text: 'submitted'}],
                    originalMessage: {},
                };
                const reportMetadata = {
                    pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.SUBMIT,
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                    [submittedAction.reportActionID]: submittedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    policy,
                    reportMetadata,

                    currentUserLogin: CURRENT_USER_LOGIN,
                });
                expect(lastMessage).toBe(translate(CONST.LOCALES.EN, 'iou.queuedToSubmitViaDEW'));
            });

            it('should show custom error message for DEW_SUBMIT_FAILED action', async () => {
                const reportID = 'dewReport2';
                const report: Report = {
                    reportID,
                    reportName: 'Test Report',
                    type: CONST.REPORT.TYPE.EXPENSE,
                };
                const customErrorMessage = 'This report contains an expense missing required fields.';
                const dewSubmitFailedAction: ReportAction = {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                    created: '2024-01-01 00:00:00',
                    message: [{type: 'COMMENT', text: customErrorMessage}],
                    originalMessage: {
                        message: customErrorMessage,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                    [dewSubmitFailedAction.reportActionID]: dewSubmitFailedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: false,

                    currentUserLogin: CURRENT_USER_LOGIN,
                });
                expect(lastMessage).toBe(customErrorMessage);
            });

            it('should show fallback message for DEW_SUBMIT_FAILED action without message', async () => {
                const reportID = 'dewReport3';
                const report: Report = {
                    reportID,
                    reportName: 'Test Report',
                    type: CONST.REPORT.TYPE.EXPENSE,
                };
                const dewSubmitFailedAction: ReportAction = {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                    created: '2024-01-01 00:00:00',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                    [dewSubmitFailedAction.reportActionID]: dewSubmitFailedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: false,

                    currentUserLogin: CURRENT_USER_LOGIN,
                });
                expect(lastMessage).toBe(translate(CONST.LOCALES.EN, 'iou.error.genericCreateFailureMessage'));
            });
        });

        describe('archived report with policy', () => {
            it('should use the passed policy name for POLICY_DELETED archive reason', async () => {
                const testPolicyID = 'archivePolicyTest';
                const policy: Policy = {
                    ...POLICY,
                    id: testPolicyID,
                    name: 'Test Workspace',
                    type: CONST.POLICY.TYPE.TEAM,
                };
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    policyID: testPolicyID,
                    type: CONST.REPORT.TYPE.CHAT,
                };
                const closedAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
                    originalMessage: {
                        policyName: policy.name,
                        reason: CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED,
                    },
                } as ReportAction;
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [closedAction.reportActionID]: closedAction,
                });

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy,
                    isReportArchived: true,

                    currentUserLogin: '',
                });

                expect(lastMessage).toBe(translateLocal('reportArchiveReasons.policyDeleted', {policyName: policy.name}));
            });

            it('should use the passed policy name for REMOVED_FROM_POLICY archive reason', async () => {
                const testPolicyID = 'archivePolicyTest2';
                const policy: Policy = {
                    ...POLICY,
                    id: testPolicyID,
                    name: 'My Workspace',
                    type: CONST.POLICY.TYPE.TEAM,
                };
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    policyID: testPolicyID,
                    type: CONST.REPORT.TYPE.CHAT,
                };
                const closedAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
                    originalMessage: {
                        policyName: policy.name,
                        reason: CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY,
                    },
                } as ReportAction;
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [closedAction.reportActionID]: closedAction,
                });

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy,
                    isReportArchived: true,

                    currentUserLogin: '',
                });

                expect(lastMessage).toBe(translateLocal('reportArchiveReasons.removedFromPolicy', {displayName: 'Hidden', policyName: policy.name}));
            });

            it('resolves the workspace-unavailable fallback through the provided translate function when the archived policy is unavailable', async () => {
                const report: Report = {
                    ...createRandomReport(0, undefined),
                    type: CONST.REPORT.TYPE.CHAT,
                    // No resolvable policy, so the archived preview name falls back to the unavailable label.
                    policyID: 'missing-archive-policy',
                    policyName: undefined,
                    reportName: undefined,
                };
                const closedAction = createMock<ReportAction>({
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
                    originalMessage: {
                        reason: CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY,
                    },
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [closedAction.reportActionID]: closedAction,
                });
                const translateWithUnavailableMarker: LocalizedTranslate = (path, ...parameters) =>
                    path === 'workspace.common.unavailable' ? 'UnavailableMarker' : translateLocal(path, ...parameters);

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    personalDetails: undefined,
                    translate: translateWithUnavailableMarker,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: true,

                    currentUserLogin: '',
                });

                expect(lastMessage).toContain('UnavailableMarker');
            });
        });
        describe('UPDATE_CATEGORY_TAX_RATE action', () => {
            it('should surface the rendered category default tax rate change in the last-message preview', async () => {
                const report: Report = createRandomReport(0, undefined);
                const changelogAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY_TAX_RATE,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        categoryName: 'Office Supplies',
                        oldTaxName: 'Tax Exempt',
                        oldTaxPercentage: '0%',
                        newTaxName: 'Tax Rate 1',
                        newTaxPercentage: '5%',
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [changelogAction.reportActionID]: changelogAction,
                });

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    personalDetails: undefined,
                    isReportArchived: false,
                    currentUserLogin: CURRENT_USER_LOGIN,
                });

                expect(lastMessage).toBe('changed the "Office Supplies" category default tax rate to "Tax Rate 1 (5%)" (previously "Tax Exempt (0%)")');
            });
        });

        describe('UPDATE_MCC_GROUP_CATEGORY action', () => {
            it('should surface the friendly MCC group label in the last-message preview', async () => {
                const report: Report = createRandomReport(0, undefined);
                const changelogAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MCC_GROUP_CATEGORY,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        mccGroupName: 'Airlines',
                        oldCategory: 'Insurance',
                        newCategory: 'Travel',
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [changelogAction.reportActionID]: changelogAction,
                });

                const lastMessage = getLastMessageTextForReport({
                    dateFnsLocale: undefined,
                    conciergeReportID: undefined,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    personalDetails: undefined,
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    policy: undefined,
                    isReportArchived: false,
                    currentUserLogin: CURRENT_USER_LOGIN,
                });

                expect(lastMessage).toBe('changed the default spend category for "Airlines" to "Travel" (previously "Insurance")');
            });
        });
    });

    describe('getWelcomeMessage', () => {
        const MOCK_CONCIERGE_REPORT_ID = 'concierge-report-id';

        it('resolves the policy expense chat owner name through the provided translate function', async () => {
            const hiddenOwnerAccountID = 780080;
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                type: CONST.REPORT.TYPE.CHAT,
                ownerAccountID: hiddenOwnerAccountID,
            };

            await waitForBatchedUpdates();
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                        ...LHNTestUtils.fakePersonalDetails,
                        // Owner without displayName/login resolves to the hidden label provided by translate.
                        [hiddenOwnerAccountID]: {accountID: hiddenOwnerAccountID, login: '', displayName: ''},
                    },
                });
            });
            const translateWithHiddenMarker: LocalizedTranslate = (path, ...parameters) => (path === 'common.hidden' ? 'HiddenMarker' : translateLocal(path, ...parameters));

            const result = getWelcomeMessage({
                report: MOCK_REPORT,
                policy: undefined,
                invoiceReceiverPolicy: undefined,
                participantPersonalDetailList: [],
                translate: translateWithHiddenMarker,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                formatPhoneNumber,
            });
            expect(result.messageHtml).toContain('HiddenMarker');
        });

        it('resolves the policy expense chat workspace name through the provided translate function', async () => {
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                type: CONST.REPORT.TYPE.CHAT,
                policyID: 'non-existent-policy-id',
            };

            await waitForBatchedUpdates();

            // A translate that tags the "unavailable" workspace copy so we can prove getPolicyName used the provided translate
            const translateWithUnavailableMarker: LocalizedTranslate = (path, ...parameters) =>
                path === 'workspace.common.unavailable' ? 'UnavailableWorkspaceMarker' : translateLocal(path, ...parameters);

            const result = getWelcomeMessage({
                report: MOCK_REPORT,
                policy: undefined,
                invoiceReceiverPolicy: undefined,
                participantPersonalDetailList: [],
                translate: translateWithUnavailableMarker,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                formatPhoneNumber,
            });
            expect(result.messageHtml).toContain('UnavailableWorkspaceMarker');
        });

        it('resolves the admin room workspace name through the provided translate function', async () => {
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                type: CONST.REPORT.TYPE.CHAT,
                policyID: 'non-existent-policy-id',
            };

            await waitForBatchedUpdates();

            const translateWithUnavailableMarker: LocalizedTranslate = (path, ...parameters) =>
                path === 'workspace.common.unavailable' ? 'UnavailableWorkspaceMarker' : translateLocal(path, ...parameters);

            const result = getWelcomeMessage({
                report: MOCK_REPORT,
                policy: undefined,
                invoiceReceiverPolicy: undefined,
                participantPersonalDetailList: [],
                translate: translateWithUnavailableMarker,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                formatPhoneNumber,
            });
            expect(result.messageHtml).toContain('UnavailableWorkspaceMarker');
        });

        it('resolves the invoice room receiver name through the provided translate function', async () => {
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                type: CONST.REPORT.TYPE.CHAT,
                policyID: 'non-existent-policy-id',
            };

            await waitForBatchedUpdates();

            const translateWithUnavailableMarker: LocalizedTranslate = (path, ...parameters) =>
                path === 'workspace.common.unavailable' ? 'UnavailableWorkspaceMarker' : translateLocal(path, ...parameters);

            const result = getWelcomeMessage({
                report: MOCK_REPORT,
                policy: undefined,
                invoiceReceiverPolicy: undefined,
                participantPersonalDetailList: [],
                translate: translateWithUnavailableMarker,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                formatPhoneNumber,
            });
            expect(result.messageHtml).toContain('UnavailableWorkspaceMarker');
        });

        it('do not return pronouns in the welcome message text when it is group chat', async () => {
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: 'group',
                type: 'chat',
            };
            const participantPersonalDetailList: PersonalDetails[] = [
                {accountID: 1, avatar: 'https://example.com/one.png', pronouns: 'they/them', login: 'email1@test.com'},
                {accountID: 2, avatar: 'https://example.com/two.png', pronouns: 'she/her', login: 'two@example.com'},
            ];

            return (
                waitForBatchedUpdates()
                    // When Onyx is updated to contain that report
                    .then(() =>
                        act(async () => {
                            await Onyx.multiSet({
                                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            });
                        }),
                    )
                    .then(() => {
                        const result = getWelcomeMessage({
                            report: MOCK_REPORT,
                            policy: undefined,
                            invoiceReceiverPolicy: undefined,
                            participantPersonalDetailList,
                            translate: translateLocal,
                            localeCompare,
                            conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                            formatPhoneNumber,
                        });
                        expect(result.messageHtml).toContain('This chat is with');
                        expect(result.messageHtml).toContain('<user-details accountid="1">');
                        expect(result.messageHtml).toContain('<user-details accountid="2">');
                        expect(result.messageHtml).toContain('</user-details> and');
                    })
            );
        });

        it('returns correct messageText for a single user DM chat', async () => {
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: undefined,
                type: 'chat',
            };
            const participantPersonalDetailList: PersonalDetails[] = [{accountID: 1, displayName: 'Email One', avatar: 'https://example.com/one.png', login: 'email1@test.com'}];

            await waitForBatchedUpdates();
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                });
            });

            const result = getWelcomeMessage({
                report: MOCK_REPORT,
                policy: undefined,
                invoiceReceiverPolicy: undefined,
                participantPersonalDetailList,
                translate: translateLocal,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                formatPhoneNumber,
            });
            expect(result.messageText).toBe('This chat is with Email One.');
            expect(result.messageHtml).toContain('<user-details accountid="1">Email One</user-details>');
        });

        it('returns correct messageText for two users in a group chat', async () => {
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: 'group',
                type: 'chat',
            };
            const participantPersonalDetailList: PersonalDetails[] = [
                {accountID: 1, displayName: 'Email One', avatar: 'https://example.com/one.png', login: 'email1@test.com'},
                {accountID: 2, displayName: 'Email Two', avatar: 'https://example.com/two.png', login: 'email2@test.com'},
            ];

            await waitForBatchedUpdates();
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                });
            });

            const result = getWelcomeMessage({
                report: MOCK_REPORT,
                policy: undefined,
                invoiceReceiverPolicy: undefined,
                participantPersonalDetailList,
                translate: translateLocal,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                formatPhoneNumber,
            });
            expect(result.messageText).toMatch(/^This chat is with .+ and .+\.$/);
            expect(result.messageText).toContain(' and ');
            expect(result.messageText).not.toContain('<user-details');
        });

        it('returns correct messageText for three users in a group chat', async () => {
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: 'group',
                type: 'chat',
            };
            const participantPersonalDetailList: PersonalDetails[] = [
                {accountID: 1, displayName: 'Email One', avatar: 'https://example.com/one.png', login: 'email1@test.com'},
                {accountID: 2, displayName: 'Email Two', avatar: 'https://example.com/two.png', login: 'email2@test.com'},
                {accountID: 3, displayName: 'Email Three', avatar: 'https://example.com/three.png', login: 'email3@test.com'},
            ];

            await waitForBatchedUpdates();
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                });
            });

            const result = getWelcomeMessage({
                report: MOCK_REPORT,
                policy: undefined,
                invoiceReceiverPolicy: undefined,
                participantPersonalDetailList,
                translate: translateLocal,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                formatPhoneNumber,
            });
            expect(result.messageText).toMatch(/^This chat is with .+, .+, and .+\.$/);
            expect(result.messageText).toContain(', and ');
            expect(result.messageText).not.toContain('<user-details');
        });

        it('returns a welcome message for an archived chat room', () => {
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
            };
            const participantPersonalDetailList: PersonalDetails[] = [
                {accountID: 1, displayName: 'One', avatar: 'https://example.com/one.png', pronouns: 'they/them', login: 'One'},
                {accountID: 2, displayName: 'Two', avatar: 'https://example.com/two.png', pronouns: 'she/her', login: 'Two'},
            ];
            return (
                waitForBatchedUpdates()
                    // Given a "chat room" report (ie. a policy announce room) is stored in Onyx
                    .then(() =>
                        act(async () => {
                            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${MOCK_REPORT.reportID}`, MOCK_REPORT);
                        }),
                    )

                    // And that report is archived
                    .then(() =>
                        act(async () => {
                            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${MOCK_REPORT.reportID}`, {private_isArchived: new Date().toString()});
                        }),
                    )

                    // When the welcome message is retrieved
                    .then(() => {
                        // Simulate how components call getWelcomeMessage() by using the hook useReportIsArchived() to see if the report is archived
                        const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
                        return getWelcomeMessage({
                            report: MOCK_REPORT,
                            policy: undefined,
                            invoiceReceiverPolicy: undefined,
                            participantPersonalDetailList,
                            translate: translateLocal,
                            localeCompare,
                            conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                            derivedReportName: 'Report (archived)',
                            isReportArchived: isReportArchived.current,
                            formatPhoneNumber,
                        });
                    })

                    // Then the welcome message should indicate the report is archived
                    .then((result) => expect(result.messageText).toBe("You missed the party in Report (archived), there's nothing to see here."))
            );
        });

        it('returns a welcome message for a non-archived chat room', () => {
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
            };
            const participantPersonalDetailList: PersonalDetails[] = [
                {accountID: 1, displayName: 'One', avatar: 'https://example.com/one.png', pronouns: 'they/them', login: 'one@example.com'},
                {accountID: 2, displayName: 'Two', avatar: 'https://example.com/two.png', pronouns: 'she/her', login: 'two@example.com'},
            ];
            return (
                waitForBatchedUpdates()
                    // Given a "chat room" report (ie. a policy announce room) is stored in Onyx
                    .then(() =>
                        act(async () => {
                            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${MOCK_REPORT.reportID}`, MOCK_REPORT);
                        }),
                    )

                    // When the welcome message is retrieved
                    .then(() => {
                        // Simulate how components call getWelcomeMessage() by using the hook useReportIsArchived() to see if the report is archived
                        const {result: isReportArchived} = renderHook(() => useReportIsArchived(MOCK_REPORT?.reportID));
                        return getWelcomeMessage({
                            report: MOCK_REPORT,
                            policy: undefined,
                            invoiceReceiverPolicy: undefined,
                            participantPersonalDetailList,
                            translate: translateLocal,
                            localeCompare,
                            conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                            isReportArchived: isReportArchived.current,
                            formatPhoneNumber,
                        });
                    })

                    // Then the welcome message should explain the purpose of the room
                    .then((result) => expect(result.messageText).toBe('This chat is with everyone in Unavailable workspace. Use it for the most important announcements.'))
            );
        });

        it('should return correct welcome message for invoice room with business receiver', () => {
            const invoiceReceiverPolicy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                name: 'Client Corporation',
                role: CONST.POLICY.ROLE.ADMIN,
            };

            const senderPolicy: Policy = {
                ...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM),
                name: 'Vendor Workspace',
                role: CONST.POLICY.ROLE.ADMIN,
            };

            const invoiceRoom: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.INVOICE),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                policyID: senderPolicy.id,
                policyName: senderPolicy.name,
                invoiceReceiver: {
                    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                    policyID: invoiceReceiverPolicy.id,
                },
            };

            const result = getWelcomeMessage({
                report: invoiceRoom,
                policy: senderPolicy,
                invoiceReceiverPolicy,
                participantPersonalDetailList: [],
                translate: translateLocal,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                formatPhoneNumber,
            });

            expect(result.messageText).toContain('Client Corporation');
            expect(result.messageText).toContain('Vendor Workspace');
            expect(result.messageHtml).toContain('Client Corporation');
            expect(result.messageHtml).toContain('Vendor Workspace');
        });

        it('should return correct welcome message for invoice room with individual receiver', () => {
            const senderPolicy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                name: 'Service Provider',
                role: CONST.POLICY.ROLE.ADMIN,
            };

            const payerAccountID = 54321;
            const invoiceRoom: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.INVOICE),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                policyID: senderPolicy.id,
                policyName: senderPolicy.name,
                invoiceReceiver: {
                    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                    accountID: payerAccountID,
                },
            };

            const result = getWelcomeMessage({
                report: invoiceRoom,
                policy: senderPolicy,
                invoiceReceiverPolicy: undefined,
                participantPersonalDetailList: [],
                translate: translateLocal,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                formatPhoneNumber,
            });

            // When invoiceReceiverPolicy is undefined (individual payer), it should handle gracefully
            expect(result.messageText).toBeTruthy();
            expect(result.messageText).toContain('Service Provider');
        });

        it('should not return invoice room message for non-invoice rooms even with invoiceReceiverPolicy', () => {
            const invoiceReceiverPolicy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                name: 'Some Policy',
                role: CONST.POLICY.ROLE.ADMIN,
            };

            const policy: Policy = {
                ...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM),
                name: 'Regular Workspace',
                role: CONST.POLICY.ROLE.ADMIN,
            };

            const regularRoom: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
                policyID: policy.id,
                policyName: policy.name,
            };

            const result = getWelcomeMessage({
                report: regularRoom,
                policy,
                invoiceReceiverPolicy,
                participantPersonalDetailList: [],
                translate: translateLocal,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                formatPhoneNumber,
            });

            // Should not contain invoice-specific messaging
            expect(result.messageText).not.toContain('Some Policy');
            expect(result.messageText).toContain('Regular Workspace');
        });

        it('should handle archived invoice room with invoiceReceiverPolicy', () => {
            const invoiceReceiverPolicy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                name: 'Archived Client',
                role: CONST.POLICY.ROLE.ADMIN,
            };

            const senderPolicy: Policy = {
                ...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM),
                name: 'Archived Sender',
                role: CONST.POLICY.ROLE.ADMIN,
            };

            const archivedInvoiceRoom: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.INVOICE),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                policyID: senderPolicy.id,
                policyName: senderPolicy.name,
                reportName: 'Invoice Room',
                invoiceReceiver: {
                    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                    policyID: invoiceReceiverPolicy.id,
                },
            };

            const result = getWelcomeMessage({
                report: archivedInvoiceRoom,
                policy: senderPolicy,
                invoiceReceiverPolicy,
                participantPersonalDetailList: [],
                translate: translateLocal,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                derivedReportName: `${senderPolicy.name} owes ${invoiceReceiverPolicy.name}`,
                isReportArchived: true,
                reportDetailsLink: 'https://example.com/report',
                formatPhoneNumber,
            });

            // Should show archived message
            expect(result.messageText).toContain('You missed the party');
            expect(result.messageText).toContain(senderPolicy.name);
        });

        it('should handle invoice room when invoiceReceiverPolicy is null', () => {
            const senderPolicy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                name: 'Sender Workspace',
                role: CONST.POLICY.ROLE.ADMIN,
            };

            const invoiceRoom: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.INVOICE),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                policyID: senderPolicy.id,
                policyName: senderPolicy.name,
                invoiceReceiver: {
                    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                    policyID: '999',
                },
            };

            const result = getWelcomeMessage({
                report: invoiceRoom,
                policy: senderPolicy,
                invoiceReceiverPolicy: undefined,
                participantPersonalDetailList: [],
                translate: translateLocal,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                formatPhoneNumber,
            });

            // Should still return a message, even if invoiceReceiverPolicy is missing
            expect(result.messageText).toBeTruthy();
            expect(result.messageText).toContain('Sender Workspace');
        });

        it('returns concierge welcome message when report is a concierge chat', async () => {
            const conciergeReportID = 'concierge-42';
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                reportID: conciergeReportID,
                chatType: undefined,
                type: 'chat',
            };
            const participantPersonalDetailList: PersonalDetails[] = [
                {accountID: 1, displayName: 'Concierge', avatar: 'https://example.com/concierge.png', login: 'concierge@expensify.com'},
            ];

            await waitForBatchedUpdates();
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                });
            });

            // When the report ID matches the conciergeReportID, the welcome message should be the concierge message
            const result = getWelcomeMessage({
                report: MOCK_REPORT,
                policy: undefined,
                invoiceReceiverPolicy: undefined,
                participantPersonalDetailList,
                translate: translateLocal,
                localeCompare,
                conciergeReportID,
                formatPhoneNumber,
            });
            expect(result.messageText).toBe('Concierge can answer questions, update expenses, and more.');
        });

        it('does not return concierge welcome message when conciergeReportID does not match', async () => {
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                reportID: 'some-other-report',
                chatType: undefined,
                type: 'chat',
            };
            const participantPersonalDetailList: PersonalDetails[] = [{accountID: 1, displayName: 'Email One', avatar: 'https://example.com/one.png', login: 'email1@test.com'}];

            await waitForBatchedUpdates();
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                });
            });

            // When the report ID does NOT match the conciergeReportID, the welcome message should be the normal DM message
            const result = getWelcomeMessage({
                report: MOCK_REPORT,
                policy: undefined,
                invoiceReceiverPolicy: undefined,
                participantPersonalDetailList,
                translate: translateLocal,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                formatPhoneNumber,
            });
            expect(result.messageText).toBe('This chat is with Email One.');
            expect(result.messageText).not.toContain('Concierge');
        });

        it('returns empty welcome message for chat thread even with conciergeReportID', () => {
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: undefined,
                type: 'chat',
                parentReportID: 'parent-123',
                parentReportActionID: 'action-456',
            };

            const result = getWelcomeMessage({
                report: MOCK_REPORT,
                policy: undefined,
                invoiceReceiverPolicy: undefined,
                participantPersonalDetailList: [],
                translate: translateLocal,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                formatPhoneNumber,
            });
            expect(result.messageHtml).toBeUndefined();
            expect(result.messageText).toBeUndefined();
        });

        it('returns selfDM welcome message regardless of conciergeReportID', () => {
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                type: 'chat',
            };

            const result = getWelcomeMessage({
                report: MOCK_REPORT,
                policy: undefined,
                invoiceReceiverPolicy: undefined,
                participantPersonalDetailList: [],
                translate: translateLocal,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                formatPhoneNumber,
            });
            expect(result.messageText).toBeTruthy();
            expect(result.messageText).not.toContain('Concierge');
        });

        it('returns track-intent welcome message for policy expense chat when user is track-intent and owns the report', async () => {
            const currentUserAccountID = 1;
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                type: CONST.REPORT.TYPE.CHAT,
                ownerAccountID: currentUserAccountID,
                policyID: 'testPolicy',
            };
            const MOCK_POLICY = createMock<Policy>({
                id: 'testPolicy',
                name: 'Test Workspace',
                type: CONST.POLICY.TYPE.TEAM,
            });

            await waitForBatchedUpdates();
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                    [ONYXKEYS.SESSION]: {accountID: currentUserAccountID},
                });
            });

            const result = getWelcomeMessage({
                report: MOCK_REPORT,
                policy: MOCK_POLICY,
                invoiceReceiverPolicy: undefined,
                participantPersonalDetailList: [],
                translate: translateLocal,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                isTrackIntentUser: true,
                currentUserAccountID,
                formatPhoneNumber,
            });
            expect(result.messageText).toBe("This is where you'll track expenses.");
        });

        it('returns standard welcome message for policy expense chat when user is track-intent but does NOT own the report', async () => {
            const currentUserAccountID = 1;
            const otherUserAccountID = 2;
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                type: CONST.REPORT.TYPE.CHAT,
                ownerAccountID: otherUserAccountID,
                policyID: 'testPolicy',
            };
            const MOCK_POLICY = createMock<Policy>({
                id: 'testPolicy',
                name: 'Test Workspace',
                type: CONST.POLICY.TYPE.TEAM,
            });

            await waitForBatchedUpdates();
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                        ...LHNTestUtils.fakePersonalDetails,
                        [otherUserAccountID]: {
                            accountID: otherUserAccountID,
                            displayName: 'Other User',
                            login: 'other@test.com',
                            avatar: '',
                        },
                    },
                    [ONYXKEYS.SESSION]: {accountID: currentUserAccountID},
                });
            });

            const result = getWelcomeMessage({
                report: MOCK_REPORT,
                policy: MOCK_POLICY,
                invoiceReceiverPolicy: undefined,
                participantPersonalDetailList: [],
                translate: translateLocal,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                isTrackIntentUser: true,
                currentUserAccountID,
                formatPhoneNumber,
            });
            expect(result.messageHtml).toContain('will submit expenses to');
        });

        it('returns standard welcome message for policy expense chat when user is NOT track-intent', async () => {
            const currentUserAccountID = 1;
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                type: CONST.REPORT.TYPE.CHAT,
                ownerAccountID: currentUserAccountID,
                policyID: 'testPolicy',
            };
            const MOCK_POLICY = createMock<Policy>({
                id: 'testPolicy',
                name: 'Test Workspace',
                type: CONST.POLICY.TYPE.TEAM,
            });

            await waitForBatchedUpdates();
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                    [ONYXKEYS.SESSION]: {accountID: currentUserAccountID},
                });
            });

            const result = getWelcomeMessage({
                report: MOCK_REPORT,
                policy: MOCK_POLICY,
                invoiceReceiverPolicy: undefined,
                participantPersonalDetailList: [],
                translate: translateLocal,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                isTrackIntentUser: false,
                currentUserAccountID,
                formatPhoneNumber,
            });
            expect(result.messageHtml).toContain('will submit expenses to');
        });

        it('returns standard welcome message when policy has a custom description even for track-intent users', async () => {
            const currentUserAccountID = 1;
            const MOCK_REPORT: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                type: CONST.REPORT.TYPE.CHAT,
                ownerAccountID: currentUserAccountID,
                policyID: 'testPolicy',
            };
            const MOCK_POLICY = createMock<Policy>({
                id: 'testPolicy',
                name: 'Test Workspace',
                description: 'Custom workspace description',
                type: CONST.POLICY.TYPE.TEAM,
            });

            await waitForBatchedUpdates();
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                    [ONYXKEYS.SESSION]: {accountID: currentUserAccountID},
                });
            });

            const result = getWelcomeMessage({
                report: MOCK_REPORT,
                policy: MOCK_POLICY,
                invoiceReceiverPolicy: undefined,
                participantPersonalDetailList: [],
                translate: translateLocal,
                localeCompare,
                conciergeReportID: MOCK_CONCIERGE_REPORT_ID,
                isTrackIntentUser: true,
                currentUserAccountID,
                formatPhoneNumber,
            });
            expect(result.messageHtml).toBe('Custom workspace description');
        });
    });
});
