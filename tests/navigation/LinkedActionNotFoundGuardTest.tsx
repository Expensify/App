/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
import {act, render, screen} from '@testing-library/react-native';

import CONST from '@src/CONST';
import LinkedActionNotFoundGuard from '@src/pages/inbox/LinkedActionNotFoundGuard';
import type {ReportAction} from '@src/types/onyx';

import React, {useEffect, useLayoutEffect} from 'react';
import {View} from 'react-native';

const REPORT_ID = '12345';
const REPORT_ACTION_ID = '67890';
const ROUTE_KEY = 'test-route-key';
const NAVIGATOR_KEY = 'test-navigator-key';

const mockSetParams = jest.fn();
const mockCleanStaleBackToParam = jest.fn();
const mockIsNavigationReady = jest.fn(() => Promise.resolve());
const mockChildrenMount = jest.fn();
const mockChildrenUnmount = jest.fn();

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        setParams: (...args: unknown[]) => mockSetParams(...args),
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: () => mockIsNavigationReady(),
    },
}));

jest.mock('@src/pages/inbox/cleanStaleReportActionBackToParam', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockCleanStaleBackToParam(...args),
}));

const mockRouteParams: {reportID?: string; reportActionID?: string} = {
    reportID: REPORT_ID,
    reportActionID: REPORT_ACTION_ID,
};

jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual('@react-navigation/native');
    return {
        ...actual,
        useRoute: () => ({
            key: ROUTE_KEY,
            name: 'Report',
            params: {...mockRouteParams},
        }),
        useNavigation: () => ({
            getState: () => ({key: NAVIGATOR_KEY}),
        }),
    };
});

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 1}),
}));

jest.mock('@hooks/useReportIsArchived', () => ({
    __esModule: true,
    default: () => false,
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: false}),
}));

let mockIsReportActionVisible = true;

// The gate only re-renders when its Onyx subscriptions change, so the useOnyx mock notifies subscribers like Onyx does.
// Each update also replaces DERIVED.VISIBLE_REPORT_ACTIONS, which visibility is derived from.
const mockOnyxListeners = new Set<() => void>();
let mockOnyxVersion = 0;
let mockVisibleReportActions: Record<string, unknown> = {};

function updateOnyx(update: () => void) {
    act(() => {
        update();
        mockOnyxVersion++;
        mockVisibleReportActions = {};
        for (const listener of mockOnyxListeners) {
            listener();
        }
    });
}

jest.mock('@libs/ReportActionsUtils', () => ({
    __esModule: true,
    isReportActionVisible: () => mockIsReportActionVisible,
    isWhisperAction: () => false,
}));

jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual('@libs/ReportUtils'),
    canUserPerformWriteAction: () => true,
}));

// Mock useOnyx to control linked action, report, metadata, and derived values
type UseOnyxReturn = [unknown, {status: string}];
let mockLinkedAction: ReportAction | null | undefined;
let mockIsLoadingInitialReportActions: boolean;

jest.mock('@hooks/useOnyx', () => {
    const {useSyncExternalStore} = jest.requireActual<{useSyncExternalStore: (subscribe: (listener: () => void) => () => void, getSnapshot: () => number) => number}>('react');
    const subscribe = (listener: () => void) => {
        mockOnyxListeners.add(listener);
        return () => {
            mockOnyxListeners.delete(listener);
        };
    };
    const getVersion = () => mockOnyxVersion;

    function useOnyxMock(key: string): UseOnyxReturn {
        useSyncExternalStore(subscribe, getVersion);
        if (key.startsWith('reportActions_')) {
            return [mockLinkedAction, {status: 'loaded'}];
        }
        if (key.startsWith('reportLoadingState_')) {
            return [mockIsLoadingInitialReportActions, {status: 'loaded'}];
        }
        if (key.startsWith('report_')) {
            return [{reportID: '12345', type: 'chat'}, {status: 'loaded'}];
        }
        // DERIVED.VISIBLE_REPORT_ACTIONS
        return [mockVisibleReportActions, {status: 'loaded'}];
    }

    return {
        __esModule: true,
        default: useOnyxMock,
    };
});

function createReportAction(overrides: Partial<ReportAction> = {}): ReportAction {
    return {
        reportActionID: REPORT_ACTION_ID,
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        reportID: REPORT_ID,
        actorAccountID: 1,
        created: '2024-01-01 00:00:00',
        message: [{text: 'test', type: 'TEXT', html: 'test'}],
        ...overrides,
    } as ReportAction;
}

function TestChildren() {
    React.useEffect(() => {
        mockChildrenMount();
        return () => mockChildrenUnmount();
    }, []);
    return <View testID="test-children" />;
}

