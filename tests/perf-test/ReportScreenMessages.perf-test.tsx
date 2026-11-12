import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {KeyboardStateProvider} from '@components/withKeyboardState';

import type {EmojiPickerRef} from '@libs/actions/EmojiPickerAction';
import {addComment} from '@libs/actions/Report';
import type Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {setHasRadio} from '@libs/NetworkState';

import {ActionListContext} from '@pages/inbox/ActionListContext';
import {ReactionListContext} from '@pages/inbox/ReactionListContext';
import ReportActionCompose from '@pages/inbox/report/ReportActionCompose/ReportActionCompose';
import ReportActionsList from '@pages/inbox/report/ReportActionsList';
import {AttachmentModalContextProvider} from '@pages/media/AttachmentModalScreen/AttachmentModalContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxMultiSetInput} from 'react-native-onyx';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {measureAsyncFunction, measureRenders} from 'reassure';

import * as ReportTestUtils from '../utils/ReportTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const REPORT_ID = '1';
const POLICY_ID = 'P1';
const TEST_USER_ACCOUNT_ID = 1;
const TEST_USER_LOGIN = 'test@test.com';
const OTHER_USER_ACCOUNT_ID = 2;

// A large account: the open chat holds 500 messages and 300 other chats hold 20 messages each.
const OPEN_REPORT_ACTION_COUNT = 500;
const OTHER_REPORT_COUNT = 300;
const OTHER_REPORT_ACTION_COUNT = 20;
const MESSAGES_PER_SCENARIO = 10;

jest.mock('@gorhom/portal');

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => ({key: 'report', name: 'Report', params: {reportID: '1'}}),
        useIsFocused: () => true,
        useNavigation: () => ({navigate: jest.fn(), addListener: () => jest.fn(), setParams: jest.fn(), getState: jest.fn()}),
        useNavigationState: () => {},
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@src/libs/actions/EmojiPickerAction', () => {
    const actualEmojiPickerAction = jest.requireActual<EmojiPickerRef>('@src/libs/actions/EmojiPickerAction');
    return {
        ...actualEmojiPickerAction,
        emojiPickerRef: {current: {isEmojiPickerVisible: false}},
        showEmojiPicker: jest.fn(),
        hideEmojiPicker: jest.fn(),
        isActive: () => true,
    };
});

beforeAll(() => {
    Onyx.init({
        keys: ONYXKEYS,
        evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    });
    // Required lazily so the navigation mock is registered before the engine's imports load it
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    require('@userActions/OnyxDerived').default();
});

function buildActions(count: number, firstCreated: number): ReportActions {
    // Each message is one second newer than the previous one, and the oldest action is the CREATED action.
    return Object.fromEntries(
        Array.from({length: count}, (_, index): [string, ReportAction] => {
            const reportActionID = String(index + 1);
            const created = new Date(firstCreated + index * 1000).toISOString().replace('T', ' ').replace('Z', '');
            const actionName = index === 0 ? CONST.REPORT.ACTIONS.TYPE.CREATED : CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT;
            return [
                reportActionID,
                ReportTestUtils.getFakeReportAction(index + 1, {reportActionID, created, actionName, actorAccountID: index % 2 === 0 ? TEST_USER_ACCOUNT_ID : OTHER_USER_ACCOUNT_ID}),
            ];
        }),
    );
}

const FIRST_CREATED = Date.UTC(2025, 0, 1);
const openReportActions = buildActions(OPEN_REPORT_ACTION_COUNT, FIRST_CREATED);
const openReport: Report = ReportTestUtils.createMockReport({
    reportID: REPORT_ID,
    policyID: POLICY_ID,
    participants: {[TEST_USER_ACCOUNT_ID]: {notificationPreference: 'always'}, [OTHER_USER_ACCOUNT_ID]: {notificationPreference: 'always'}},
    lastVisibleActionCreated: Object.values(openReportActions).at(-1)?.created,
    lastReadTime: Object.values(openReportActions).at(-1)?.created,
});

function buildOtherReports(): OnyxMultiSetInput {
    const data: OnyxMultiSetInput = {};
    for (let index = 0; index < OTHER_REPORT_COUNT; index++) {
        const reportID = String(1000 + index);
        const actions = buildActions(OTHER_REPORT_ACTION_COUNT, FIRST_CREATED + index * 60_000);
        data[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = ReportTestUtils.createMockReport({
            reportID,
            reportName: `Chat ${reportID}`,
            lastVisibleActionCreated: Object.values(actions).at(-1)?.created,
        });
        data[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] = actions;
    }
    return data;
}

const otherReports = buildOtherReports();

beforeEach(async () => {
    global.fetch = TestHelper.getGlobalFetchMock();
    setHasRadio(true);
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    await act(async () => {
        TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
        await Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        await Onyx.multiSet(otherReports);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            name: 'Policy',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            owner: TEST_USER_LOGIN,
            outputCurrency: CONST.CURRENCY.USD,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, openReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, openReportActions);
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, {
            isLoadingInitialReportActions: false,
            hasOnceLoadedReportActions: true,
            isLoadingOlderReportActions: false,
            hasLoadingOlderReportActionsError: false,
            isLoadingNewerReportActions: false,
            hasLoadingNewerReportActionsError: false,
        });
        await waitForBatchedUpdates();
    });
});

