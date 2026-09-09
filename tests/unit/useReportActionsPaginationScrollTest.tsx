import {act, renderHook} from '@testing-library/react-native';

import useReportActionsPaginationScroll, {REPORT_ACTIONS_PAGINATION_THRESHOLD} from '@hooks/useReportActionsPaginationScroll';

const VIEWPORT_HEIGHT = 500;
const NEWER_PAGINATION_EXTENT = 168;
const OLDER_PAGINATION_EXTENT = 128;
const CONTENT_HEIGHT = 3000;
const BOUNDARY_DISTANCE = VIEWPORT_HEIGHT * 0.25;

const mockLoadOlderActions = jest.fn();
const mockLoadNewerActions = jest.fn();
const mockAnimationFrames: FrameRequestCallback[] = [];
const mockTransitionCallbacks: Array<() => void> = [];
let mockIsSearchTopmostFullScreenRoute = false;

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => mockIsSearchTopmostFullScreenRoute);
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: ({callback}: {callback: () => void}) => {
            mockTransitionCallbacks.push(callback);
            return {cancel: jest.fn()};
        },
    },
}));

let listMetrics = {
    contentLength: CONTENT_HEIGHT,
    scroll: 0,
    scrollLength: VIEWPORT_HEIGHT,
};

// The hook reads only these three values from LegendList's much larger diagnostic state.
const listRef = {
    current: {
        getState: () => listMetrics,
    },
};

type HookParams = Parameters<typeof useReportActionsPaginationScroll>[0];

function buildParams(overrides: Partial<HookParams> = {}): HookParams {
    return {
        reportID: 'report-1',
        linkedReportActionID: undefined,
        listRef,
        viewportHeight: VIEWPORT_HEIGHT,
        olderPaginationExtent: OLDER_PAGINATION_EXTENT,
        newerPaginationExtent: NEWER_PAGINATION_EXTENT,
        olderCursor: 'older-1',
        newerCursor: 'newer-1',
        hasOlderActions: true,
        hasNewerActions: true,
        isLoadingOlderReportActions: false,
        isLoadingNewerReportActions: false,
        hasLoadingOlderReportActionsError: false,
        hasLoadingNewerReportActionsError: false,
        isOffline: false,
        canLoadOlder: true,
        canLoadNewer: true,
        loadOlderActions: mockLoadOlderActions,
        loadNewerActions: mockLoadNewerActions,
        ...overrides,
    };
}

function setListMetrics(offset: number, contentHeight = CONTENT_HEIGHT, viewportHeight = VIEWPORT_HEIGHT) {
    listMetrics = {
        contentLength: contentHeight,
        scroll: offset,
        scrollLength: viewportHeight,
    };
}

function flushAnimationFrames() {
    while (mockAnimationFrames.length > 0) {
        act(() => {
            for (const callback of mockAnimationFrames.splice(0)) {
                callback(0);
            }
        });
    }
}

function flushTransitions() {
    act(() => {
        for (const callback of mockTransitionCallbacks.splice(0)) {
            callback();
        }
    });
}

