import {act, cleanup, fireEvent, render, screen} from '@testing-library/react-native';

import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {SidePanelStateContext} from '@components/SidePanel/SidePanelContextProvider';

import * as InFlightRequests from '@hooks/useInFlightRequests';
import {IsInSidePanelContext} from '@hooks/useIsInSidePanel';
import useSidePanelState from '@hooks/useSidePanelState';

import moveAccessibilityFocus from '@libs/Accessibility/moveAccessibilityFocus';
import * as ReportActions from '@libs/actions/Report';
import {setHasRadio} from '@libs/NetworkState';
import Visibility from '@libs/Visibility';

import type * as ActionListContextModule from '@pages/inbox/ActionListContext';
import {ConciergeChatHistoryProvider} from '@pages/inbox/ConciergeChatHistoryContext';
import type {useConciergeDraft} from '@pages/inbox/ConciergeDraftContext';
import ReportActionsList from '@pages/inbox/report/ReportActionsList';
import type * as ListContext from '@pages/inbox/report/ReportActionsListContext';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions as ReportActionsCollection} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';
import type {ListRenderItemInfo} from '@shopify/flash-list';
import type {PressableProps, TextProps, View as NativeView} from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

let mockCapturedState: ListContext.ReportActionsListState;
let mockCapturedActions: ListContext.ReportActionsListActions;
type NativeTestComponents = {View: typeof NativeView; Text: React.ComponentType<TextProps>; Pressable: React.ComponentType<PressableProps>};
let mockDraft: ReturnType<typeof useConciergeDraft> = {draftReportAction: null, hasActiveDraft: false, isDraftPendingCompletion: false};
const mockDraftStateContext = React.createContext<ReturnType<typeof useConciergeDraft>>(mockDraft);
const mockClearDraft = jest.fn();
const mockRevealDraft = jest.fn();
const mockMarkAsRead = jest.fn();
const mockScrollToIndex = jest.fn();
const mockScrollArgs = jest.fn();
const mockFlushPendingScroll = jest.fn();
const mockListRender = jest.fn();
const mockFocusTarget = {};
let mockContentSizeChange: (() => void) | undefined;
const mockRouteParams: {reportActionID?: string} = {};
const mockListRef = {current: {scrollToIndex: mockScrollToIndex}};

jest.mock('@pages/inbox/report/ReportActionsListContext', () => {
    const actual = jest.requireActual<typeof ListContext>('@pages/inbox/report/ReportActionsListContext');
    return {
        ...actual,
        useReportActionsListState: () => {
            mockCapturedState = actual.useReportActionsListState();
            return mockCapturedState;
        },
        useReportActionsListActions: () => {
            mockCapturedActions = actual.useReportActionsListActions();
            return mockCapturedActions;
        },
    };
});
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
    useRoute: () => ({key: 'list-provider-test', name: 'Report', params: mockRouteParams}),
}));
jest.mock('@hooks/usePendingConciergeResponse', () => jest.fn());
jest.mock('@hooks/useCopySelectionEvent', () => jest.fn());
jest.mock('@hooks/useLinkedMessageOfflineLoading', () => jest.fn());
jest.mock('@hooks/useRetireMerchantRuleSuggestionOnLeave', () => jest.fn());
jest.mock('@libs/telemetry/markOpenReportEnd', () => jest.fn());
jest.mock('@libs/Accessibility/moveAccessibilityFocus', () => jest.fn());
jest.mock('@hooks/useMarkAsRead', () => () => ({markNewestActionAsRead: mockMarkAsRead, completeSkippedMarkAsRead: jest.fn()}));
jest.mock('@pages/inbox/ConciergeDraftContext', () => {
    const actualReact = jest.requireActual<typeof React>('react');
    return {
        useConciergeDraft: () => actualReact.useContext(mockDraftStateContext),
        useConciergeDraftActions: () => ({clearDraft: mockClearDraft, revealDraftFromReportAction: mockRevealDraft}),
    };
});
jest.mock('@pages/inbox/ActionListContext', () => ({
    ...jest.requireActual<typeof ActionListContextModule>('@pages/inbox/ActionListContext'),
    useActionListRef: () => mockListRef,
}));
jest.mock('@hooks/useReportActionsScroll', () => (args: unknown) => {
    mockScrollArgs(args);
    return {
        trackVerticalScrolling: jest.fn(),
        onViewableItemsChanged: jest.fn(),
        isFloatingMessageCounterVisible: false,
        isActionBadgeAboveViewport: false,
        scrollToBottomAndMarkReportAsRead: jest.fn(),
        scrollToActionBadgeTarget: jest.fn(),
        flushPendingScrollToBottom: mockFlushPendingScroll,
        shouldBeAlignedToTop: false,
        shouldFocusToTopOnMount: false,
        onLoad: jest.fn(),
    };
});
jest.mock('@components/FlashList/InvertedFlashList', () => {
    const {View} = jest.requireActual<NativeTestComponents>('react-native');
    const ReactModule = jest.requireActual<typeof React>('react');
    return ({data, renderItem, onContentSizeChange}: {data: ReportAction[]; renderItem: (info: ListRenderItemInfo<ReportAction>) => React.ReactNode; onContentSizeChange?: () => void}) => {
        mockListRender();
        mockContentSizeChange = onContentSizeChange;
        return (
            <View testID="report-actions-list">
                {data.map((item, index) => (
                    <ReactModule.Fragment key={item.reportActionID}>{renderItem({item, index, target: 'Cell'})}</ReactModule.Fragment>
                ))}
            </View>
        );
    };
});
jest.mock('@pages/inbox/report/ReportActionsListItemRenderer', () => {
    const {View, Text} = jest.requireActual<NativeTestComponents>('react-native');
    return ({
        reportAction,
        shouldDisplayNewMarker,
        isLatestConciergeFeedbackAction,
        shouldDisableContextMenuForConciergeDraft,
        onExpandedSystemMessageReady,
    }: {
        reportAction: ReportAction;
        shouldDisplayNewMarker?: boolean;
        isLatestConciergeFeedbackAction?: boolean;
        shouldDisableContextMenuForConciergeDraft?: boolean;
        onExpandedSystemMessageReady?: (target: unknown) => void;
    }) => (
        <View
            testID={`action-${reportAction.reportActionID}`}
            onLayout={() => onExpandedSystemMessageReady?.(mockFocusTarget)}
        >
            <Text>{(Array.isArray(reportAction.message) ? reportAction.message[0]?.text : reportAction.message?.text) ?? reportAction.reportActionID}</Text>
            {shouldDisplayNewMarker && <Text testID={`unread-${reportAction.reportActionID}`}>New</Text>}
            {isLatestConciergeFeedbackAction && <Text testID={`feedback-${reportAction.reportActionID}`}>Feedback</Text>}
            {shouldDisableContextMenuForConciergeDraft && <Text testID={`context-disabled-${reportAction.reportActionID}`}>Streaming</Text>}
        </View>
    );
});
jest.mock('@pages/inbox/report/CollapsedSystemMessages', () => {
    const {Pressable, Text} = jest.requireActual<NativeTestComponents>('react-native');
    return ({count, onPress}: {count: number; onPress: () => void}) => (
        <Pressable
            accessibilityRole="button"
            testID="collapsed-system-messages"
            onPress={onPress}
        >
            <Text>{count} updates</Text>
        </Pressable>
    );
});
jest.mock('@pages/inbox/report/AskConciergeWelcome', () => {
    const {View} = jest.requireActual<NativeTestComponents>('react-native');
    return () => <View testID="concierge-welcome" />;
});
jest.mock('@pages/inbox/report/ReportActionsListHeader', () => () => null);
jest.mock('@pages/inbox/report/ShowPreviousMessagesButton', () => () => null);
jest.mock('@pages/inbox/report/ReportActionsList/ReportActionsListFloatingMessageCounter', () => () => null);
jest.mock(
    '@pages/inbox/report/ReportActionsListPaddingView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/MerchantRuleSuggestionBanner', () => () => null);

