import {getDBTimeWithSkew, getServerAnchoredDBTime} from '@libs/NetworkState';

import getConciergeChatHistoryAndWelcome, {getConciergeMainChatWelcome} from '@pages/inbox/report/ReportActionsListContext/getConciergeChatHistoryAndWelcome';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import {getFakeReportAction} from '../utils/ReportTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CLIENT_OPEN_MS = Date.UTC(2026, 5, 29, 10, 0, 0);
const toDBTime = (time: number) => new Date(time).toISOString().replace('T', ' ').replace('Z', '');
const action = (id: string, created: string, actorAccountID = 1): ReportAction => ({
    ...getFakeReportAction(Number(id)),
    reportActionID: id,
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    created,
    actorAccountID,
    pendingAction: undefined,
});

function getSidePanelHistory(sessionStartTime: string, question: ReportAction, reply: ReportAction, rememberedIDs: ReadonlySet<string> = new Set(), hasUserSentMessage = true) {
    const created = {...action('10', toDBTime(CLIENT_OPEN_MS - 7_200_000)), actionName: CONST.REPORT.ACTIONS.TYPE.CREATED};
    const actions = [created, action('11', toDBTime(CLIENT_OPEN_MS - 3_600_000)), action('12', toDBTime(CLIENT_OPEN_MS - 3_500_000), 2), question, reply];
    return getConciergeChatHistoryAndWelcome({
        reportID: '1',
        reportActions: actions,
        visibleActions: actions,
        isMainChat: false,
        isSidePanel: true,
        isMainHistoryExpanded: false,
        isMainHistoryCollapsedByUser: false,
        hasFailedSend: false,
        hasUnreadMessageFromOthers: false,
        linkedActionID: undefined,
        showSidePanelHistory: false,
        hasUserSentMessage,
        hasOlderActions: false,
        sessionStartTime,
        sessionSentActionIDs: rememberedIDs,
        currentUserAccountID: 1,
        greetingText: 'How can I help?',
        greetingCreated: sessionStartTime,
    });
}

describe('Concierge history calculations', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.NETWORK, {timeSkew: -5000});
        await waitForBatchedUpdates();
    });

    it('keeps replies after a server-anchored session boundary', () => {
        // Given a client clock ahead of the server, with server-anchored question and boundary
        const boundary = getServerAnchoredDBTime(CLIENT_OPEN_MS);
        const question = action('20', getServerAnchoredDBTime(CLIENT_OPEN_MS + 2000));
        const reply = action('21', toDBTime(CLIENT_OPEN_MS - 1000), 2);
        // When the history calculation applies the supplied boundary
        const history = getSidePanelHistory(boundary, question, reply);
        // Then this session remains visible and prior history stays hidden
        expect(history.conversationActions.map((item) => item.reportActionID)).toEqual(expect.arrayContaining(['20', '21']));
        expect(history.conversationActions.map((item) => item.reportActionID)).not.toEqual(expect.arrayContaining(['11', '12']));
    });

    it('does not use a question clamped to the client clock as the floor for agent replies', () => {
        // Given a question stamped after an otherwise eligible server reply
        const question = action('20', toDBTime(CLIENT_OPEN_MS + 1));
        const reply = action('21', toDBTime(CLIENT_OPEN_MS - 1000), 2);
        // When the server-anchored session is filtered
        const history = getSidePanelHistory(getServerAnchoredDBTime(CLIENT_OPEN_MS), question, reply);
        // Then both question and reply are retained
        expect(history.conversationActions.map((item) => item.reportActionID)).toEqual(expect.arrayContaining(['20', '21']));
    });

    it('excludes a reply below the supplied session boundary', () => {
        // Given a boundary later than the server reply
        const boundary = getDBTimeWithSkew(CLIENT_OPEN_MS);
        const question = action('20', getDBTimeWithSkew(CLIENT_OPEN_MS + 2000));
        const reply = action('21', toDBTime(CLIENT_OPEN_MS - 1000), 2);
        // When that boundary is applied
        const history = getSidePanelHistory(boundary, question, reply);
        // Then only the question passes it
        expect(history.conversationActions.map((item) => item.reportActionID)).toContain('20');
        expect(history.conversationActions.map((item) => item.reportActionID)).not.toContain('21');
    });

    it('retains a remembered sent message after the server stamps it before the boundary', () => {
        // Given a message captured while pending and now saved before the session start
        const question = action('20', toDBTime(CLIENT_OPEN_MS - 3000));
        const reply = action('21', toDBTime(CLIENT_OPEN_MS - 2000), 2);
        // When the provider supplies the remembered sent ID
        const history = getSidePanelHistory(toDBTime(CLIENT_OPEN_MS), question, reply, new Set(['20']), false);
        // Then the question stays visible without reopening the welcome screen
        expect(history.conversationActions.map((item) => item.reportActionID)).toContain('20');
        expect(history.conversationActions.map((item) => item.reportActionID)).not.toContain('11');
        expect(history.shouldShowSidePanelWelcome).toBe(false);
        expect(history.hasPreviousMessages).toBe(true);
    });

    it.each([
        {expanded: false, collapsed: false, failed: false, unread: false, welcome: true},
        {expanded: true, collapsed: false, failed: false, unread: false, welcome: false},
        {expanded: false, collapsed: false, failed: true, unread: false, welcome: false},
        {expanded: false, collapsed: true, failed: true, unread: false, welcome: true},
        {expanded: false, collapsed: true, failed: false, unread: true, welcome: false},
    ])('preserves main-chat welcome choices for %j', ({expanded, collapsed, failed, unread, welcome}) => {
        // Given the main-chat history and unread/error choices
        const input = {
            isMainChat: true,
            isMainHistoryExpanded: expanded,
            isMainHistoryCollapsedByUser: collapsed,
            hasFailedSend: failed,
            hasUnreadMessageFromOthers: unread,
            linkedActionID: undefined,
        };
        // When welcome eligibility is calculated independently of side-panel state
        const result = getConciergeMainChatWelcome(input);
        // Then it matches the main-chat choice
        expect(result.shouldShowMainChatWelcome).toBe(welcome);
    });
});