describe('useReportActionsPaginationScroll', () => {
    beforeAll(() => {
        jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
            mockAnimationFrames.push(callback);
            return mockAnimationFrames.length;
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockAnimationFrames.length = 0;
        mockTransitionCallbacks.length = 0;
        mockIsSearchTopmostFullScreenRoute = false;
        listMetrics = {
            contentLength: CONTENT_HEIGHT,
            scroll: 0,
            scrollLength: VIEWPORT_HEIGHT,
        };
    });

    it('triggers both directions at 25% of the real-message boundary after subtracting pagination extents', () => {
        const {result} = renderHook(() => useReportActionsPaginationScroll(buildParams()));
        const olderBoundaryOffset = OLDER_PAGINATION_EXTENT + BOUNDARY_DISTANCE;
        const newerBoundaryOffset = CONTENT_HEIGHT - VIEWPORT_HEIGHT - NEWER_PAGINATION_EXTENT - BOUNDARY_DISTANCE;

        expect(REPORT_ACTIONS_PAGINATION_THRESHOLD).toBe(0.25);

        act(() => {
            setListMetrics(olderBoundaryOffset + 1);
            result.current.onScroll();
            setListMetrics(olderBoundaryOffset);
            result.current.onScroll();
        });
        expect(mockLoadOlderActions).toHaveBeenCalledTimes(1);

        act(() => {
            setListMetrics(newerBoundaryOffset - 1);
            result.current.onScroll();
            setListMetrics(newerBoundaryOffset);
            result.current.onScroll();
        });
        expect(mockLoadNewerActions).toHaveBeenCalledTimes(1);
    });

    it('deduplicates repeated boundary events for the same actual request cursors', () => {
        const {result} = renderHook(() => useReportActionsPaginationScroll(buildParams()));

        act(() => {
            setListMetrics(0);
            result.current.onScroll();
            result.current.onScroll();
            setListMetrics(CONTENT_HEIGHT);
            result.current.onScroll();
            result.current.onScroll();
        });

        expect(mockLoadOlderActions).toHaveBeenCalledTimes(1);
        expect(mockLoadNewerActions).toHaveBeenCalledTimes(1);
    });

    it('rechecks stationary geometry after a cursor advances and after content size settles', () => {
        const initialParams = buildParams({hasOlderActions: false});
        const {result, rerender} = renderHook((params: HookParams) => useReportActionsPaginationScroll(params), {initialProps: initialParams});

        setListMetrics(CONTENT_HEIGHT);
        act(() => {
            result.current.onScroll();
        });
        expect(mockLoadNewerActions).toHaveBeenCalledTimes(1);

        rerender({...initialParams, newerCursor: 'newer-2'});
        flushAnimationFrames();
        expect(mockLoadNewerActions).toHaveBeenCalledTimes(2);

        rerender({...initialParams, newerCursor: 'newer-3'});
        act(() => {
            result.current.onContentSizeChange();
        });
        listMetrics = {...listMetrics, contentLength: CONTENT_HEIGHT + 100};
        flushAnimationFrames();
        expect(mockLoadNewerActions).toHaveBeenCalledTimes(3);
    });

    it('uses current availability when a scheduled content-size check runs', () => {
        const initialParams = buildParams({hasNewerActions: false});
        const {result, rerender} = renderHook((params: HookParams) => useReportActionsPaginationScroll(params), {initialProps: initialParams});

        setListMetrics(0);
        act(() => {
            result.current.onScroll();
        });
        expect(mockLoadOlderActions).toHaveBeenCalledTimes(1);

        act(() => {
            result.current.onContentSizeChange();
        });
        rerender({...initialParams, hasOlderActions: false, olderCursor: 'older-2'});
        flushAnimationFrames();

        expect(mockLoadOlderActions).toHaveBeenCalledTimes(1);
    });

    it('cancels delayed Search requests when the pagination window changes or unmounts', () => {
        mockIsSearchTopmostFullScreenRoute = true;
        const initialParams = buildParams({hasOlderActions: false});
        const firstView = renderHook((params: HookParams) => useReportActionsPaginationScroll(params), {initialProps: initialParams});

        setListMetrics(CONTENT_HEIGHT);
        act(() => {
            firstView.result.current.onScroll();
        });
        expect(mockTransitionCallbacks).toHaveLength(1);

        firstView.rerender({...initialParams, linkedReportActionID: 'linked-2'});
        flushTransitions();
        flushAnimationFrames();
        expect(mockLoadNewerActions).not.toHaveBeenCalled();

        mockTransitionCallbacks.length = 0;
        const secondView = renderHook(() => useReportActionsPaginationScroll(initialParams));
        act(() => {
            secondView.result.current.onScroll();
        });
        expect(mockTransitionCallbacks).toHaveLength(1);

        secondView.unmount();
        flushTransitions();
        flushAnimationFrames();
        expect(mockLoadNewerActions).not.toHaveBeenCalled();
    });

    it('blocks loading and stationary error loops but permits a deliberate leave and reentry retry', () => {
        const loadingParams = buildParams({isLoadingOlderReportActions: true, hasNewerActions: false});
        const {result, rerender} = renderHook((params: HookParams) => useReportActionsPaginationScroll(params), {initialProps: loadingParams});

        act(() => {
            result.current.onScroll();
        });
        expect(mockLoadOlderActions).not.toHaveBeenCalled();

        const failedParams = {...loadingParams, isLoadingOlderReportActions: false, hasLoadingOlderReportActionsError: true};
        rerender(failedParams);
        flushAnimationFrames();
        expect(mockLoadOlderActions).not.toHaveBeenCalled();

        act(() => {
            setListMetrics(OLDER_PAGINATION_EXTENT + BOUNDARY_DISTANCE + 1);
            result.current.onScroll();
            setListMetrics(0);
            result.current.onScroll();
        });
        expect(mockLoadOlderActions).toHaveBeenCalledTimes(1);
    });

    it('resets request guards after reconnecting or changing the linked-action window', () => {
        const initialParams = buildParams({hasOlderActions: false});
        const {result, rerender} = renderHook((params: HookParams) => useReportActionsPaginationScroll(params), {initialProps: initialParams});

        setListMetrics(CONTENT_HEIGHT);
        act(() => {
            result.current.onScroll();
        });
        expect(mockLoadNewerActions).toHaveBeenCalledTimes(1);

        rerender({...initialParams, isOffline: true});
        rerender(initialParams);
        flushAnimationFrames();
        expect(mockLoadNewerActions).toHaveBeenCalledTimes(2);

        rerender({...initialParams, linkedReportActionID: 'linked-2'});
        flushAnimationFrames();
        expect(mockLoadNewerActions).toHaveBeenCalledTimes(3);
    });
});