const reportID = '1';
const CURRENT_USER_ID = 1;
const OTHER_USER_ID = 2;
const CUSTOM_AGENT_ID = 3;
const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const;
const actionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}` as const;
const metadataKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}` as const;
const loadingKey = `${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}` as const;
const at = (minute: number) => `2026-11-01 00:${String(minute).padStart(2, '0')}:00.000`;
const action = (id: string, minute: number, overrides: Partial<ReportAction> = {}): ReportAction => ({
    reportID,
    reportActionID: id,
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    actorAccountID: 2,
    created: at(minute),
    message: {type: 'COMMENT', html: `<p>Message ${id}</p>`, text: `Message ${id}`},
    shouldShow: true,
    pendingAction: null,
    ...overrides,
});
const created = action('1', 0, {actionName: CONST.REPORT.ACTIONS.TYPE.CREATED, actorAccountID: 1});
const reply = action('2', 2);
const baseReport: Report = {
    reportID,
    reportName: 'Provider test',
    type: CONST.REPORT.TYPE.CHAT,
    ownerAccountID: 1,
    managerID: 2,
    participants: {[CURRENT_USER_ID]: {notificationPreference: 'always'}, [OTHER_USER_ID]: {notificationPreference: 'always'}},
    lastReadTime: at(50),
    lastVisibleActionCreated: at(2),
};

function Frame({sidePanel = false, sessionStartTime = null}: {sidePanel?: boolean; sessionStartTime?: string | null}) {
    const defaults = useSidePanelState();
    const sidePanelState = React.useMemo(() => ({...defaults, sessionStartTime}), [defaults, sessionStartTime]);
    return (
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsProvider>
                <LocaleContextProvider>
                    <ConciergeChatHistoryProvider>
                        <IsInSidePanelContext.Provider value={sidePanel}>
                            <SidePanelStateContext.Provider value={sidePanelState}>
                                <mockDraftStateContext.Provider value={mockDraft}>
                                    <ReportActionsList reportID={reportID} />
                                </mockDraftStateContext.Provider>
                            </SidePanelStateContext.Provider>
                        </IsInSidePanelContext.Provider>
                    </ConciergeChatHistoryProvider>
                </LocaleContextProvider>
            </CurrentUserPersonalDetailsProvider>
        </OnyxListItemProvider>
    );
}

async function update(operation: () => Promise<unknown> | void) {
    await act(async () => {
        await operation();
        await waitForBatchedUpdates();
    });
}
async function seed(actions: ReportAction[] = [reply, created], report: Report = baseReport) {
    const records: ReportActionsCollection = Object.fromEntries(actions.map((item) => [item.reportActionID, item]));
    await update(() =>
        Onyx.multiSet({
            [ONYXKEYS.SESSION]: {accountID: 1, email: 'provider@test.com', authToken: 'test'},
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                [CURRENT_USER_ID]: {accountID: 1, login: 'provider@test.com', displayName: 'Provider User'},
                [OTHER_USER_ID]: {accountID: 2, login: 'other@test.com', displayName: 'Other User'},
            },
            [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.DEFAULT,
            [ONYXKEYS.IS_LOADING_APP]: false,
            [ONYXKEYS.HAS_LOADED_APP]: true,
            [ONYXKEYS.PERSISTED_REQUESTS]: [],
            [reportKey]: report,
            [actionsKey]: records,
            [metadataKey]: {origin: 'fixture'},
            [loadingKey]: {hasOnceLoadedReportActions: true, isLoadingInitialReportActions: false, isLoadingOlderReportActions: false},
        }),
    );
}
async function mount(props: React.ComponentProps<typeof Frame> = {}) {
    const result = render(<Frame {...props} />);
    await update(() => undefined);
    return result;
}
const visibleIDs = () => mockCapturedState.listData.map((item) => item.reportActionID);

