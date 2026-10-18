import {act, renderHook} from '@testing-library/react-native';

import {IsHiddenWideTabPreMountContext} from '@hooks/useIsHiddenWideTabPreMount';
import {IsInPreloadedTabContext} from '@hooks/useIsInPreloadedTab';
import useMarkAsRead, {resetMarkAsReadScopes} from '@hooks/useMarkAsRead';

import Log from '@libs/Log';
import type Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import createRandomReportAction from '../utils/collections/reportActions';

const REPORT_ID = '1';

let mockIsUnread = true;
let mockIsVisible = true;
let mockHasFocus = true;
let mockIsFocused = true;
let mockReferrer: string | undefined;
let mockIsInPreloadedTab = false;
let mockNotificationPreference: string = CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS;
let mockLHNUnreadState = 'unread';
const CURRENT_USER_ACCOUNT_ID = 123;

jest.mock('@libs/Visibility', () => ({
    __esModule: true,
    default: {
        isVisible: () => mockIsVisible,
        hasFocus: () => mockHasFocus,
        onVisibilityChange: () => () => {},
    },
}));

let mockTriggerAppFocus: (() => void) | undefined;
jest.mock('@hooks/useAppFocusEvent', () => ({
    __esModule: true,
    default: (callback: () => void) => {
        mockTriggerAppFocus = callback;
    },
}));

jest.mock('@libs/ReportUtils', () => {
    const actual = jest.requireActual<Record<string, unknown>>('@libs/ReportUtils');
    return {
        ...actual,
        isUnread: () => mockIsUnread,
        getReportNotificationPreference: () => mockNotificationPreference,
    };
});

jest.mock('@libs/SidebarUtils', () => ({
    getLHNUnreadState: () => mockLHNUnreadState,
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: CURRENT_USER_ACCOUNT_ID, login: 'test@example.com'}),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        setParams: jest.fn(),
    },
}));

jest.mock('@userActions/Report', () => ({
    readNewestAction: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => mockIsFocused,
        useRoute: () => ({params: {referrer: mockReferrer}}),
    };
});

const {readNewestAction} = jest.requireMock<{readNewestAction: jest.Mock}>('@userActions/Report');
const NavigationMock = jest.requireMock<{default: {setParams: jest.Mock}}>('@libs/Navigation/Navigation').default;

const REPORT = {
    reportID: REPORT_ID,
    lastReadTime: '2023-01-01 10:00:00.000',
    lastVisibleActionCreated: '2023-01-01 11:00:00.000',
} as OnyxTypes.Report;

/** Renders with the preloaded-tab flag the Reports tab provides while it is warmed but not yet opened. */
function PreloadedTabWrapper({children}: {children: React.ReactNode}) {
    return React.createElement(IsInPreloadedTabContext.Provider, {value: mockIsInPreloadedTab}, children);
}

/** Renders with the hidden flag a wide submit pre-mount gets until its reveal, read again on every render. */
function createHiddenPreMountWrapper(getIsHiddenPreMount: () => boolean) {
    return ({children}: {children: React.ReactNode}) => React.createElement(IsHiddenWideTabPreMountContext.Provider, {value: getIsHiddenPreMount()}, children);
}

function renderMarkAsRead(params: Partial<Parameters<typeof useMarkAsRead>[0]> = {}, wrapper: React.ComponentType<{children: React.ReactNode}> = PreloadedTabWrapper) {
    return renderHook(
        (props?: {report: OnyxTypes.Report}) =>
            useMarkAsRead({
                reportID: REPORT_ID,
                report: REPORT as OnyxEntry<OnyxTypes.Report>,
                transactionThreadReport: undefined,
                sortedVisibleReportActions: [],
                isScrolledToEnd: true,
                hasNewerActions: false,
                ...params,
                ...props,
            }),
        {wrapper},
    );
}

