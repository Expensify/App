import {act, renderHook} from '@testing-library/react-native';
import type {LayoutChangeEvent} from 'react-native';
import {getMeasuredLinkedRowScrollPosition} from '@pages/inbox/report/InitialViewportUtils';
import useCenteredInitialScrollKeyList from '@pages/inbox/report/useCenteredInitialScrollKeyList';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

const mockScrollToIndex = jest.fn(() => Promise.resolve());

jest.mock('@hooks/useReportScrollManager', () =>
    jest.fn(() => ({
        ref: {
            current: {
                scrollToIndex: mockScrollToIndex,
            },
        },
    })),
);

jest.mock('@hooks/useWindowDimensions', () =>
    jest.fn(() => ({
        windowHeight: 800,
    })),
);

type HookProps = Parameters<typeof useCenteredInitialScrollKeyList>[0];

const report = {
    reportID: 'report-1',
} as OnyxTypes.Report;

const reportLoadingState = {
    hasOnceLoadedReportActions: true,
    isLoadingOlderReportActions: false,
} as OnyxTypes.ReportLoadingState;

const createAction = (reportActionID: string): OnyxTypes.ReportAction =>
    ({
        reportActionID,
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        created: `2024-01-01 00:00:0${reportActionID}.000`,
        actorAccountID: 1,
        message: [{type: 'COMMENT', html: `Message ${reportActionID}`, text: `Message ${reportActionID}`}],
        originalMessage: {},
        shouldShow: true,
        person: [],
        pendingAction: null,
        errors: {},
    }) as OnyxTypes.ReportAction;

const sortedVisibleReportActions = [createAction('1'), createAction('2'), createAction('3')];

const keyExtractor = (item: OnyxTypes.ReportAction) => item.reportActionID;

const createLayoutEvent = (height: number): LayoutChangeEvent =>
    ({
        nativeEvent: {
            layout: {
                height,
                width: 400,
                x: 0,
                y: 0,
            },
            target: 1,
        },
    }) as unknown as LayoutChangeEvent;

const createProps = (overrides: Partial<HookProps> = {}): HookProps => ({
    initialScrollKey: undefined,
    sortedVisibleReportActions,
    keyExtractor,
    linkedReportActionID: undefined,
    reportLoadingState,
    shouldFocusToTopOnMount: false,
    listID: 'report-1:params',
    report,
    onLoad: jest.fn(),
    ...overrides,
});

const mockRequestAnimationFrame = () =>
    jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
        callback(0);
        return 0;
    });

const mockQueuedRequestAnimationFrame = () => {
    let nextFrameID = 1;
    const callbacks = new Map<number, Parameters<typeof requestAnimationFrame>[0]>();

    jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
        const frameID = nextFrameID++;
        callbacks.set(frameID, callback);
        return frameID;
    });
    jest.spyOn(global, 'cancelAnimationFrame').mockImplementation((frameID) => {
        callbacks.delete(frameID);
    });

    return {
        flushNextFrame: () => {
            const nextFrame = callbacks.entries().next().value;
            if (!nextFrame) {
                return;
            }

            const [frameID, callback] = nextFrame;
            callbacks.delete(frameID);
            act(() => {
                callback(0);
            });
        },
    };
};

const flushMicrotasks = () =>
    act(async () => {
        await Promise.resolve();
    });

