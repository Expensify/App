/* eslint-disable @typescript-eslint/naming-convention */
import {act} from '@testing-library/react-native';

import {getLastActorDisplayName, getLastActorDisplayNameFromLastVisibleActions, getReportAlternateText, shouldShowLastActorDisplayName} from '@libs/ReportAlternateTextUtils';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList, Report, ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import {convertToDisplayString, formatPhoneNumber, localeCompare, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CURRENT_USER_LOGIN = 'test@example.com';
const CURRENT_USER_ACCOUNT_ID = 5;

const PERSONAL_DETAILS: PersonalDetailsList = {
    1: {accountID: 1, login: 'alice@test.com', displayName: 'Alice Aluminum', firstName: 'Alice'},
    2: {accountID: 2, login: 'bob@test.com', displayName: 'Bob Boron', firstName: 'Bob'},
    [CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_LOGIN, displayName: 'Current User'},
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
});