describe('useMarkAsRead', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetMarkAsReadScopes();
        mockIsUnread = true;
        mockIsVisible = true;
        mockHasFocus = true;
        mockIsFocused = true;
        mockReferrer = undefined;
        mockIsInPreloadedTab = false;
        mockNotificationPreference = CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS;
        mockLHNUnreadState = 'unread';
    });

    it('holds the mark-as-read while the Inbox tab is preloaded, and marks read once the tab opens', () => {
        mockIsInPreloadedTab = true;
        const {rerender} = renderMarkAsRead({isScrolledToEnd: true});

        expect(readNewestAction).not.toHaveBeenCalled();

        // The user taps Inbox, which drops the preloaded flag in the same commit that focuses the tab.
        mockIsInPreloadedTab = false;
        rerender(undefined);

        expect(readNewestAction).toHaveBeenCalledWith(REPORT_ID, false);
    });

    it('holds the report-change mark-as-read while the Inbox tab is preloaded', () => {
        const readReport = {reportID: REPORT_ID, lastReadTime: '2023-01-01 10:00:00.000', lastVisibleActionCreated: '2023-01-01 10:00:00.000'} as OnyxTypes.Report;
        const reportWithNewMessage = {...readReport, lastVisibleActionCreated: '2023-01-01 11:00:00.000'} as OnyxTypes.Report;
        const incomingAction: OnyxTypes.ReportAction = {...createRandomReportAction(2), created: '2023-01-01 11:00:00.000', actorAccountID: 2};

        mockIsUnread = false;
        mockIsInPreloadedTab = true;
        const {rerender} = renderHook(
            (props: {report: OnyxTypes.Report; actions: OnyxTypes.ReportAction[]}) =>
                useMarkAsRead({
                    reportID: REPORT_ID,
                    report: props.report as OnyxEntry<OnyxTypes.Report>,
                    transactionThreadReport: undefined,
                    sortedVisibleReportActions: props.actions,
                    isScrolledToEnd: true,
                    hasNewerActions: false,
                }),
            {
                initialProps: {report: readReport, actions: [] as OnyxTypes.ReportAction[]},
                wrapper: PreloadedTabWrapper,
            },
        );
        readNewestAction.mockClear();

        // A message lands while the tab is still unopened. Cached actions make isReportActionsLoaded true, so
        // without the hold the report-change path would mark the unseen report read.
        mockIsUnread = true;
        rerender({report: reportWithNewMessage, actions: [incomingAction]});

        expect(readNewestAction).not.toHaveBeenCalled();
    });

    // The notification referrer is only cleared by the report-change path, so it proves that specific pass
    // re-runs on open rather than the initial mark-as-read covering for it.
    it('runs the held report-change pass once the Inbox tab opens', () => {
        const readReport = {reportID: REPORT_ID, lastReadTime: '2023-01-01 10:00:00.000', lastVisibleActionCreated: '2023-01-01 10:00:00.000'} as OnyxTypes.Report;
        const reportWithNewMessage = {...readReport, lastVisibleActionCreated: '2023-01-01 11:00:00.000'} as OnyxTypes.Report;
        const incomingAction: OnyxTypes.ReportAction = {...createRandomReportAction(2), created: '2023-01-01 11:00:00.000', actorAccountID: 2};

        mockIsUnread = false;
        mockIsInPreloadedTab = true;
        mockReferrer = CONST.REFERRER.NOTIFICATION;
        const {rerender} = renderHook(
            (props: {report: OnyxTypes.Report; actions: OnyxTypes.ReportAction[]}) =>
                useMarkAsRead({
                    reportID: REPORT_ID,
                    report: props.report as OnyxEntry<OnyxTypes.Report>,
                    transactionThreadReport: undefined,
                    sortedVisibleReportActions: props.actions,
                    isScrolledToEnd: true,
                    hasNewerActions: false,
                }),
            {
                initialProps: {report: readReport, actions: [] as OnyxTypes.ReportAction[]},
                wrapper: PreloadedTabWrapper,
            },
        );

        mockIsUnread = true;
        rerender({report: reportWithNewMessage, actions: [incomingAction]});
        expect(NavigationMock.setParams).not.toHaveBeenCalled();

        // The user opens the tab, which drops the preloaded flag.
        mockIsInPreloadedTab = false;
        rerender({report: reportWithNewMessage, actions: [incomingAction]});

        expect(NavigationMock.setParams).toHaveBeenCalledWith({referrer: undefined});
    });

    it('marks the report as read on mount when it is unread, visible, and scrolled to the end', () => {
        renderMarkAsRead({isScrolledToEnd: true});

        expect(readNewestAction).toHaveBeenCalledWith(REPORT_ID, false);
    });

    it('does not mark the report as read when it is already read', () => {
        mockIsUnread = false;
        renderMarkAsRead();

        expect(readNewestAction).not.toHaveBeenCalled();
    });

    it('completes a skipped mark-as-read on demand when the report is unread but the list is not scrolled to the end', () => {
        const {result} = renderMarkAsRead({isScrolledToEnd: false});
        readNewestAction.mockClear();

        act(() => result.current.completeSkippedMarkAsRead());

        expect(readNewestAction).toHaveBeenCalledWith(REPORT_ID, true);
    });

    it('does not complete a mark-as-read when none was skipped', () => {
        const {result} = renderMarkAsRead({isScrolledToEnd: true});
        readNewestAction.mockClear();

        act(() => result.current.completeSkippedMarkAsRead());

        expect(readNewestAction).not.toHaveBeenCalled();
    });

    it('marks read from a notification even when the app is not visible, and clears the referrer param', () => {
        mockIsVisible = false;
        mockReferrer = CONST.REFERRER.NOTIFICATION;

        renderMarkAsRead({isScrolledToEnd: true});

        expect(readNewestAction).toHaveBeenCalledWith(REPORT_ID, false);
        expect(NavigationMock.setParams).toHaveBeenCalledWith({referrer: undefined});
    });

    it('does not mark the report as read on report change when the app is visible but unfocused', () => {
        mockHasFocus = false;

        renderMarkAsRead({isScrolledToEnd: true});

        expect(readNewestAction).toHaveBeenCalledTimes(1);
        expect(readNewestAction).toHaveBeenCalledWith(REPORT_ID, false);
    });

    it('marks the report as read when the window regains focus after a message arrived while it was unfocused', () => {
        const readReport = {reportID: REPORT_ID, lastReadTime: '2023-01-01 10:00:00.000', lastVisibleActionCreated: '2023-01-01 10:00:00.000'} as OnyxTypes.Report;
        const reportWithNewMessage = {...readReport, lastVisibleActionCreated: '2023-01-01 11:00:00.000'} as OnyxTypes.Report;
        const incomingAction: OnyxTypes.ReportAction = {...createRandomReportAction(2), created: '2023-01-01 11:00:00.000', actorAccountID: 2};

        // The user is viewing the newest message of an already read report.
        mockIsUnread = false;
        const {rerender} = renderHook(
            (props: {report: OnyxTypes.Report; actions: OnyxTypes.ReportAction[]}) =>
                useMarkAsRead({
                    reportID: REPORT_ID,
                    report: props.report as OnyxEntry<OnyxTypes.Report>,
                    transactionThreadReport: undefined,
                    sortedVisibleReportActions: props.actions,
                    isScrolledToEnd: true,
                    hasNewerActions: false,
                }),
            {initialProps: {report: readReport, actions: [] as OnyxTypes.ReportAction[]}},
        );
        readNewestAction.mockClear();

        // The user clicks into another desktop app, so the still-visible window loses focus without a visibility change.
        mockHasFocus = false;

        // A message from somebody else arrives while the window is unfocused, so the mark-as-read is skipped.
        mockIsUnread = true;
        rerender({report: reportWithNewMessage, actions: [incomingAction]});
        expect(readNewestAction).not.toHaveBeenCalled();

        // The user clicks back into the window, which regains focus without any visibility change.
        mockHasFocus = true;
        act(() => mockTriggerAppFocus?.());

        expect(readNewestAction).toHaveBeenCalledWith(REPORT_ID, true);
    });

    it('should not mark the report as read on report change when the screen is unfocused and focus is required', () => {
        const readReport = {reportID: REPORT_ID, lastReadTime: '2023-01-01 10:00:00.000', lastVisibleActionCreated: '2023-01-01 10:00:00.000'} as OnyxTypes.Report;
        const reportWithNewMessage = {...readReport, lastVisibleActionCreated: '2023-01-01 11:00:00.000'} as OnyxTypes.Report;
        const incomingAction: OnyxTypes.ReportAction = {...createRandomReportAction(2), created: '2023-01-01 11:00:00.000', actorAccountID: 2};

        // The list stays mounted behind a details screen or modal, so the window keeps focus while the screen loses it.
        mockIsUnread = false;
        mockIsFocused = false;
        const {rerender} = renderHook(
            (props: {report: OnyxTypes.Report; actions: OnyxTypes.ReportAction[]}) =>
                useMarkAsRead({
                    reportID: REPORT_ID,
                    report: props.report as OnyxEntry<OnyxTypes.Report>,
                    transactionThreadReport: undefined,
                    sortedVisibleReportActions: props.actions,
                    isScrolledToEnd: true,
                    hasNewerActions: false,
                    scopeKey: 'unfocusedScreen',
                    shouldRequireScreenFocus: true,
                }),
            {initialProps: {report: readReport, actions: [] as OnyxTypes.ReportAction[]}},
        );
        readNewestAction.mockClear();

        mockIsUnread = true;
        rerender({report: reportWithNewMessage, actions: [incomingAction]});

        expect(readNewestAction).not.toHaveBeenCalled();
    });

    it('does not mark the report as read when the window regains focus while newer actions are still unloaded', () => {
        const readReport = {reportID: REPORT_ID, lastReadTime: '2023-01-01 10:00:00.000', lastVisibleActionCreated: '2023-01-01 10:00:00.000'} as OnyxTypes.Report;
        const reportWithNewMessage = {...readReport, lastVisibleActionCreated: '2023-01-01 11:00:00.000'} as OnyxTypes.Report;
        const incomingAction: OnyxTypes.ReportAction = {...createRandomReportAction(2), created: '2023-01-01 11:00:00.000', actorAccountID: 2};

        // The user is at the end of an older paginated slice, so newer actions exist but are not loaded yet.
        mockIsUnread = false;
        const {rerender} = renderHook(
            (props: {report: OnyxTypes.Report; actions: OnyxTypes.ReportAction[]}) =>
                useMarkAsRead({
                    reportID: REPORT_ID,
                    report: props.report as OnyxEntry<OnyxTypes.Report>,
                    transactionThreadReport: undefined,
                    sortedVisibleReportActions: props.actions,
                    isScrolledToEnd: true,
                    hasNewerActions: true,
                }),
            {initialProps: {report: readReport, actions: [] as OnyxTypes.ReportAction[]}},
        );
        readNewestAction.mockClear();

        mockHasFocus = false;
        mockIsUnread = true;
        rerender({report: reportWithNewMessage, actions: [incomingAction]});

        // Regaining focus must not consume the unread state of the newer actions the user has never seen.
        mockHasFocus = true;
        act(() => mockTriggerAppFocus?.());

        expect(readNewestAction).not.toHaveBeenCalled();
    });

    it('should not mark the report as read on mount when newer actions are still unloaded', () => {
        renderMarkAsRead({hasNewerActions: true});

        expect(readNewestAction).not.toHaveBeenCalled();
    });

    it('should not mark the report as read on mount when the list is not scrolled to the end', () => {
        renderMarkAsRead({isScrolledToEnd: false});

        expect(readNewestAction).not.toHaveBeenCalled();
    });

    it('should not mark the report as read on report change when the list is not scrolled to the end', () => {
        const readReport = {reportID: REPORT_ID, lastReadTime: '2023-01-01 10:00:00.000', lastVisibleActionCreated: '2023-01-01 10:00:00.000'} as OnyxTypes.Report;
        const reportWithNewMessage = {...readReport, lastVisibleActionCreated: '2023-01-01 11:00:00.000'} as OnyxTypes.Report;
        const incomingAction: OnyxTypes.ReportAction = {...createRandomReportAction(2), created: '2023-01-01 11:00:00.000', actorAccountID: 2};

        mockIsUnread = false;
        const {rerender} = renderHook(
            (props: {report: OnyxTypes.Report; actions: OnyxTypes.ReportAction[]}) =>
                useMarkAsRead({
                    reportID: REPORT_ID,
                    report: props.report as OnyxEntry<OnyxTypes.Report>,
                    transactionThreadReport: undefined,
                    sortedVisibleReportActions: props.actions,
                    isScrolledToEnd: false,
                    hasNewerActions: false,
                    scopeKey: 'notScrolledToEnd',
                }),
            {initialProps: {report: readReport, actions: [] as OnyxTypes.ReportAction[]}},
        );
        readNewestAction.mockClear();

        mockIsUnread = true;
        rerender({report: reportWithNewMessage, actions: [incomingAction]});

        expect(readNewestAction).not.toHaveBeenCalled();
    });

    it('should mark the report as read on focus return when the unread action is only in the full action chain', () => {
        const readReport = {reportID: REPORT_ID, lastReadTime: '2023-01-01 10:00:00.000', lastVisibleActionCreated: '2023-01-01 10:00:00.000'} as OnyxTypes.Report;
        const reportWithNewMessage = {...readReport, lastVisibleActionCreated: '2023-01-01 11:00:00.000'} as OnyxTypes.Report;
        const incomingAction: OnyxTypes.ReportAction = {...createRandomReportAction(2), created: '2023-01-01 11:00:00.000', actorAccountID: 2};

        mockIsUnread = false;
        const {rerender} = renderHook(
            (props: {report: OnyxTypes.Report; actions: OnyxTypes.ReportAction[]}) =>
                useMarkAsRead({
                    reportID: REPORT_ID,
                    report: props.report as OnyxEntry<OnyxTypes.Report>,
                    transactionThreadReport: undefined,
                    sortedVisibleReportActions: [],
                    sortedReportActions: props.actions,
                    isScrolledToEnd: true,
                    hasNewerActions: false,
                    scopeKey: 'fullChainScan',
                }),
            {initialProps: {report: readReport, actions: [] as OnyxTypes.ReportAction[]}},
        );
        readNewestAction.mockClear();

        mockHasFocus = false;
        mockIsUnread = true;
        rerender({report: reportWithNewMessage, actions: [incomingAction]});

        mockHasFocus = true;
        act(() => mockTriggerAppFocus?.());

        expect(readNewestAction).toHaveBeenCalledWith(REPORT_ID, true);
    });

    it('should keep tracking its own report when another surface mounts a different report under a different scope', () => {
        const reportA = {reportID: 'A', lastReadTime: '2023-01-01 10:00:00.000', lastVisibleActionCreated: '2023-01-01 10:00:00.000'} as OnyxTypes.Report;
        const reportAWithNewMessage = {...reportA, lastVisibleActionCreated: '2023-01-01 11:00:00.000'} as OnyxTypes.Report;
        const reportB = {reportID: 'B', lastReadTime: '2023-01-01 10:00:00.000', lastVisibleActionCreated: '2023-01-01 10:00:00.000'} as OnyxTypes.Report;

        mockIsUnread = false;
        const {rerender} = renderHook(
            (props: {report: OnyxTypes.Report}) =>
                useMarkAsRead({
                    reportID: 'A',
                    report: props.report as OnyxEntry<OnyxTypes.Report>,
                    transactionThreadReport: undefined,
                    sortedVisibleReportActions: [],
                    isScrolledToEnd: true,
                    hasNewerActions: false,
                    scopeKey: 'chat',
                }),
            {initialProps: {report: reportA}},
        );

        renderHook(() =>
            useMarkAsRead({
                reportID: 'B',
                report: reportB as OnyxEntry<OnyxTypes.Report>,
                transactionThreadReport: undefined,
                sortedVisibleReportActions: [],
                isScrolledToEnd: true,
                hasNewerActions: false,
                scopeKey: 'moneyRequestReport',
            }),
        );
        readNewestAction.mockClear();

        mockIsUnread = true;
        rerender({report: reportAWithNewMessage});

        expect(readNewestAction).toHaveBeenCalledWith('A', expect.anything());
    });

    it('should resume tracking its own report after a concurrent list sharing its scope unmounts', () => {
        const reportA = {reportID: 'A', lastReadTime: '2023-01-01 10:00:00.000', lastVisibleActionCreated: '2023-01-01 10:00:00.000'} as OnyxTypes.Report;
        const reportAWithNewMessage = {...reportA, lastVisibleActionCreated: '2023-01-01 11:00:00.000'} as OnyxTypes.Report;
        const reportB = {reportID: 'B', lastReadTime: '2023-01-01 10:00:00.000', lastVisibleActionCreated: '2023-01-01 10:00:00.000'} as OnyxTypes.Report;

        mockIsUnread = false;
        const {rerender} = renderHook(
            (props: {report: OnyxTypes.Report}) =>
                useMarkAsRead({
                    reportID: 'A',
                    report: props.report as OnyxEntry<OnyxTypes.Report>,
                    transactionThreadReport: undefined,
                    sortedVisibleReportActions: [],
                    isScrolledToEnd: true,
                    hasNewerActions: false,
                    scopeKey: 'sharedScope',
                }),
            {initialProps: {report: reportA}},
        );

        // A second list of the same kind (e.g. the RHP over the central pane) takes over the scope, then closes.
        const rhpList = renderHook(() =>
            useMarkAsRead({
                reportID: 'B',
                report: reportB as OnyxEntry<OnyxTypes.Report>,
                transactionThreadReport: undefined,
                sortedVisibleReportActions: [],
                isScrolledToEnd: true,
                hasNewerActions: false,
                scopeKey: 'sharedScope',
            }),
        );
        rhpList.unmount();
        readNewestAction.mockClear();

        mockIsUnread = true;
        rerender({report: reportAWithNewMessage});

        expect(readNewestAction).toHaveBeenCalledWith('A', expect.anything());
    });

    it('should keep marking the visible report read while a hidden pre-mount of another report shares its scope', () => {
        // Given a visible report A and a hidden wide pre-mount of report B mounted later in the same scope
        const reportA = {reportID: 'A', lastReadTime: '2023-01-01 10:00:00.000', lastVisibleActionCreated: '2023-01-01 10:00:00.000'} as OnyxTypes.Report;
        const reportAWithNewMessage = {...reportA, lastVisibleActionCreated: '2023-01-01 11:00:00.000'} as OnyxTypes.Report;
        const reportB = {reportID: 'B', lastReadTime: '2023-01-01 10:00:00.000', lastVisibleActionCreated: '2023-01-01 10:00:00.000'} as OnyxTypes.Report;

        mockIsUnread = false;
        const {rerender} = renderMarkAsRead({reportID: 'A', report: reportA});
        renderMarkAsRead(
            {reportID: 'B', report: reportB},
            createHiddenPreMountWrapper(() => true),
        );
        readNewestAction.mockClear();

        // When a new message lands in the visible report A
        mockIsUnread = true;
        rerender({report: reportAWithNewMessage});

        // Then A is still marked read, because the hidden pre-mount did not take the scope over
        expect(readNewestAction).toHaveBeenCalledWith('A', expect.anything());
    });

    it('should take the scope and mark the report read once a hidden pre-mount is revealed', () => {
        // Given a visible report A and an unread hidden wide pre-mount of report B in the same scope
        const reportA = {reportID: 'A', lastReadTime: '2023-01-01 10:00:00.000', lastVisibleActionCreated: '2023-01-01 10:00:00.000'} as OnyxTypes.Report;
        const reportAWithNewMessage = {...reportA, lastVisibleActionCreated: '2023-01-01 11:00:00.000'} as OnyxTypes.Report;
        const reportB = {reportID: 'B', lastReadTime: '2023-01-01 10:00:00.000', lastVisibleActionCreated: '2023-01-01 11:00:00.000'} as OnyxTypes.Report;
        let isHiddenPreMount = true;

        mockIsUnread = false;
        const {rerender: rerenderA} = renderMarkAsRead({reportID: 'A', report: reportA});
        mockIsUnread = true;
        const {rerender: rerenderB} = renderMarkAsRead(
            {reportID: 'B', report: reportB},
            createHiddenPreMountWrapper(() => isHiddenPreMount),
        );
        expect(readNewestAction).not.toHaveBeenCalledWith('B', expect.anything());

        // When the submit reveals B (the wrapper reads isHiddenPreMount again on rerenderB)
        isHiddenPreMount = false;
        rerenderB(undefined);

        // Then B is marked read, as on a regular open, because the user now sees it
        expect(readNewestAction).toHaveBeenCalledWith('B', expect.anything());

        // And B owns the scope, so a new message in the covered report A is not marked read
        readNewestAction.mockClear();
        rerenderA({report: reportAWithNewMessage});
        expect(readNewestAction).not.toHaveBeenCalledWith('A', expect.anything());
    });

    describe('LHN unread telemetry', () => {
        const unreadChat = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.CHAT,
            lastReadTime: '2023-01-01 10:00:00.000',
            lastVisibleActionCreated: '2023-01-01 11:00:00.000',
            lastActorAccountID: 999,
            lastMessageText: 'hello',
        } as OnyxTypes.Report;

        let logInfoSpy: jest.SpyInstance;

        beforeEach(() => {
            logInfoSpy = jest.spyOn(Log, 'info').mockImplementation(() => {});
        });

        afterEach(() => {
            logInfoSpy.mockRestore();
        });

        it('logs when an unread chat is opened that the LHN did not show as unread', () => {
            // Given the LHN did not list the chat before it was opened
            mockLHNUnreadState = 'notListed';

            // When the chat is opened
            renderMarkAsRead({report: unreadChat});

            // Then the mismatch is logged with the fields needed to tell a stale LHN from a race
            expect(logInfoSpy).toHaveBeenCalledWith(
                '[LHNUnread] Opened unread report that LHN did not show as unread',
                false,
                expect.objectContaining({
                    reportID: REPORT_ID,
                    lhnUnreadState: 'notListed',
                    hasLastMessageText: true,
                    lastVisibleActionCreated: unreadChat.lastVisibleActionCreated,
                    lastReadTime: unreadChat.lastReadTime,
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                }),
            );
        });

        it('does not log when the LHN showed the chat as unread', () => {
            // Given the LHN listed the chat as unread
            mockLHNUnreadState = 'unread';

            // When the chat is opened
            renderMarkAsRead({report: unreadChat});

            // Then nothing is logged
            expect(logInfoSpy).not.toHaveBeenCalled();
        });

        it('does not log for muted chats, own messages, or preloaded tabs', () => {
            mockLHNUnreadState = 'notListed';

            // Given a muted chat, when it is opened, then nothing is logged
            mockNotificationPreference = CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE;
            renderMarkAsRead({report: unreadChat});
            expect(logInfoSpy).not.toHaveBeenCalled();
            mockNotificationPreference = CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS;

            // Given the last message is the current user's own, when it is opened, then nothing is logged
            renderMarkAsRead({report: {...unreadChat, lastActorAccountID: CURRENT_USER_ACCOUNT_ID} as OnyxTypes.Report});
            expect(logInfoSpy).not.toHaveBeenCalled();

            // Given the chat is mounted in a preloaded tab, when it mounts, then nothing is logged
            mockIsInPreloadedTab = true;
            renderMarkAsRead({report: unreadChat});
            expect(logInfoSpy).not.toHaveBeenCalled();
        });

        it('logs on reveal of a hidden wide pre-mount, not while it is hidden', () => {
            // Given an unread chat the LHN did not list, mounted hidden as a wide submit pre-mount
            mockLHNUnreadState = 'notListed';
            let isHiddenPreMount = true;
            const {rerender} = renderMarkAsRead(
                {report: unreadChat},
                createHiddenPreMountWrapper(() => isHiddenPreMount),
            );

            // Then nothing is logged while the user cannot see it
            expect(logInfoSpy).not.toHaveBeenCalled();

            // When the submit reveals it
            isHiddenPreMount = false;
            rerender(undefined);

            // Then the mismatch is logged once, as on a regular open
            expect(logInfoSpy).toHaveBeenCalledTimes(1);
            expect(logInfoSpy).toHaveBeenCalledWith('[LHNUnread] Opened unread report that LHN did not show as unread', false, expect.objectContaining({reportID: REPORT_ID}));
        });
    });
});
