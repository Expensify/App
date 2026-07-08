import {act, renderHook} from '@testing-library/react-native';

import usePreMountDestination from '@hooks/usePreMountDestination';
import schedulePreInsertWhenIdle from '@hooks/usePreMountDestination/schedulePreInsertWhenIdle';

import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

const PRE_INSERT_OPEN_TRANSITION_START_WAIT_MS = 500;
const PRE_INSERT_STARTED_NARROW_OPTIONS = {shouldIgnoreLayout: true};

const mockGetIsNarrowLayout = jest.fn<boolean, []>();

jest.mock('@hooks/useResponsiveLayout', () => () => ({
    shouldUseNarrowLayout: true,
}));
jest.mock('@libs/getIsNarrowLayout', () => () => mockGetIsNarrowLayout());
jest.mock('@libs/Navigation/Navigation', () => ({
    preInsertFullscreenUnderRHP: jest.fn(),
    removePreInsertedFullscreenIfNeeded: jest.fn(),
    getIsFullscreenPreInsertedUnderRHP: jest.fn(),
    clearFullscreenPreInsertedFlag: jest.fn(),
    dismissModal: jest.fn(),
    revealRouteBeforeDismissingModal: jest.fn(),
}));
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: jest.fn(() => ({cancel: jest.fn()})),
}));

type PendingPreInsert = {
    callback: () => void;
    cancelled: boolean;
};

const pendingIdlePreInserts: PendingPreInsert[] = [];

jest.mock('@hooks/usePreMountDestination/schedulePreInsertWhenIdle', () => ({
    __esModule: true,
    default: jest.fn((callback: () => void) => {
        const pendingPreInsert: PendingPreInsert = {callback, cancelled: false};
        pendingIdlePreInserts.push(pendingPreInsert);

        return {
            cancel: jest.fn(() => {
                pendingPreInsert.cancelled = true;
            }),
        };
    }),
}));

function flushPendingIdlePreInserts() {
    const callbacks = pendingIdlePreInserts.filter((pendingPreInsert) => !pendingPreInsert.cancelled).map((pendingPreInsert) => pendingPreInsert.callback);
    pendingIdlePreInserts.length = 0;
    for (const callback of callbacks) {
        callback();
    }
}

function mockOpenTransitionWait() {
    let transitionCallback: (() => void) | undefined;
    const cancel = jest.fn();

    jest.mocked(TransitionTracker.runAfterTransitions).mockImplementation(({callback}) => {
        transitionCallback = () => {
            callback();
        };
        return {cancel};
    });

    return {
        cancel,
        finishOpenTransition: () => transitionCallback?.(),
    };
}

function mockSuccessfulPreInsert() {
    jest.mocked(Navigation.getIsFullscreenPreInsertedUnderRHP).mockReturnValueOnce(false).mockReturnValueOnce(true).mockReturnValue(true);
}

function preMountRoute(route: Route) {
    const {finishOpenTransition} = mockOpenTransitionWait();
    const hook = renderHook(() => usePreMountDestination(route));

    act(() => {
        finishOpenTransition();
        flushPendingIdlePreInserts();
    });

    return hook;
}

