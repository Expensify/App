/** Measures elapsed JS time for message writes with the report list and composer mounted. */
import {act, cleanup, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {KeyboardStateProvider} from '@components/withKeyboardState';

import type {EmojiPickerRef} from '@libs/actions/EmojiPickerAction';
import {addComment} from '@libs/actions/Report';
import type Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {setHasRadio} from '@libs/NetworkState';

import {ActionListContextProvider} from '@pages/inbox/ActionListContext';
import {ReactionListContext} from '@pages/inbox/ReactionListContext';
import ReportActionCompose from '@pages/inbox/report/ReportActionCompose/ReportActionCompose';
import ReportActionItem from '@pages/inbox/report/ReportActionItem';
import ReportActionsList from '@pages/inbox/report/ReportActionsList';
import {AttachmentModalContextProvider} from '@pages/media/AttachmentModalScreen/AttachmentModalContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type * as LegendListModule from '@legendapp/list/react-native';
import type {LegendListProps, LegendListRef} from '@legendapp/list/react-native';
import type * as NodeModule from 'node:module';
import type * as NodeURL from 'node:url';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import type {OnyxMultiSetInput} from 'react-native-onyx';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
// eslint-disable-next-line no-restricted-imports -- this fixture must acknowledge scrolling on the underlying native Jest mock.
import {ScrollView} from 'react-native';
import Onyx from 'react-native-onyx';
import {measureAsyncFunction} from 'reassure';

import * as ReportTestUtils from '../utils/ReportTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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

jest.unmock('@components/ActionSheetAwareScrollView/index');

// Match the existing native list fixtures because Jest provides no native layout measurements.
const MOCK_VIEWPORT = {width: 300, height: 400};
const MOCK_ROW_HEIGHT = 75;
let mockContentHeight = 0;

jest.mock('@legendapp/list/react-native', () => {
    // jsdom selects the browser export; this native fixture needs the advertised React Native entry.
    const {createRequire, findPackageJSON} = jest.requireActual<typeof NodeModule>('node:module');
    const {pathToFileURL} = jest.requireActual<typeof NodeURL>('node:url');
    const packagePath = findPackageJSON(pathToFileURL(require.resolve('@legendapp/list/react-native')));
    if (!packagePath) {
        throw new Error('LegendList package metadata was not found');
    }
    const requireList = createRequire(packagePath);
    const packageMetadata = jest.requireActual<{exports: Record<'./react-native', Record<'react-native', {require: string}>>}>(packagePath);
    const nativeEntry = packageMetadata.exports['./react-native']['react-native'].require;
    if (typeof nativeEntry !== 'string') {
        throw new Error('LegendList does not advertise a native CommonJS entry');
    }
    const actual = jest.requireActual<typeof LegendListModule>(requireList.resolve(nativeEntry));
    const ReactActual = jest.requireActual<typeof React>('react');
    return {
        ...actual,
        LegendList: ReactActual.forwardRef<LegendListRef, LegendListProps<unknown>>((props, ref) => {
            mockContentHeight = (props.data?.length ?? 0) * MOCK_ROW_HEIGHT;
            return ReactActual.createElement(actual.LegendList, {
                ...props,
                ref,
                estimatedListSize: MOCK_VIEWPORT,
                getFixedItemSize: () => MOCK_ROW_HEIGHT,
            });
        }),
    };
});

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

let nativeScrollSpy: jest.SpyInstance<ReturnType<ScrollView['scrollTo']>, Parameters<ScrollView['scrollTo']>>;
afterAll(() => nativeScrollSpy.mockRestore());

beforeAll(() => {
    const originalScrollTo = ScrollView.prototype.scrollTo;
    // Jest's native scrollTo is a no-op, so acknowledge this list's scrolling to let it update its window.
    nativeScrollSpy = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(function (this: ScrollView, ...args) {
        const [options, deprecatedX] = args;
        if (this.props.testID !== CONST.TEST_ID.REPORT_ACTIONS_LIST) {
            originalScrollTo.apply(this, args);
            return;
        }
        const x = typeof options === 'number' ? (deprecatedX ?? 0) : (options?.x ?? 0);
        const y = typeof options === 'number' ? options : (options?.y ?? 0);
        const event = {
            nativeEvent: {
                contentOffset: {x, y},
                contentInset: {top: 0, bottom: 0, left: 0, right: 0},
                zoomScale: 1,
                layoutMeasurement: MOCK_VIEWPORT,
                contentSize: {width: MOCK_VIEWPORT.width, height: mockContentHeight},
            },
        } satisfies Pick<NativeSyntheticEvent<NativeScrollEvent>, 'nativeEvent'>;
        // The list only reads nativeEvent; Jest has no host instance for the synthetic event's target fields.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        setTimeout(() => this.props.onScroll?.(event as NativeSyntheticEvent<NativeScrollEvent>), 0);
    });
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

async function prepareSample() {
    global.fetch = TestHelper.getGlobalFetchMock();
    setHasRadio(true);
    await Onyx.clear();
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
}

afterEach(async () => {
    await Onyx.clear();
    await waitForBatchedUpdates();
});

const reactionListContextValue = {showReactionList: () => {}, hideReactionList: () => {}, isActiveReportAction: () => false};

// Mount both consumers so elapsed time includes their subscriptions and React updates.
function ReportScreenMessagesWrapper() {
    return (
        <NavigationContainer ref={navigationRef}>
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider, KeyboardStateProvider, AttachmentModalContextProvider]}>
                <ReactionListContext.Provider value={reactionListContextValue}>
                    <ActionListContextProvider>
                        <ReportActionsList reportID={REPORT_ID} />
                        <ReportActionCompose reportID={REPORT_ID} />
                    </ActionListContextProvider>
                </ReactionListContext.Provider>
            </ComposeProviders>
        </NavigationContainer>
    );
}

async function sendMessages() {
    for (let index = 0; index < MESSAGES_PER_SCENARIO; index++) {
        const text = `Message ${index}`;
        await act(async () => {
            addComment({
                report: openReport,
                notifyReportID: REPORT_ID,
                ancestors: [],
                text,
                reportActionID: `sent${index}`,
                timezoneParam: CONST.DEFAULT_TIME_ZONE,
                currentUserAccountID: TEST_USER_ACCOUNT_ID,
                delegateAccountID: undefined,
                conciergeReportID: undefined,
            });
            await waitForBatchedUpdates();
        });
    }
}

async function receiveMessages() {
    // Mirrors a Pusher update: the new action from another participant and the report fields it changes.
    for (let index = 0; index < MESSAGES_PER_SCENARIO; index++) {
        const reportActionID = `received${index}`;
        const created = new Date(Date.UTC(2030, 0, 1) + index * 1000).toISOString().replace('T', ' ').replace('Z', '');
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

async function mountSample() {
    await prepareSample();
    render(<ReportScreenMessagesWrapper />);
    const list = await screen.findByTestId('report-actions-list');
    fireEvent(list, 'layout', {nativeEvent: {layout: {x: 0, y: 0, ...MOCK_VIEWPORT}}});
    await act(waitForBatchedUpdates);
    // eslint-disable-next-line rulesdir/no-onyx-get-snapshot-key -- verifies the live benchmark fixture outside React and Search scope.
    const actions = await Onyx.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`);
    expect(Object.keys(actions ?? {})).toHaveLength(OPEN_REPORT_ACTION_COUNT);
    const mountedRows = screen.queryAllByAccessibilityHint(TestHelper.translateLocal('accessibilityHints.chatMessage'));
    expect(mountedRows.length).toBeGreaterThan(0);
    expect(mountedRows.length).toBeLessThan(OPEN_REPORT_ACTION_COUNT);
}

async function verifySample(prefix: string) {
    // eslint-disable-next-line rulesdir/no-onyx-get-snapshot-key -- verifies the live benchmark fixture outside React and Search scope.
    const actions = await Onyx.get(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`);
    expect(Object.keys(actions ?? {})).toHaveLength(OPEN_REPORT_ACTION_COUNT + MESSAGES_PER_SCENARIO);
    for (let index = 0; index < MESSAGES_PER_SCENARIO; index++) {
        expect(actions?.[`${prefix}${index}`]?.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT);
    }
    const mountedActionIDs = screen.UNSAFE_getAllByType(ReportActionItem).map((node) => {
        const action: unknown = node.props.action;
        if (!action || typeof action !== 'object' || !('reportActionID' in action) || typeof action.reportActionID !== 'string') {
            throw new Error('Mounted report action is missing its ID');
        }
        return action.reportActionID;
    });
    expect(mountedActionIDs).toEqual(expect.arrayContaining(Array.from({length: MESSAGES_PER_SCENARIO}, (_, index) => `${prefix}${index}`)));
    expect(mountedActionIDs.length).toBeLessThan(OPEN_REPORT_ACTION_COUNT);
    cleanup();
    await waitForBatchedUpdates();
    expect(jest.getTimerCount()).toBe(0);
    expect(screen.isDetached).toBe(true);
    // Reassure runs every sample in one test, so release the spy's retained scroll view instances here.
    nativeScrollSpy.mockClear();
}

test('[ReportScreen] elapsed JS time sending 10 messages in a large chat', async () => {
    // Given the same large account and mounted list and composer before every sample.
    // When ten messages are sent through the real optimistic action path.
    // Then all ten actions must exist, with setup and assertions outside the timed region.
    await measureAsyncFunction(sendMessages, {beforeEach: mountSample, afterEach: () => verifySample('sent')});
});

test('[ReportScreen] elapsed JS time receiving 10 messages in a large chat', async () => {
    // Given the same large account and mounted list and composer before every sample.
    // When ten incoming messages and their report updates are applied sequentially.
    // Then all ten actions must exist, with setup and assertions outside the timed region.
    await measureAsyncFunction(receiveMessages, {beforeEach: mountSample, afterEach: () => verifySample('received')});
});
