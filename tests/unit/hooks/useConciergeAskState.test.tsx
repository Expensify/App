import {renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useConciergeAskState from '@hooks/useConciergeAskState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const wrapper = ({children}: {children: React.ReactNode}) => <OnyxListItemProvider>{children}</OnyxListItemProvider>;

const CONCIERGE_REPORT_ID = '1';
const CURRENT_USER_ACCOUNT_ID = 100;

let mockShowFullHistory = false;
let mockRouteParams: {reportActionID?: string} = {};

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useRoute: () => ({key: 'Report-test', name: 'Report', params: mockRouteParams}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({accountID: 100})),
}));

jest.mock('@pages/inbox/ConciergeChatHistoryContext', () => ({
    useConciergeChatHistoryState: () => ({showFullHistory: mockShowFullHistory}),
}));

const createdAction: ReportAction = {reportActionID: '1', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED, created: '2024-06-01 10:00:00.000'};
const conciergeMessage: ReportAction = {
    reportActionID: '2',
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
    created: '2024-06-01 11:00:00.000',
};
const userMessage: ReportAction = {reportActionID: '3', actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, actorAccountID: CURRENT_USER_ACCOUNT_ID, created: '2024-06-01 11:05:00.000'};

async function setReportActions(actions: ReportAction[]) {
    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`, Object.fromEntries(actions.map((action) => [action.reportActionID, action])));
    await waitForBatchedUpdates();
}

describe('useConciergeAskState', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        mockShowFullHistory = false;
        mockRouteParams = {};
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`, null);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${CONCIERGE_REPORT_ID}`, null);
        await waitForBatchedUpdates();
    });

    it('shows the welcome screen in place of the conversation', async () => {
        // Given a chat with only Concierge's messages, such as onboarding on a new account
        await setReportActions([createdAction, conciergeMessage]);

        // When the Concierge chat renders
        const {result} = renderHook(() => useConciergeAskState(CONCIERGE_REPORT_ID), {wrapper});

        // Then the welcome screen hides the conversation behind `View chat history`
        expect(result.current.shouldShowWelcome).toBe(true);
        expect(result.current.isHistoryExpanded).toBe(false);
    });

    it('keeps the welcome screen when a question arrives from another device', async () => {
        // Given the welcome screen is showing
        await setReportActions([createdAction, conciergeMessage, userMessage]);
        const {result} = renderHook(() => useConciergeAskState(CONCIERGE_REPORT_ID), {wrapper});

        // When a question sent from another device arrives
        const newQuestion: ReportAction = {...userMessage, reportActionID: '4', created: '2024-06-01 12:00:00.000'};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`, {[newQuestion.reportActionID]: newQuestion});
        await waitForBatchedUpdates();

        // Then the welcome screen stays, so this device doesn't flicker
        expect(result.current.shouldShowWelcome).toBe(true);
    });

    it('keeps the messages on screen while Concierge has an unread message', async () => {
        // Given the user asked Concierge before and has not read Concierge's newest message
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${CONCIERGE_REPORT_ID}`, {
            reportID: CONCIERGE_REPORT_ID,
            lastReadTime: '2024-06-01 11:30:00.000',
            lastVisibleActionCreated: '2024-06-01 12:00:00.000',
            lastActorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
        });
        await setReportActions([createdAction, conciergeMessage, userMessage]);

        // When the Concierge chat renders
        const {result} = renderHook(() => useConciergeAskState(CONCIERGE_REPORT_ID), {wrapper});

        // Then the unread message shows instead of the welcome screen
        expect(result.current.shouldShowWelcome).toBe(false);
        expect(result.current.hasUnreadMessageFromOthers).toBe(true);
    });

    it('keeps the messages on screen when a message failed to send', async () => {
        // Given the user's newest message failed to send
        const failedMessage: ReportAction = {...userMessage, reportActionID: '4', created: '2024-06-01 12:00:00.000', errors: {error: 'Failed to send'}};
        await setReportActions([createdAction, conciergeMessage, userMessage, failedMessage]);

        // When the Concierge chat renders
        const {result} = renderHook(() => useConciergeAskState(CONCIERGE_REPORT_ID), {wrapper});

        // Then the failed message shows so the user can retry or dismiss it
        expect(result.current.shouldShowWelcome).toBe(false);
    });

    it('shows the conversation once the user expands the history', async () => {
        // Given the user pressed `View chat history`
        mockShowFullHistory = true;
        await setReportActions([createdAction, conciergeMessage, userMessage]);

        // When the Concierge chat renders
        const {result} = renderHook(() => useConciergeAskState(CONCIERGE_REPORT_ID), {wrapper});

        // Then the conversation shows instead of the welcome screen
        expect(result.current.shouldShowWelcome).toBe(false);
        expect(result.current.isHistoryExpanded).toBe(true);
    });

    it('shows the conversation when opened from a link to a message', async () => {
        // Given the user asked Concierge before
        await setReportActions([createdAction, conciergeMessage, userMessage]);

        // When the Concierge chat opens from a link to Concierge's message
        mockRouteParams = {reportActionID: conciergeMessage.reportActionID};
        const {result} = renderHook(() => useConciergeAskState(CONCIERGE_REPORT_ID), {wrapper});

        // Then the linked message shows instead of the welcome screen
        expect(result.current.shouldShowWelcome).toBe(false);
        expect(result.current.isHistoryExpanded).toBe(true);
    });

    it('stays off outside the Concierge report', () => {
        // Given the history is expanded and a report that isn't the Concierge chat
        mockShowFullHistory = true;

        // When that report renders
        const {result} = renderHook(() => useConciergeAskState('999'), {wrapper});

        // Then none of the Ask Concierge screen applies to it
        expect(result.current.shouldShowWelcome).toBe(false);
        expect(result.current.isHistoryExpanded).toBe(false);
    });
});