afterEach(async () => {
    await Onyx.clear();
    await waitForBatchedUpdates();
});

function buildActionListContextValue() {
    return {scrollOffsetRef: {current: 0}, getScrollOffset: () => 0, registerListRef: () => {}, getListRef: () => null};
}
const actionListContextValue = buildActionListContextValue();
const reactionListContextValue = {showReactionList: () => {}, hideReactionList: () => {}, isActiveReportAction: () => false};

// The list and the composer, which read the open report's actions through four paginated subscriptions between them.
function ReportScreenMessagesWrapper() {
    return (
        <NavigationContainer ref={navigationRef}>
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, KeyboardStateProvider, AttachmentModalContextProvider]}>
                <ReactionListContext.Provider value={reactionListContextValue}>
                    <ActionListContext.Provider value={actionListContextValue}>
                        <ReportActionsList reportID={REPORT_ID} />
                        <ReportActionCompose reportID={REPORT_ID} />
                    </ActionListContext.Provider>
                </ReactionListContext.Provider>
            </ComposeProviders>
        </NavigationContainer>
    );
}

let sentMessageCount = 0;

async function sendMessages() {
    for (let index = 0; index < MESSAGES_PER_SCENARIO; index++) {
        sentMessageCount++;
        const text = `Message ${sentMessageCount}`;
        await act(async () => {
            addComment({
                report: openReport,
                notifyReportID: REPORT_ID,
                ancestors: [],
                text,
                timezoneParam: CONST.DEFAULT_TIME_ZONE,
                currentUserAccountID: TEST_USER_ACCOUNT_ID,
                delegateAccountID: undefined,
                conciergeReportID: undefined,
            });
            await waitForBatchedUpdates();
        });
    }
}

let receivedMessageCount = 0;

async function receiveMessages() {
    // Mirrors a Pusher update: the new action from another participant and the report fields it changes.
    for (let index = 0; index < MESSAGES_PER_SCENARIO; index++) {
        receivedMessageCount++;
        const reportActionID = `received${receivedMessageCount}`;
        const created = new Date(Date.UTC(2030, 0, 1) + receivedMessageCount * 1000).toISOString().replace('T', ' ').replace('Z', '');
        const action = ReportTestUtils.getFakeReportAction(OTHER_USER_ACCOUNT_ID, {
            reportActionID,
            created,
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            actorAccountID: OTHER_USER_ACCOUNT_ID,
        });
        await act(async () => {
            await Onyx.update([
                {onyxMethod: Onyx.METHOD.MERGE, key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, value: {[reportActionID]: action}},
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
                    value: {lastVisibleActionCreated: created, lastMessageText: 'test', lastActorAccountID: OTHER_USER_ACCOUNT_ID},
                },
            ]);
            await waitForBatchedUpdates();
        });
    }
}

test('[ReportScreen] should send 10 messages in a large chat', async () => {
    // Given a large account with the report's list and composer mounted
    // When the user sends 10 messages
    // Then reassure measures how many renders and how much render time each send costs
    await measureRenders(<ReportScreenMessagesWrapper />, {
        scenario: async () => {
            await screen.findByTestId('report-actions-list');
            await sendMessages();
        },
    });
});

test('[ReportScreen] should spend this much JS time sending 10 messages in a large chat', async () => {
    // Given the same mounted screen, when the user sends 10 messages
    // Then reassure measures the whole JS cost, including Onyx derived values and selectors that run outside React renders
    render(<ReportScreenMessagesWrapper />);
    await screen.findByTestId('report-actions-list');
    await measureAsyncFunction(sendMessages);
});

test('[ReportScreen] should receive 10 messages in a large chat', async () => {
    // Given the same mounted screen, when another participant's 10 messages arrive
    // Then reassure measures the renders and render time each received message costs
    await measureRenders(<ReportScreenMessagesWrapper />, {
        scenario: async () => {
            await screen.findByTestId('report-actions-list');
            await receiveMessages();
        },
    });
});

test('[ReportScreen] should spend this much JS time receiving 10 messages in a large chat', async () => {
    // Given the same mounted screen, when another participant's 10 messages arrive
    // Then reassure measures the whole JS cost of applying them
    render(<ReportScreenMessagesWrapper />);
    await screen.findByTestId('report-actions-list');
    await measureAsyncFunction(receiveMessages);
});