describe('usePreMountDestination', () => {
    const route = ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense'});
    const reportRoute = ROUTES.REPORT_WITH_ID.getRoute('123');
    const afterTransition = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        pendingIdlePreInserts.length = 0;
        mockGetIsNarrowLayout.mockReturnValue(true);
        jest.mocked(Navigation.getIsFullscreenPreInsertedUnderRHP).mockReturnValue(false);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('pre-insert scheduling', () => {
        it('waits for the open transition before scheduling pre-insert on React idle queue by default', () => {
            const {finishOpenTransition} = mockOpenTransitionWait();

            renderHook(() => usePreMountDestination(route));

            expect(TransitionTracker.runAfterTransitions).toHaveBeenCalledWith(
                expect.objectContaining({
                    maxWaitForUpcomingTransitionMs: PRE_INSERT_OPEN_TRANSITION_START_WAIT_MS,
                    waitForUpcomingTransition: true,
                }),
            );
            expect(schedulePreInsertWhenIdle).not.toHaveBeenCalled();
            expect(Navigation.preInsertFullscreenUnderRHP).not.toHaveBeenCalled();

            act(() => {
                finishOpenTransition();
            });
            expect(schedulePreInsertWhenIdle).toHaveBeenCalledWith(expect.any(Function));

            act(() => {
                flushPendingIdlePreInserts();
            });

            expect(Navigation.preInsertFullscreenUnderRHP).toHaveBeenCalledWith(route, PRE_INSERT_STARTED_NARROW_OPTIONS);
        });

        it('does not pre-insert on wide layout', () => {
            mockGetIsNarrowLayout.mockReturnValue(false);
            renderHook(() => usePreMountDestination(route));
            expect(TransitionTracker.runAfterTransitions).not.toHaveBeenCalled();
            expect(schedulePreInsertWhenIdle).not.toHaveBeenCalled();
        });

        it('uses the flow-start layout when deciding whether to pre-insert', () => {
            mockGetIsNarrowLayout.mockReturnValue(false);
            const {rerender} = renderHook(() => usePreMountDestination(route));

            mockGetIsNarrowLayout.mockReturnValue(true);
            rerender(undefined);

            expect(TransitionTracker.runAfterTransitions).not.toHaveBeenCalled();
            expect(schedulePreInsertWhenIdle).not.toHaveBeenCalled();
            expect(Navigation.preInsertFullscreenUnderRHP).not.toHaveBeenCalled();
        });

        it('keeps the narrow-start pre-insert strategy when resized before scheduled work runs', () => {
            const {finishOpenTransition} = mockOpenTransitionWait();
            const {rerender} = renderHook(() => usePreMountDestination(route));

            mockGetIsNarrowLayout.mockReturnValue(false);
            rerender(undefined);

            act(() => {
                finishOpenTransition();
                flushPendingIdlePreInserts();
            });

            expect(Navigation.preInsertFullscreenUnderRHP).toHaveBeenCalledWith(route, PRE_INSERT_STARTED_NARROW_OPTIONS);
        });

        it('cleans up pending pre-insert on unmount and preserves route after submit ref', () => {
            const {finishOpenTransition} = mockOpenTransitionWait();
            const formHasBeenSubmittedRef = {current: false};
            mockSuccessfulPreInsert();

            const {unmount} = renderHook(() =>
                usePreMountDestination(route, {
                    shouldPreservePreInsertedRouteOnUnmount: () => formHasBeenSubmittedRef.current,
                }),
            );

            act(() => {
                finishOpenTransition();
                flushPendingIdlePreInserts();
            });

            jest.mocked(Navigation.getIsFullscreenPreInsertedUnderRHP).mockReturnValue(true);
            unmount();
            expect(Navigation.removePreInsertedFullscreenIfNeeded).toHaveBeenCalled();

            formHasBeenSubmittedRef.current = true;
            const {finishOpenTransition: finishOpenTransitionAfterSubmit} = mockOpenTransitionWait();
            mockSuccessfulPreInsert();
            const {unmount: unmountAfterSubmit} = renderHook(() =>
                usePreMountDestination(route, {
                    shouldPreservePreInsertedRouteOnUnmount: () => formHasBeenSubmittedRef.current,
                }),
            );

            act(() => {
                finishOpenTransitionAfterSubmit();
                flushPendingIdlePreInserts();
            });

            jest.mocked(Navigation.getIsFullscreenPreInsertedUnderRHP).mockReturnValue(true);
            unmountAfterSubmit();
            expect(Navigation.removePreInsertedFullscreenIfNeeded).toHaveBeenCalledTimes(1);
        });

        it('does not clean up a pre-inserted route when the preserve callback identity changes while mounted', () => {
            const {finishOpenTransition} = mockOpenTransitionWait();
            mockSuccessfulPreInsert();

            const {rerender, unmount} = renderHook(
                ({shouldPreservePreInsertedRouteOnUnmount}) =>
                    usePreMountDestination(route, {
                        shouldPreservePreInsertedRouteOnUnmount,
                    }),
                {
                    initialProps: {shouldPreservePreInsertedRouteOnUnmount: () => true},
                },
            );

            act(() => {
                finishOpenTransition();
                flushPendingIdlePreInserts();
            });

            rerender({shouldPreservePreInsertedRouteOnUnmount: () => false});
            expect(Navigation.removePreInsertedFullscreenIfNeeded).not.toHaveBeenCalled();

            unmount();
            expect(Navigation.removePreInsertedFullscreenIfNeeded).toHaveBeenCalledTimes(1);
        });

        it('uses the preserve callback from the pre-inserted route when the route changes', () => {
            const {finishOpenTransition} = mockOpenTransitionWait();
            const shouldPreserveCurrentRoute = jest.fn(() => false);
            const shouldPreserveNextRoute = jest.fn(() => true);
            type HookProps = {
                currentRoute: Route;
                shouldPreservePreInsertedRouteOnUnmount: () => boolean;
            };
            const initialProps: HookProps = {
                currentRoute: route,
                shouldPreservePreInsertedRouteOnUnmount: shouldPreserveCurrentRoute,
            };
            mockSuccessfulPreInsert();

            const {rerender} = renderHook(
                ({currentRoute, shouldPreservePreInsertedRouteOnUnmount}: HookProps) =>
                    usePreMountDestination(currentRoute, {
                        shouldPreservePreInsertedRouteOnUnmount,
                    }),
                {initialProps},
            );

            act(() => {
                finishOpenTransition();
                flushPendingIdlePreInserts();
            });

            jest.mocked(Navigation.getIsFullscreenPreInsertedUnderRHP).mockReturnValue(true);
            rerender({
                currentRoute: reportRoute,
                shouldPreservePreInsertedRouteOnUnmount: shouldPreserveNextRoute,
            });

            expect(shouldPreserveCurrentRoute).toHaveBeenCalledTimes(1);
            expect(shouldPreserveNextRoute).not.toHaveBeenCalled();
            expect(Navigation.removePreInsertedFullscreenIfNeeded).toHaveBeenCalledTimes(1);
        });
    });

    describe('reveal strategies', () => {
        it('reveal dismisses over an owned pre-inserted route', () => {
            mockSuccessfulPreInsert();

            const {result} = preMountRoute(route);

            act(() => {
                result.current.reveal(afterTransition);
            });

            expect(Navigation.clearFullscreenPreInsertedFlag).toHaveBeenCalled();
            expect(Navigation.dismissModal).toHaveBeenCalledWith({afterTransition});
            expect(Navigation.revealRouteBeforeDismissingModal).not.toHaveBeenCalled();
        });

        it('reveal dismisses over an owned pre-inserted route after resizing to wide', () => {
            mockSuccessfulPreInsert();

            const {result, rerender} = preMountRoute(route);
            mockGetIsNarrowLayout.mockReturnValue(false);
            rerender(undefined);

            act(() => {
                result.current.reveal(afterTransition);
            });

            expect(Navigation.clearFullscreenPreInsertedFlag).toHaveBeenCalled();
            expect(Navigation.dismissModal).toHaveBeenCalledWith({afterTransition});
            expect(Navigation.revealRouteBeforeDismissingModal).not.toHaveBeenCalled();
        });

        it('reveal passes an afterTransition callback when revealing a fallback route', () => {
            const {result} = renderHook(() => usePreMountDestination(route));

            act(() => {
                result.current.reveal(afterTransition);
            });

            expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalledWith(route, {afterTransition});
        });

        it('reveal falls back without afterTransition when no callback is provided', () => {
            const {result} = renderHook(() => usePreMountDestination(reportRoute));

            act(() => {
                result.current.reveal();
            });

            expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalledWith(reportRoute);
        });

        it('reveal covers the pre-inserted narrow path without an afterTransition callback', () => {
            mockSuccessfulPreInsert();

            const {result} = preMountRoute(route);

            act(() => {
                result.current.reveal();
            });

            expect(Navigation.clearFullscreenPreInsertedFlag).toHaveBeenCalled();
            expect(Navigation.dismissModal).toHaveBeenCalledWith({
                afterTransition: undefined,
            });
            expect(Navigation.revealRouteBeforeDismissingModal).not.toHaveBeenCalled();
        });

        it('reveal falls back when another flow owns the global pre-insert flag', () => {
            jest.mocked(Navigation.getIsFullscreenPreInsertedUnderRHP).mockReturnValue(true);

            const {result} = renderHook(() => usePreMountDestination(route));

            act(() => {
                result.current.reveal(afterTransition);
            });

            expect(Navigation.clearFullscreenPreInsertedFlag).not.toHaveBeenCalled();
            expect(Navigation.dismissModal).not.toHaveBeenCalled();
            expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalledWith(route, {afterTransition});
        });

        it('cleanupPreMount removes an owned pre-insert before closing the RHP', () => {
            mockSuccessfulPreInsert();
            const {result} = preMountRoute(route);

            act(() => {
                result.current.cleanupPreMount();
            });

            expect(Navigation.removePreInsertedFullscreenIfNeeded).toHaveBeenCalled();
        });
    });
});
