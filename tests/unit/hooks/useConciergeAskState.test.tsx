import {renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useConciergeAskState from '@hooks/useConciergeAskState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as NativeNavigation from '@react-navigation/native';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const wrapper = ({children}: {children: React.ReactNode}) => <OnyxListItemProvider>{children}</OnyxListItemProvider>;

const CONCIERGE_REPORT_ID = '1';
const SESSION_START = '2024-06-01 12:00:00.000';

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({accountID: 100})),
}));

jest.mock('@pages/inbox/ConciergeSessionContext', () => ({
    useConciergeSessionState: () => ({sessionStartTime: SESSION_START, showFullHistory: false, hadMessagesAtSessionStart: false}),
}));

let mockRouteParams: {reportActionID?: string} = {};

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useRoute: () => ({key: 'Report-test', name: 'Report', params: mockRouteParams}),
}));

describe('useConciergeAskState', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
        await waitForBatchedUpdates();
    });

    beforeEach(() => {
        mockRouteParams = {};
    });

    it('shows the empty state when the session has no activity', async () => {
        const {result} = renderHook(() => useConciergeAskState(CONCIERGE_REPORT_ID), {wrapper});

        expect(result.current.isAskConciergeChat).toBe(true);
        expect(result.current.isHistoryExpanded).toBe(false);
        expect(result.current.shouldShowWelcome).toBe(true);

        // Given the newest page of earlier Concierge messages, with older pages not loaded yet
        const conciergeMessage = {
            reportActionID: '5',
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
            created: '2024-06-01 11:00:00.000',
        };
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`, {[conciergeMessage.reportActionID]: conciergeMessage});
        await waitForBatchedUpdates();

        // Then the empty state stays, because the user may have replied on an older page
        expect(result.current.shouldShowWelcome).toBe(true);

        // When the whole chat is loaded and the user never replied, such as the onboarding messages on a new account
        const createdAction = {
            reportActionID: '7',
            actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
            created: '2024-06-01 10:00:00.000',
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`, {[createdAction.reportActionID]: createdAction});
        await waitForBatchedUpdates();

        // Then the conversation stays on screen, because `View chat history` can't bring it back
        expect(result.current.shouldShowWelcome).toBe(false);

        // When the user has messaged Concierge before this session
        const userMessage = {
            reportActionID: '6',
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            actorAccountID: 100,
            created: '2024-06-01 11:05:00.000',
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`, {[userMessage.reportActionID]: userMessage});
        await waitForBatchedUpdates();

        // Then the empty state hides the earlier conversation behind `View chat history`
        expect(result.current.shouldShowWelcome).toBe(true);

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`, null);
        await waitForBatchedUpdates();
    });

    it('keeps the empty state for a question that opens its own thread, while sending and once sent', async () => {
        // Given a question from the current user that opened its own thread and is still sending (for example, offline)
        const question = {
            reportActionID: '3',
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            actorAccountID: 100,
            created: '2024-06-01 12:05:00.000',
            childReportID: '4',
            childType: CONST.REPORT.TYPE.CHAT,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`, {[question.reportActionID]: question});
        await waitForBatchedUpdates();

        // When the Concierge chat renders
        const {result} = renderHook(() => useConciergeAskState(CONCIERGE_REPORT_ID), {wrapper});

        // Then the welcome stays, because the question is answered in its thread
        expect(result.current.shouldShowWelcome).toBe(true);

        // When the question is sent (for example, after reconnecting)
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`, {[question.reportActionID]: {pendingAction: null}});
        await waitForBatchedUpdates();

        // Then the welcome still stays, so the collapsed chat doesn't switch to a partial list on its own
        expect(result.current.shouldShowWelcome).toBe(true);

        // When the thread fails to be created, which clears the question's child thread
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`, {[question.reportActionID]: {childReportID: null, childType: ''}});
        await waitForBatchedUpdates();

        // Then the question counts as activity, so its error stays visible in this chat
        expect(result.current.shouldShowWelcome).toBe(false);

        // When the current user creates a task in the Concierge chat
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`, {[question.reportActionID]: {childReportID: '5', childType: CONST.REPORT.TYPE.TASK}});
        await waitForBatchedUpdates();

        // Then the welcome stays, like it does for a question
        expect(result.current.shouldShowWelcome).toBe(true);

        // When that task is assigned to the current user and still open
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`, {
            [question.reportActionID]: {childManagerAccountID: 100, childStateNum: CONST.REPORT.STATE_NUM.OPEN, childStatusNum: CONST.REPORT.STATUS_NUM.OPEN},
        });
        await waitForBatchedUpdates();

        // Then the welcome stands down, so the open task stays pinned on screen
        expect(result.current.shouldShowWelcome).toBe(false);

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`, null);
        await waitForBatchedUpdates();
    });

    it('shows the earlier conversation when the report opens at a linked action', () => {
        // Given a route that opens the Concierge chat at a linked message
        mockRouteParams = {reportActionID: '2'};

        // When the Concierge chat renders
        const {result} = renderHook(() => useConciergeAskState(CONCIERGE_REPORT_ID), {wrapper});

        // Then the earlier conversation shows, because the linked message sits inside it
        expect(result.current.isHistoryExpanded).toBe(true);
        expect(result.current.shouldShowWelcome).toBe(false);
    });

    it('stays off outside the Concierge report', () => {
        // Given a report that isn't the Concierge chat
        const reportID = '999';

        // When that report renders
        const {result} = renderHook(() => useConciergeAskState(reportID), {wrapper});

        // Then none of the Ask Concierge screen applies to it
        expect(result.current.isAskConciergeChat).toBe(false);
        expect(result.current.shouldShowWelcome).toBe(false);
    });
});