describe('useCenteredInitialScrollKeyList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getMeasuredLinkedRowScrollPosition', () => {
        it('uses FlashList viewPosition to center rows that fit within the list', () => {
            expect(getMeasuredLinkedRowScrollPosition(600, 120)).toEqual({viewPosition: 0.5});
        });

        it('centers the row top edge when the row is taller than the list', () => {
            expect(getMeasuredLinkedRowScrollPosition(600, 700)).toEqual({viewOffset: 400});
        });
    });

    it('shows the initial viewport skeleton on initial render when there is an initial scroll target', async () => {
        const {result} = renderHook((props: HookProps) => useCenteredInitialScrollKeyList(props), {
            initialProps: createProps({initialScrollKey: '2'}),
        });

        expect(result.current.shouldShowInitialViewportSkeleton).toBe(true);
        await flushMicrotasks();
    });

    it('hides the initial viewport skeleton after the initial unread-anchor viewport is mounted and measured', async () => {
        mockRequestAnimationFrame();

        const {result} = renderHook((props: HookProps) => useCenteredInitialScrollKeyList(props), {
            initialProps: createProps({initialScrollKey: '2'}),
        });
        await flushMicrotasks();

        act(() => {
            result.current.handleReportActionsListLayout(createLayoutEvent(600));
        });

        const initialViewportRange = result.current.initialViewportRange;
        if (!initialViewportRange) {
            throw new Error('Expected an initial viewport range');
        }

        act(() => {
            for (let index = initialViewportRange.first; index <= initialViewportRange.last; index++) {
                result.current.handleInitialViewportItemMounted(index);
            }
        });

        await act(async () => {
            result.current.handleInitialScrollTargetLayout(120);
            await Promise.resolve();
        });

        expect(result.current.initialScrollKeyForInitialScroll).toBe('2');
        expect(mockScrollToIndex).toHaveBeenCalledWith({
            index: 1,
            animated: false,
            viewPosition: 0.5,
        });
        expect(result.current.shouldShowInitialViewportSkeleton).toBe(false);
    });

    it('keeps the initial viewport skeleton visible until the measured scroll follow-up frames finish', async () => {
        const {flushNextFrame} = mockQueuedRequestAnimationFrame();

        const {result} = renderHook((props: HookProps) => useCenteredInitialScrollKeyList(props), {
            initialProps: createProps({initialScrollKey: '2'}),
        });
        await flushMicrotasks();

        act(() => {
            result.current.handleReportActionsListLayout(createLayoutEvent(600));
        });

        const initialViewportRange = result.current.initialViewportRange;
        if (!initialViewportRange) {
            throw new Error('Expected an initial viewport range');
        }

        act(() => {
            for (let index = initialViewportRange.first; index <= initialViewportRange.last; index++) {
                result.current.handleInitialViewportItemMounted(index);
            }
        });

        expect(result.current.shouldShowInitialViewportSkeleton).toBe(true);

        act(() => {
            result.current.handleInitialScrollTargetLayout(120);
        });

        expect(result.current.shouldShowInitialViewportSkeleton).toBe(true);

        flushNextFrame();
        await flushMicrotasks();

        expect(mockScrollToIndex).toHaveBeenCalledTimes(1);
        expect(result.current.shouldShowInitialViewportSkeleton).toBe(true);

        flushNextFrame();
        await flushMicrotasks();
        expect(result.current.shouldShowInitialViewportSkeleton).toBe(true);

        flushNextFrame();
        await flushMicrotasks();
        expect(result.current.shouldShowInitialViewportSkeleton).toBe(true);

        flushNextFrame();
        await flushMicrotasks();
        expect(result.current.shouldShowInitialViewportSkeleton).toBe(true);

        flushNextFrame();
        await flushMicrotasks();

        expect(mockScrollToIndex).toHaveBeenCalledTimes(4);
        expect(result.current.shouldShowInitialViewportSkeleton).toBe(false);
    });

    it('does not scroll or show the initial viewport skeleton when an unread marker appears after the list mounted', async () => {
        mockRequestAnimationFrame();

        const {result, rerender} = renderHook((props: HookProps) => useCenteredInitialScrollKeyList(props), {
            initialProps: createProps(),
        });
        await flushMicrotasks();

        expect(result.current.shouldShowInitialViewportSkeleton).toBe(false);

        act(() => {
            result.current.handleReportActionsListLayout(createLayoutEvent(600));
        });

        rerender(createProps({initialScrollKey: '2'}));

        expect(result.current.shouldShowInitialViewportSkeleton).toBe(false);
        expect(result.current.initialScrollKeyForInitialScroll).toBeUndefined();

        await act(async () => {
            result.current.handleInitialScrollTargetLayout(120);
            await Promise.resolve();
        });
        await flushMicrotasks();

        expect(result.current.initialScrollKeyForInitialScroll).toBeUndefined();
        expect(mockScrollToIndex).not.toHaveBeenCalled();
        expect(result.current.shouldShowInitialViewportSkeleton).toBe(false);
    });
});
