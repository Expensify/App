import {act, renderHook} from '@testing-library/react-native';
import type {LayoutChangeEvent} from 'react-native';
import useVerticallyCenteredInitialContent from '@pages/inbox/report/useVerticallyCenteredInitialContent';
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

type HookProps = Parameters<typeof useVerticallyCenteredInitialContent>[0];

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
    hasOlderActions: false,
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

const flushMicrotasks = () =>
    act(async () => {
        await Promise.resolve();
    });

describe('useVerticallyCenteredInitialContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('shows the initial viewport skeleton on initial render when there is an initial scroll target', async () => {
        const {result} = renderHook((props: HookProps) => useVerticallyCenteredInitialContent(props), {
            initialProps: createProps({initialScrollKey: '2'}),
        });

        expect(result.current.shouldShowInitialViewportSkeleton).toBe(true);
        await flushMicrotasks();
    });

    it('hides the initial viewport skeleton after the initial unread-anchor viewport is mounted and measured', async () => {
        mockRequestAnimationFrame();

        const {result} = renderHook((props: HookProps) => useVerticallyCenteredInitialContent(props), {
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
            viewOffset: -180,
        });
        expect(result.current.shouldShowInitialViewportSkeleton).toBe(false);
    });

    it('does not scroll or show the initial viewport skeleton when an unread marker appears after the list mounted', async () => {
        mockRequestAnimationFrame();

        const {result, rerender} = renderHook((props: HookProps) => useVerticallyCenteredInitialContent(props), {
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
