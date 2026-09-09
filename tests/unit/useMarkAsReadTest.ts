import {act, renderHook} from '@testing-library/react-native';

import useMarkAsRead from '@hooks/useMarkAsRead';

import type Navigation from '@libs/Navigation/Navigation';
import type * as ReportUtils from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import createRandomReportAction from '../utils/collections/reportActions';

const REPORT_ID = '1';

let mockIsUnread = true;
let mockIsVisible = true;
let mockHasFocus = true;
let mockIsFocused = true;
let mockReferrer: string | undefined;

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
    const actual = jest.requireActual<typeof ReportUtils>('@libs/ReportUtils');
    return {
        ...actual,
        isUnread: () => mockIsUnread,
    };
});

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

function renderMarkAsRead(params: Partial<Parameters<typeof useMarkAsRead>[0]> = {}) {
    return renderHook(() =>
        useMarkAsRead({
            reportID: REPORT_ID,
            report: REPORT as OnyxEntry<OnyxTypes.Report>,
            transactionThreadReport: undefined,
            sortedVisibleReportActions: [],
            isScrolledToEnd: true,
            hasNewerActions: false,
            ...params,
        }),
    );
}

describe('useMarkAsRead', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsUnread = true;
        mockIsVisible = true;
        mockHasFocus = true;
        mockIsFocused = true;
        mockReferrer = undefined;
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
});