const mockChildMount = jest.fn();
const mockChildUnmount = jest.fn();
const effectLog: string[] = [];

function MountTrackingChildren() {
    useLayoutEffect(() => {
        effectLog.push('child-layout-effect');
    }, []);

    useEffect(() => {
        mockChildMount();
        return () => mockChildUnmount();
    }, []);

    return <View testID="test-children" />;
}

describe('LinkedActionNotFoundGuard', () => {
    beforeEach(() => {
        mockSetParams.mockReset();
        mockCleanStaleBackToParam.mockClear();
        mockIsNavigationReady.mockClear();
        mockChildrenMount.mockClear();
        mockChildrenUnmount.mockClear();
        mockRouteParams.reportID = REPORT_ID;
        mockRouteParams.reportActionID = REPORT_ACTION_ID;
        mockLinkedAction = createReportAction();
        mockIsLoadingInitialReportActions = false;
        mockIsReportActionVisible = true;
    });

    it('preserves the report content when a link is cleared or a different link is opened', () => {
        // Given a linked report has mounted its list and composer.
        const view = render(
            <LinkedActionNotFoundGuard>
                <TestChildren />
            </LinkedActionNotFoundGuard>,
        );

        // When sending clears the link, and the reader subsequently opens another link.
        for (const reportActionID of ['', 'another-action', undefined, REPORT_ACTION_ID]) {
            mockRouteParams.reportActionID = reportActionID;
            view.rerender(
                <LinkedActionNotFoundGuard>
                    <TestChildren />
                </LinkedActionNotFoundGuard>,
            );

            // Then the report keeps its mounted list, editor, and keyboard state.
            expect(mockChildrenMount).toHaveBeenCalledTimes(1);
            expect(mockChildrenUnmount).not.toHaveBeenCalled();
        }
    });

    it('renders children when linked action exists', () => {
        render(
            <LinkedActionNotFoundGuard>
                <TestChildren />
            </LinkedActionNotFoundGuard>,
        );

        expect(screen.getByTestId('test-children')).toBeTruthy();
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('renders children and clears reportActionID once when the linked action is already deleted on mount', () => {
        mockIsReportActionVisible = false;

        render(
            <LinkedActionNotFoundGuard>
                <TestChildren />
            </LinkedActionNotFoundGuard>,
        );

        expect(screen.getByTestId('test-children')).toBeTruthy();
        expect(mockSetParams).toHaveBeenCalledTimes(1);
        expect(mockSetParams).toHaveBeenCalledWith({reportActionID: undefined}, ROUTE_KEY, NAVIGATOR_KEY);
    });

    it('clears reportActionID when the linked action is deleted while being viewed', () => {
        render(
            <LinkedActionNotFoundGuard>
                <TestChildren />
            </LinkedActionNotFoundGuard>,
        );

        expect(mockSetParams).not.toHaveBeenCalled();

        updateOnyx(() => {
            mockIsReportActionVisible = false;
        });

        expect(screen.getByTestId('test-children')).toBeTruthy();
        expect(mockSetParams).toHaveBeenCalledWith({reportActionID: undefined}, ROUTE_KEY, NAVIGATOR_KEY);
        expect(mockCleanStaleBackToParam).toHaveBeenCalledWith(REPORT_ID, REPORT_ACTION_ID);
    });

    it('clears reportActionID when linked action is completely removed from Onyx', () => {
        // Start with action present
        render(
            <LinkedActionNotFoundGuard>
                <TestChildren />
            </LinkedActionNotFoundGuard>,
        );

        expect(mockSetParams).not.toHaveBeenCalled();

        // Now remove the action (simulating REPORT_PREVIEW being nulled when moving IOU to workspace)
        updateOnyx(() => {
            mockLinkedAction = null;
        });

        // The cleanup effect should clear reportActionID with the route key
        expect(mockSetParams).toHaveBeenCalledWith({reportActionID: undefined}, ROUTE_KEY, NAVIGATOR_KEY);
        expect(mockCleanStaleBackToParam).toHaveBeenCalledWith(REPORT_ID, REPORT_ACTION_ID);
    });

    it('does not navigate away when action disappears but was never visible', () => {
        // Action was never visible (null from the start)
        mockLinkedAction = null;
        mockIsLoadingInitialReportActions = false;

        render(
            <LinkedActionNotFoundGuard>
                <TestChildren />
            </LinkedActionNotFoundGuard>,
        );

        // wasEverVisible is false, so the cleanup effect should NOT fire
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('passes route.key to setParams for proper targeting inside split navigators', () => {
        render(
            <LinkedActionNotFoundGuard>
                <TestChildren />
            </LinkedActionNotFoundGuard>,
        );

        // Remove the action
        updateOnyx(() => {
            mockLinkedAction = null;
        });

        expect(mockSetParams).toHaveBeenCalledTimes(1);
        // Verify route.key is the second argument (needed for split navigator targeting)
        expect(mockSetParams).toHaveBeenCalledWith({reportActionID: undefined}, ROUTE_KEY, NAVIGATOR_KEY);
    });

    it('renders children without guard when no reportActionID in route', () => {
        mockRouteParams.reportActionID = undefined;

        render(
            <LinkedActionNotFoundGuard>
                <TestChildren />
            </LinkedActionNotFoundGuard>,
        );

        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('does not clear params while still loading report actions', () => {
        // Action is present initially
        render(
            <LinkedActionNotFoundGuard>
                <TestChildren />
            </LinkedActionNotFoundGuard>,
        );

        // Action disappears but loading is still in progress
        updateOnyx(() => {
            mockLinkedAction = null;
            mockIsLoadingInitialReportActions = true;
        });

        // Should not navigate away while loading — the action might come back
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    describe('keeps the report subtree mounted', () => {
        beforeEach(() => {
            mockChildMount.mockClear();
            mockChildUnmount.mockClear();
            effectLog.length = 0;
        });

        it('does not remount children when the linked action param is cleared', () => {
            // Given a report opened at a linked action, e.g. the unapproved expense the inbox scrolls to
            const {rerender} = render(
                <LinkedActionNotFoundGuard>
                    <MountTrackingChildren />
                </LinkedActionNotFoundGuard>,
            );
            expect(mockChildMount).toHaveBeenCalledTimes(1);

            // When the live-tail jump after sending a message clears the param to an empty string
            mockRouteParams.reportActionID = '';
            rerender(
                <LinkedActionNotFoundGuard>
                    <MountTrackingChildren />
                </LinkedActionNotFoundGuard>,
            );

            // Then the header, list and composer under the guard keep their state, so the composer is not reseeded with a stale draft
            expect(mockChildUnmount).not.toHaveBeenCalled();
            expect(mockChildMount).toHaveBeenCalledTimes(1);
        });

        it('does not remount children when a linked action param is added', () => {
            // Given a report opened without a linked action
            mockRouteParams.reportActionID = undefined;
            const {rerender} = render(
                <LinkedActionNotFoundGuard>
                    <MountTrackingChildren />
                </LinkedActionNotFoundGuard>,
            );

            // When the user follows a link to an action in the same report
            mockRouteParams.reportActionID = REPORT_ACTION_ID;
            rerender(
                <LinkedActionNotFoundGuard>
                    <MountTrackingChildren />
                </LinkedActionNotFoundGuard>,
            );

            // Then the existing subtree stays mounted
            expect(mockChildUnmount).not.toHaveBeenCalled();
            expect(mockChildMount).toHaveBeenCalledTimes(1);
        });

        it('resets the gate but not the children when the linked action changes', () => {
            // Given a report showing a linked action that was visible, so the gate has marked it as seen
            const {rerender} = render(
                <LinkedActionNotFoundGuard>
                    <MountTrackingChildren />
                </LinkedActionNotFoundGuard>,
            );
            expect(mockSetParams).not.toHaveBeenCalled();

            // When the route moves to a different linked action that is already deleted
            mockRouteParams.reportActionID = 'another-action-id';
            mockIsReportActionVisible = false;
            rerender(
                <LinkedActionNotFoundGuard>
                    <MountTrackingChildren />
                </LinkedActionNotFoundGuard>,
            );

            // Then the gate starts fresh for the new action and takes the never-visible recovery path (which skips the backTo
            // cleanup), while children stay mounted
            expect(mockSetParams).toHaveBeenCalledTimes(1);
            expect(mockSetParams).toHaveBeenCalledWith({reportActionID: undefined}, ROUTE_KEY, NAVIGATOR_KEY);
            expect(mockCleanStaleBackToParam).not.toHaveBeenCalled();
            expect(mockChildUnmount).not.toHaveBeenCalled();
            expect(mockChildMount).toHaveBeenCalledTimes(1);
        });

        it('runs the recovery for a deleted linked action after the children layout effects', () => {
            // Given the linked action is already deleted when the report mounts
            mockIsReportActionVisible = false;
            mockSetParams.mockImplementation(() => {
                effectLog.push('recovery-set-params');
            });

            // When the guard and its children mount
            render(
                <LinkedActionNotFoundGuard>
                    <MountTrackingChildren />
                </LinkedActionNotFoundGuard>,
            );

            // Then the children's layout effects still run before the gate's recovery, as they did when the gate wrapped them
            expect(effectLog).toEqual(['child-layout-effect', 'recovery-set-params']);
        });
    });
});
