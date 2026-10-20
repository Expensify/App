import {renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useConciergeAskState from '@hooks/useConciergeAskState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const wrapper = ({children}: {children: React.ReactNode}) => <OnyxListItemProvider>{children}</OnyxListItemProvider>;

const CONCIERGE_REPORT_ID = '1';
const CURRENT_USER_ACCOUNT_ID = 100;

let mockShowFullHistory = false;

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
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`, null);
        await waitForBatchedUpdates();
    });

    it('shows the welcome screen once the user has messaged Concierge', async () => {
        // Given a fully loaded chat where the user asked Concierge before
        await setReportActions([createdAction, conciergeMessage, userMessage]);

        // When the Concierge chat renders
        const {result} = renderHook(() => useConciergeAskState(CONCIERGE_REPORT_ID), {wrapper});

        // Then the welcome screen hides the earlier conversation behind `View chat history`
        expect(result.current.shouldShowWelcome).toBe(true);
        expect(result.current.isHistoryExpanded).toBe(false);
    });

    it('keeps the messages on screen when the user never messaged Concierge', async () => {
        // Given a fully loaded chat with only Concierge's messages, such as onboarding on a new account
        await setReportActions([createdAction, conciergeMessage]);

        // When the Concierge chat renders
        const {result} = renderHook(() => useConciergeAskState(CONCIERGE_REPORT_ID), {wrapper});

        // Then the messages stay on screen, because `View chat history` would have nothing of the user's to bring back
        expect(result.current.shouldShowWelcome).toBe(false);
    });

    it('shows the welcome screen while older pages are not loaded', async () => {
        // Given only the newest page, where the user's own messages may be on an older page
        await setReportActions([conciergeMessage]);

        // When the Concierge chat renders
        const {result} = renderHook(() => useConciergeAskState(CONCIERGE_REPORT_ID), {wrapper});

        // Then the welcome screen shows
        expect(result.current.shouldShowWelcome).toBe(true);
    });

    it('keeps the welcome screen when a question arrives from another device', async () => {
        // Given the welcome screen is showing
        await setReportActions([createdAction, conciergeMessage, userMessage]);
        const {result} = renderHook(() => useConciergeAskState(CONCIERGE_REPORT_ID), {wrapper});

        // When a question sent from another device arrives
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}`, {'4': {...userMessage, reportActionID: '4', created: '2024-06-01 12:00:00.000'}});
        await waitForBatchedUpdates();

        // Then the welcome screen stays, so this device doesn't flicker
        expect(result.current.shouldShowWelcome).toBe(true);
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