describe('ReportActionsListProvider', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
        await waitForBatchedUpdates();
    });
    beforeEach(async () => {
        jest.clearAllMocks();
        delete mockRouteParams.reportActionID;
        mockDraft = {draftReportAction: null, hasActiveDraft: false, isDraftPendingCompletion: false};
        global.fetch = TestHelper.getGlobalFetchMock();
        setHasRadio(true);
        await update(() => Onyx.clear());
    });
    afterEach(async () => {
        await update(() => {
            cleanup();
        });
        await update(() => Onyx.clear());
        jest.restoreAllMocks();
    });

    it('provides finished rows and index mappings from real Onyx inputs', async () => {
        // Given a loaded report with a reply and its CREATED action
        await seed();
        // When the public list mounts
        await mount();
        // Then content renders the prepared rows and receives their display indexes
        expect(screen.getByTestId('action-2')).toBeTruthy();
        expect(visibleIDs()).toEqual(['2', '1']);
        expect(mockCapturedState.reportActionIDToDisplayIndex.get('2')).toBe(0);
        expect(mockCapturedState.canonicalIndexByReportActionID.get('1')).toBe(1);
    });

    it('keeps interactive effects and draft cleanup dormant until the report is ready', async () => {
        // Given an empty cold report whose initial messages have not loaded
        await seed([], {...baseReport, lastReadTime: at(0), lastVisibleActionCreated: at(2), lastActorAccountID: 2});
        await update(() => Onyx.merge(loadingKey, {hasOnceLoadedReportActions: false, isLoadingInitialReportActions: true}));
        mockDraft = {draftReportAction: action('draft', 3), hasActiveDraft: true, isDraftPendingCompletion: false};
        // When the list is behind its loading screen
        await mount();
        // Then content and its read effects have not mounted, nor has the draft been discarded
        expect(screen.queryByTestId('report-actions-list')).toBeNull();
        expect(mockMarkAsRead).not.toHaveBeenCalled();
        expect(mockClearDraft).not.toHaveBeenCalled();
        // When the reply arrives and initial loading completes
        await update(async () => {
            await Onyx.merge(actionsKey, {[created.reportActionID]: created, [reply.reportActionID]: reply});
            await Onyx.merge(loadingKey, {hasOnceLoadedReportActions: true, isLoadingInitialReportActions: false});
        });
        // Then the same provider admits the prepared conversation
        expect(screen.getByTestId('report-actions-list')).toBeTruthy();
        expect(visibleIDs()).toContain('2');
    });

    it('hides waiting payments without hiding direct-send payments, and restores them reactively', async () => {
        // Given waiting payment actions alongside a direct-send payment
        const pay = action('4', 4, {actionName: CONST.REPORT.ACTIONS.TYPE.IOU, message: {type: CONST.IOU.REPORT_ACTION_TYPE.PAY, IOUReportID: '9', text: 'Payment', html: '<p>Payment</p>'}});
        const direct = action('3', 3, {
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            message: {
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                IOUReportID: '9',
                IOUDetails: {amount: 100, currency: 'USD', comment: ''},
                text: 'Direct payment',
                html: '<p>Direct payment</p>',
            },
        });
        await seed([pay, direct, reply, created], {...baseReport, isWaitingOnBankAccount: true});
        // When the list prepares its rows
        await mount();
        // Then the hidden payment is absent but direct-send history remains
        expect(visibleIDs()).not.toContain('4');
        expect(visibleIDs()).toContain('3');
        // When the waiting state clears
        await update(() => Onyx.merge(reportKey, {isWaitingOnBankAccount: false}));
        // Then the payment returns without remounting the list
        expect(visibleIDs()).toContain('4');
    });

    it('keeps the first unread divider when a focused cold list becomes ready', async () => {
        // Given cached unread messages behind the app-load gate, without a manual unread override
        await seed([reply, created], {...baseReport, lastReadTime: at(1), lastVisibleActionCreated: reply.created, lastActorAccountID: 2});
        await update(() => Onyx.merge(loadingKey, {hasOnceLoadedReportActions: false, isLoadingInitialReportActions: true}));
        const pending = jest.spyOn(InFlightRequests, 'useIsAppLoadPending').mockReturnValue(true);
        jest.spyOn(Visibility, 'hasFocus').mockReturnValue(true);
        await mount();
        expect(screen.queryByTestId('report-actions-list')).toBeNull();
        // When the response releases loading and marks the initial actions loaded together
        pending.mockReturnValue(false);
        await update(() => Onyx.merge(loadingKey, {hasOnceLoadedReportActions: true, isLoadingInitialReportActions: false}));
        // Then the loaded unread reply is not mistaken for a newly arrived auto-read message
        expect(screen.getByTestId('unread-2')).toBeTruthy();
        expect(mockCapturedState.unreadMarkerReportActionID).toBe('2');
        // When another report update rerenders the ready provider
        await update(() => Onyx.merge(reportKey, {reportName: 'Unread snapshot remains'}));
        // Then its initial unread watermark has not been advanced past the reply
        expect(screen.getByTestId('unread-2')).toBeTruthy();
    });

    it.each(['unresolved', 'resolved', 'replaced', 'missing-resolution'] as const)('prepares survey rows for a %s ticket', async (state) => {
        // Given two surveys and, when cached, a resolution between them
        const oldSurvey = action('3', 3, {actionName: CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY});
        const resolution = action('4', 4, {actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED});
        const survey = action('5', 5, {actionName: CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY});
        await seed([survey, ...(state === 'missing-resolution' ? [] : [resolution]), oldSurvey, reply, created], {
            ...baseReport,
            type: CONST.REPORT.TYPE.SUPPORT_TICKET,
            stateNum: state === 'unresolved' ? 0 : 2,
            statusNum: state === 'unresolved' ? 0 : 2,
        });
        if (state === 'replaced') {
            await update(() => Onyx.merge(metadataKey, {reopenedAsReportID: 'replacement'}));
        }
        // When the real derived engine and list prepare the conversation
        await mount();
        // Then only a resolved ticket with a cached resolution displays its latest survey
        expect(visibleIDs()).not.toContain('3');
        expect(visibleIDs().includes('5')).toBe(state === 'resolved');
        expect(visibleIDs()).toContain('2');
    });

    it('keeps an optimistic replaced survey out of rows while retaining the upstream scroll page', async () => {
        // Given an optimistic survey that uses runtime rather than cached visibility
        const resolution = action('4', 4, {actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED});
        const survey = action('5', 5, {actionName: CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
        await seed([survey, resolution, reply, created], {...baseReport, type: CONST.REPORT.TYPE.SUPPORT_TICKET, stateNum: 2, statusNum: 2});
        await mount();
        // When replacement metadata arrives
        await update(() => Onyx.merge(metadataKey, {reopenedAsReportID: 'replacement'}));
        // Then survey eligibility removes the row, not the selected-page freshness input
        expect(visibleIDs()).not.toContain('5');
        expect(mockCapturedState.scrollReportActions.map((item) => item.reportActionID)).toContain('5');
    });

    it('replaces a streamed draft with the saved reply without duplicating the row', async () => {
        // Given a draft displayed before its saved action arrives
        await seed();
        mockDraft = {draftReportAction: action('draft', 3), hasActiveDraft: true, isDraftPendingCompletion: true};
        const result = await mount();
        expect(visibleIDs().filter((id) => id === 'draft')).toHaveLength(1);
        // When an identical saved reply arrives while the draft is still pacing
        const savedReply = action('draft', 3);
        await update(() => Onyx.merge(actionsKey, {draft: savedReply}));
        // Then the provider requests reconciliation and keeps exactly one row
        expect(mockRevealDraft).toHaveBeenCalledWith(expect.objectContaining({reportActionID: 'draft'}));
        expect(visibleIDs().filter((id) => id === 'draft')).toHaveLength(1);
        // When pacing completes
        mockDraft = {...mockDraft, isDraftPendingCompletion: false};
        await update(() => result.rerender(<Frame />));
        // Then the saved row takes over and the temporary draft is cleared
        expect(mockClearDraft).toHaveBeenCalled();
        expect(visibleIDs().filter((id) => id === 'draft')).toHaveLength(1);
        expect(mockCapturedState.draftAutoScrollKey).toBe('');
    });

    it('prepares collapsed rows, expands them, and keeps unread indexes aligned', async () => {
        // Given two expense updates with the unread marker on a member of their run
        const older = action('3', 3, {actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE});
        const newer = action('4', 4, {actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE});
        await seed([newer, older, reply, created], {...baseReport, type: CONST.REPORT.TYPE.IOU, manuallyMarkedUnreadReportActionID: '3'});
        // When the provider prepares its rows
        await mount();
        // Then unread targets map to the collapsed row rather than a nonexistent member row
        expect(screen.getByTestId('collapsed-system-messages')).toBeTruthy();
        expect(mockCapturedState.unreadMarkerReportActionID).toBe('3');
        expect(mockCapturedState.unreadMarkerListIndex).toBe(mockCapturedState.reportActionIDToDisplayIndex.get('3'));
        // When the user expands the group
        fireEvent.press(screen.getByTestId('collapsed-system-messages'));
        await update(() => undefined);
        // Then both member rows appear and the oldest member has the focus request
        expect(screen.getByTestId('action-3')).toBeTruthy();
        expect(screen.getByTestId('action-4')).toBeTruthy();
        expect(mockCapturedState.focusRequestedReportActionID).toBe('3');
        expect(mockCapturedState.unreadMarkerListIndex).toBe(visibleIDs().indexOf('3'));
    });

    it('keeps main Concierge welcome and shared history choices in sync', async () => {
        // Given the main Concierge chat with read history
        await seed();
        await update(() => Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, reportID));
        // When it opens without history expanded
        await mount();
        // Then it shows welcome instead of the conversation
        expect(screen.getByTestId('concierge-welcome')).toBeTruthy();
        // When the user asks to show earlier messages
        await update(() => mockCapturedActions.handleShowPreviousMessages());
        // Then the shared history choice reveals the complete conversation
        expect(screen.queryByTestId('concierge-welcome')).toBeNull();
        expect(visibleIDs()).toEqual(['2', '1']);
    });

    it('keeps pending side-panel questions visible after a server timestamp change', async () => {
        // Given earlier history and a pending question sent during this session
        const oldQuestion = action('2', 1, {actorAccountID: 1});
        const question = action('4', 6, {actorAccountID: 1, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
        await seed([question, oldQuestion, created]);
        await update(() => Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, reportID));
        await mount({sidePanel: true, sessionStartTime: at(5)});
        expect(visibleIDs()).toContain('4');
        expect(visibleIDs()).not.toContain('2');
        // When the saved question is stamped before the session started
        await update(() => Onyx.merge(actionsKey, {[question.reportActionID]: {created: at(4), pendingAction: null}}));
        // Then its remembered ID keeps it visible without returning to welcome
        expect(visibleIDs()).toContain('4');
        expect(screen.queryByTestId('concierge-welcome')).toBeNull();
    });

    it('uses the selected page for scrolling while retaining the full cache for lookups', async () => {
        // Given separate cached pages and a completed draft saved on an older page
        const actions = Array.from({length: 10}, (_, index) => action(String(index + 1), index));
        await seed(actions);
        await update(() =>
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${reportID}`, [
                [CONST.PAGINATION_START_ID, '10', '8'],
                ['5', '1', CONST.PAGINATION_END_ID],
            ]),
        );
        mockDraft = {draftReportAction: actions[1], hasActiveDraft: true, isDraftPendingCompletion: false};
        // When the newest page opens
        await mount();
        // Then no saved off-page draft is inserted and the scroll input is not the whole cache
        expect(visibleIDs()).toEqual(['10', '9', '8']);
        expect(mockCapturedState.scrollReportActions).toHaveLength(3);
        expect(mockCapturedState.sortedAllReportActions).toHaveLength(10);
        expect(mockClearDraft).toHaveBeenCalled();
    });

    it('recovers an invisible newest page without mounting interactive content early', async () => {
        // Given a cached newest page containing only backend bookkeeping actions
        const hidden = [action('6', 6, {actionName: CONST.REPORT.ACTIONS.TYPE.QUEUED_FOR_EXPORT}), action('5', 5, {actionName: CONST.REPORT.ACTIONS.TYPE.QUEUED_FOR_EXPORT})];
        await seed([...hidden, action('3', 3), reply, created]);
        await update(() =>
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${reportID}`, [
                [CONST.PAGINATION_START_ID, '6', '5'],
                ['3', '1', CONST.PAGINATION_END_ID],
            ]),
        );
        const olderSpy = jest.spyOn(ReportActions, 'getOlderActions').mockImplementation(() => {});
        // When the provider sees no visible messages in the selected page
        await mount();
        // Then it backfills from the page cursor without mounting the list
        expect(olderSpy).toHaveBeenCalledWith(reportID, '5');
        expect(screen.queryByTestId('report-actions-list')).toBeNull();
        // When the missing gap is filled
        await update(() => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${reportID}`, [[CONST.PAGINATION_START_ID, '6', '1', CONST.PAGINATION_END_ID]]));
        // Then content mounts with the recovered visible history
        expect(screen.getByTestId('action-3')).toBeTruthy();
        expect(visibleIDs()).not.toContain('6');
    });

    it.each([true, false])('keeps the first unread marker on its CREATED header (cached header: %s)', async (hasCachedHeader) => {
        // Given an unread first action and either a saved or synthesized expense header
        const expenseUpdate = action('3', 3, {actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE});
        await seed([expenseUpdate, reply, ...(hasCachedHeader ? [created] : [])], {...baseReport, type: CONST.REPORT.TYPE.IOU, manuallyMarkedUnreadReportActionID: '3'});
        // When the provider prepares the expense conversation
        await mount();
        // Then the header remains in the finished rows and unread indexes use those same rows
        expect(mockCapturedState.listData.some((item) => item.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED)).toBe(true);
        expect(mockCapturedState.unreadMarkerListIndex).toBe(visibleIDs().indexOf('3'));
    });

    it('does not collapse ordinary chat messages and focuses an explicitly expanded expense group only once', async () => {
        // Given two updates in an ordinary chat
        const updates = [action('4', 4, {actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE}), action('3', 3, {actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE})];
        await seed([...updates, reply, created]);
        const result = await mount();
        // When the chat is shown
        // Then ordinary chats have no collapsed groups
        expect(screen.queryByTestId('collapsed-system-messages')).toBeNull();
        // When the report becomes an expense view and the user expands its group
        await update(() => Onyx.merge(reportKey, {type: CONST.REPORT.TYPE.IOU}));
        fireEvent.press(screen.getByTestId('collapsed-system-messages'));
        await update(() => undefined);
        fireEvent(screen.getByTestId('action-3'), 'layout');
        fireEvent(screen.getByTestId('action-3'), 'layout');
        // Then the reveal request is consumed rather than stealing focus on repeated layouts
        expect(moveAccessibilityFocus).toHaveBeenCalledTimes(1);
        expect(mockCapturedState.focusRequestedReportActionID).toBeUndefined();
        result.unmount();
    });

    it.each([true, false])('keeps streaming context-menu and feedback state aligned (pending: %s)', async (pending) => {
        // Given a saved Concierge reply and its local reveal state
        const conciergeReply = action('4', 4, {actorAccountID: CONST.ACCOUNT_ID.CONCIERGE});
        await seed([conciergeReply, reply, created]);
        mockDraft = {draftReportAction: conciergeReply, hasActiveDraft: true, isDraftPendingCompletion: pending};
        // When rows are prepared from that reveal state
        await mount();
        // Then only a pending reveal disables the menu and suppresses the feedback target
        expect(!!screen.queryByTestId('context-disabled-4')).toBe(pending);
        expect(!!screen.queryByTestId('feedback-4')).toBe(!pending);
        expect(visibleIDs().filter((id) => id === '4')).toHaveLength(1);
    });

    it('selects the newest persisted reply for Concierge and each custom agent', async () => {
        // Given multiple replies from Concierge and a custom agent
        const oldConcierge = action('3', 3, {actorAccountID: CONST.ACCOUNT_ID.CONCIERGE});
        const newConcierge = action('5', 5, {actorAccountID: CONST.ACCOUNT_ID.CONCIERGE});
        const agentReply = action('4', 4, {actorAccountID: 3});
        await seed([newConcierge, agentReply, oldConcierge, reply, created]);
        await update(() => Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[CUSTOM_AGENT_ID]: {accountID: 3, login: 'agent@test.com', isCustomAgent: true}}));
        // When the provider prepares feedback eligibility
        await mount();
        // Then only the latest saved reply from each agent can be rated
        expect(screen.getByTestId('feedback-5')).toBeTruthy();
        expect(screen.getByTestId('feedback-4')).toBeTruthy();
        expect(screen.queryByTestId('feedback-3')).toBeNull();
    });

    it('does not offer feedback in a feedback thread or while newer history is missing', async () => {
        // Given a saved Concierge reply inside a feedback thread
        await seed([action('4', 4, {actorAccountID: CONST.ACCOUNT_ID.CONCIERGE}), reply, created]);
        await update(() => Onyx.merge(metadataKey, {conciergeFeedbackForReportActionID: 'rated-reply'}));
        await mount();
        // When feedback metadata applies to this conversation
        // Then the reply is not offered for another rating
        expect(screen.queryByTestId('feedback-4')).toBeNull();
        // When the marker clears but the user is viewing an older page
        mockRouteParams.reportActionID = '2';
        await update(async () => {
            await Onyx.merge(metadataKey, {conciergeFeedbackForReportActionID: null});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${reportID}`, [
                [CONST.PAGINATION_START_ID, '4', '4'],
                ['2', '1', CONST.PAGINATION_END_ID],
            ]);
        });
        // Then the unloaded newer side still suppresses feedback eligibility
        expect(mockCapturedState.hasNewerActions).toBe(true);
        expect(mockCapturedState.latestConciergeFeedbackActionIDs).toEqual([]);
    });

    it.each([true, false])('retires a saved local reply without losing its server followups (pending add: %s)', async (pendingAdd) => {
        // Given a completed local reveal and a saved version with followup content
        const localReply = action('4', 4, {actorAccountID: CONST.ACCOUNT_ID.CONCIERGE});
        const savedReply = {
            ...localReply,
            pendingAction: pendingAdd ? CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD : null,
            message: [{type: 'COMMENT' as const, text: 'Saved reply with followups', html: '<p>Saved reply</p><followup-list></followup-list>'}],
        };
        await seed([savedReply, reply, created]);
        mockDraft = {draftReportAction: localReply, hasActiveDraft: true, isDraftPendingCompletion: false};
        // When the completed draft is reconciled
        await mount();
        // Then the server row takes over even when it retains its pending-add flag
        expect(screen.getByText('Saved reply with followups')).toBeTruthy();
        expect(mockClearDraft).toHaveBeenCalled();
        expect(visibleIDs().filter((id) => id === '4')).toHaveLength(1);
    });

    it.each([
        {pending: true, offline: false, showList: false},
        {pending: false, offline: false, showList: true},
        {pending: true, offline: true, showList: true},
        {pending: false, offline: true, showList: true},
    ])('respects app-loading truth while offline is $offline and pending is $pending', async ({pending, offline, showList}) => {
        // Given loaded cached messages and the shared app-load gate
        await seed();
        jest.spyOn(InFlightRequests, 'useIsAppLoadPending').mockReturnValue(pending);
        setHasRadio(!offline);
        // When the public provider makes its loading decision
        await mount();
        // Then offline users can read cache while an online app load stays gated
        expect(!!screen.queryByTestId('report-actions-list')).toBe(showList);
    });

    it('places the offline unread divider on the visible reply rather than a hidden survey', async () => {
        // Given an offline support ticket with a reply newer than its last read time
        await seed([action('5', 5, {actionName: CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY}), reply, created], {...baseReport, type: CONST.REPORT.TYPE.SUPPORT_TICKET, lastReadTime: at(1)});
        setHasRadio(false);
        jest.spyOn(Visibility, 'hasFocus').mockReturnValue(false);
        // When unread placement uses the filtered conversation
        await mount();
        // Then the reply owns the divider and its index points at a rendered row
        expect(screen.getByTestId('unread-2')).toBeTruthy();
        expect(mockCapturedState.unreadMarkerReportActionID).toBe('2');
        expect(mockCapturedState.unreadMarkerListIndex).toBe(visibleIDs().indexOf('2'));
    });

    it('keeps side-panel history separate from the main-chat choice and resets it for a new session', async () => {
        // Given a returning user's Concierge side panel before a new question
        await seed([action('2', 1, {actorAccountID: 1}), created]);
        await update(() => Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, reportID));
        const result = await mount({sidePanel: true, sessionStartTime: at(5)});
        expect(visibleIDs()).not.toContain('2');
        // When the user expands earlier side-panel messages
        await update(() => mockCapturedActions.handleShowPreviousMessages());
        // Then earlier messages appear without expanding the main-chat setting
        expect(visibleIDs()).toContain('2');
        expect(mockCapturedState.isConciergeHistoryExpanded).toBe(false);
        // When the side panel starts another session
        await update(() =>
            result.rerender(
                <Frame
                    sidePanel
                    sessionStartTime={at(6)}
                />,
            ),
        );
        // Then that session starts with its greeting rather than the expanded earlier history
        expect(visibleIDs()).not.toContain('2');
        expect(mockCapturedState.showFullHistory).toBe(false);
    });

    it('keeps a side-panel reply even when a client-clock adjustment puts the question after it', async () => {
        // Given a question stamped after the reply but both within this session
        const question = action('4', 7, {actorAccountID: 1});
        const response = action('5', 6, {actorAccountID: CONST.ACCOUNT_ID.CONCIERGE});
        await seed([question, response, action('2', 1, {actorAccountID: 1}), created]);
        await update(() => Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, reportID));
        // When session history is filtered
        await mount({sidePanel: true, sessionStartTime: at(5)});
        // Then the question's timestamp does not hide the reply
        expect(visibleIDs()).toContain('4');
        expect(visibleIDs()).toContain('5');
    });

    it('switches from a one-expense thread to the report conversation when another expense arrives', async () => {
        // Given one expense whose comments live in a transaction thread
        const expense = action('2', 2, {
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            childReportID: '3',
            message: {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                IOUReportID: reportID,
                IOUTransactionID: 'T1',
                amount: 100,
                currency: 'USD',
                text: 'First expense',
                html: '<p>First expense</p>',
            },
        });
        await seed([expense, created], {...baseReport, type: CONST.REPORT.TYPE.IOU, chatReportID: '9', currency: 'USD', total: -100});
        const threadCreated = action('10', 0, {reportID: '3', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED});
        const threadReply = action('11', 3, {reportID: '3'});
        await update(() =>
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}9` as const]: {...baseReport, reportID: '9'},
                [`${ONYXKEYS.COLLECTION.REPORT}3` as const]: {...baseReport, reportID: '3', parentReportID: reportID, parentReportActionID: '2'},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3` as const]: {
                    [threadCreated.reportActionID]: threadCreated,
                    [threadReply.reportActionID]: threadReply,
                },
                [`${ONYXKEYS.COLLECTION.TRANSACTION}T1` as const]: {
                    transactionID: 'T1',
                    reportID,
                    amount: 100,
                    currency: 'USD',
                    created: '2026-11-01',
                    merchant: 'First expense',
                    comment: {},
                },
            }),
        );
        await mount();
        expect(visibleIDs()).toContain('11');
        // When a second expense means the report is no longer a one-expense view
        const secondExpense = action('4', 4, {
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            childReportID: '5',
            message: {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                IOUReportID: reportID,
                IOUTransactionID: 'T2',
                amount: 200,
                currency: 'USD',
                text: 'Second expense',
                html: '<p>Second expense</p>',
            },
        });
        await update(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}T2`, {
                transactionID: 'T2',
                reportID,
                amount: 200,
                currency: 'USD',
                created: '2026-11-01',
                merchant: 'Second expense',
                comment: {},
            });
            await Onyx.merge(actionsKey, {[secondExpense.reportActionID]: secondExpense});
        });
        // Then stale thread rows and metadata are removed from the finished conversation
        expect(visibleIDs()).not.toContain('11');
        expect(mockCapturedState.transactionThreadReport).toBeUndefined();
        expect(visibleIDs()).toContain('4');
    });

    it('flushes pending scrolling from content-size events without preparing rows again in content', async () => {
        // Given a loaded list with a pending scroll request
        await seed();
        await mount();
        mockFlushPendingScroll.mockClear();
        // When its content size changes
        act(() => mockContentSizeChange?.());
        // Then the UI hands the layout opportunity to its scroll controller
        expect(mockFlushPendingScroll).toHaveBeenCalledTimes(1);
    });

    describe('empty-page recovery', () => {
        let olderSpy: jest.SpiedFunction<typeof ReportActions.getOlderActions>;
        const hiddenActions = [6, 5, 4, 3].map((id) => action(String(id), id, {actionName: CONST.REPORT.ACTIONS.TYPE.QUEUED_FOR_EXPORT}));
        beforeEach(async () => {
            await seed([...hiddenActions, reply, created]);
            await update(() =>
                Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${reportID}`, [
                    [CONST.PAGINATION_START_ID, '6', '5'],
                    ['3', '1', CONST.PAGINATION_END_ID],
                ]),
            );
            olderSpy = jest.spyOn(ReportActions, 'getOlderActions').mockImplementation(() => {});
        });

        it('requests each cursor once even when unrelated report data changes', async () => {
            // Given an invisible selected page with older history available
            await mount();
            // When the report rerenders without advancing that page
            await update(() => Onyx.merge(reportKey, {reportName: 'Same page'}));
            // Then recovery does not repeatedly request the consumed cursor
            expect(olderSpy).toHaveBeenCalledTimes(1);
            expect(olderSpy).toHaveBeenCalledWith(reportID, '5');
        });

        it('continues recovery when the oldest loaded cursor advances', async () => {
            // Given an invisible page that has already requested older actions
            await mount();
            // When the next loaded window is also invisible
            await update(() =>
                Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${reportID}`, [
                    [CONST.PAGINATION_START_ID, '6', '3'],
                    ['1', '1', CONST.PAGINATION_END_ID],
                ]),
            );
            // Then recovery advances instead of getting stuck on its previous cursor
            expect(olderSpy).toHaveBeenCalledTimes(2);
            expect(olderSpy).toHaveBeenLastCalledWith(reportID, '3');
        });

        it('waits for an existing older-page load to finish', async () => {
            // Given an older-page request already in flight
            await update(() => Onyx.merge(loadingKey, {isLoadingOlderReportActions: true}));
            await mount();
            // When that request has not finished
            // Then no overlapping recovery request is sent
            expect(olderSpy).not.toHaveBeenCalled();
            // When the flag clears without revealing messages
            await update(() => Onyx.merge(loadingKey, {isLoadingOlderReportActions: false}));
            // Then recovery resumes
            expect(olderSpy).toHaveBeenCalledTimes(1);
        });

        it('waits while offline and resumes on reconnect', async () => {
            // Given an invisible cached page while offline
            setHasRadio(false);
            await mount();
            // When recovery would require the network
            // Then it does not issue a request
            expect(olderSpy).not.toHaveBeenCalled();
            // When connectivity returns
            await update(() => setHasRadio(true));
            // Then the page is backfilled
            expect(olderSpy).toHaveBeenCalledTimes(1);
        });

        it('does not walk backward when the selected page has newer unloaded history', async () => {
            // Given an older selected window with gaps on both sides
            mockRouteParams.reportActionID = '4';
            await update(() =>
                Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${reportID}`, [
                    [CONST.PAGINATION_START_ID, '6', '6'],
                    ['4', '3'],
                    ['1', '1', CONST.PAGINATION_END_ID],
                ]),
            );
            // When that older window contains no visible rows
            await mount();
            // Then recovery does not page in the wrong direction through all earlier history
            expect(olderSpy).not.toHaveBeenCalled();
        });

        it('waits for the shared initial-report loading gate to clear', async () => {
            // Given the shared request tracker still reports a pending initial load
            const pending = jest.spyOn(InFlightRequests, 'useIsReportLoadPending').mockReturnValue(true);
            await update(() => Onyx.merge(loadingKey, {isLoadingInitialReportActions: true}));
            await mount();
            // When the initial load is still pending
            // Then recovery does not race it
            expect(olderSpy).not.toHaveBeenCalled();
            // When the tracker releases the gate and the deferred flag clears
            pending.mockReturnValue(false);
            await update(() => Onyx.merge(loadingKey, {isLoadingInitialReportActions: false}));
            // Then the still-empty page is eligible for backfill
            expect(olderSpy).toHaveBeenCalledTimes(1);
        });

        it('allows one retry after a failed cursor without spinning', async () => {
            // Given a cursor whose first recovery request failed
            await mount();
            // When its error is reported and later data causes another render
            await update(() => Onyx.merge(loadingKey, {hasLoadingOlderReportActionsError: true}));
            await update(() => Onyx.merge(reportKey, {reportName: 'Retry remains consumed'}));
            // Then only one retry was allowed for that cursor
            expect(olderSpy).toHaveBeenCalledTimes(2);
        });

        it('stops when the full cached history has no older page', async () => {
            // Given a complete history of invisible bookkeeping actions
            await update(async () => {
                await Onyx.merge(actionsKey, {
                    [created.reportActionID]: action('1', 1, {actionName: CONST.REPORT.ACTIONS.TYPE.QUEUED_FOR_EXPORT}),
                    [reply.reportActionID]: action('2', 2, {actionName: CONST.REPORT.ACTIONS.TYPE.QUEUED_FOR_EXPORT}),
                });
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${reportID}`, [[CONST.PAGINATION_START_ID, '6', '1', CONST.PAGINATION_END_ID]]);
            });
            // When no older page can provide visible rows
            await mount();
            // Then recovery does not keep requesting the end of history
            expect(olderSpy).not.toHaveBeenCalled();
        });
    });

    describe('subscription scope', () => {
        it('does not rerender the list for another report action or transaction update', async () => {
            // Given the selected report and already-loaded unrelated transaction data
            await seed();
            await update(() => Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}other`, {transactionID: 'other', reportID: '9', amount: 100, currency: 'USD', created: '2026-11-01'}));
            await mount();
            const renders = mockListRender.mock.calls.length;
            // When another report receives messages and updates its existing transaction
            await update(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}9`, {other: action('other', 3, {reportID: '9'})});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}other`, {amount: 200});
            });
            // Then per-report selectors leave the open list unchanged
            expect(mockListRender).toHaveBeenCalledTimes(renders);
        });

        it('reacts to this report while ignoring unused report metadata fields', async () => {
            // Given a settled list and its narrowed report metadata subscription
            await seed();
            await mount();
            const renders = mockListRender.mock.calls.length;
            const unusedMetadata = {origin: 'fixture', benchmarkMetadata: 'Unused by the list'};
            // When an unrelated field changes without changing selected metadata
            await update(() => Onyx.merge(metadataKey, unusedMetadata));
            // Then that write does not rerender the list
            expect(mockListRender).toHaveBeenCalledTimes(renders);
            // When its own report receives a message
            const newReply = action('3', 3);
            await update(() => Onyx.merge(actionsKey, {[newReply.reportActionID]: newReply}));
            // Then the list is not over-scoped and includes the new row
            expect(mockListRender.mock.calls.length).toBeGreaterThan(renders);
            expect(screen.getByTestId('action-3')).toBeTruthy();
        });

        it('distinguishes unloaded transactions from a loaded empty transaction index', async () => {
            // Given an expense action before transaction data is available
            const expense = action('2', 2, {
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                message: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: 'T1', text: 'Expense', html: '<p>Expense</p>'},
            });
            await seed([expense, created]);
            await update(() => Onyx.set(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS, null));
            await mount();
            expect(visibleIDs()).toContain('2');
            // When the transaction index loads with no matching expense
            await update(() => Onyx.set(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS, {}));
            // Then visibility does not incorrectly keep bypassing the transaction filter
            expect(visibleIDs()).not.toContain('2');
            // When its matching transaction arrives
            await update(() => Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}T1`, {transactionID: 'T1', reportID, amount: 100, currency: 'USD', created: '2026-11-01'}));
            // Then the expense becomes visible again
            expect(visibleIDs()).toContain('2');
        });
    });
});
