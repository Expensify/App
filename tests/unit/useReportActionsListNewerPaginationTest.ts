import {act, renderHook} from '@testing-library/react-native';

import type {ActionListRef} from '@pages/inbox/ActionListTypes';
import useReportActionsListScroll from '@pages/inbox/report/ReportActionsList/useReportActionsListScroll';

import type {ReportAction} from '@src/types/onyx';

import type {CompatScroller} from '@shopify/flash-list/dist/recyclerview/components/CompatScroller';

import {useBoundDetection} from '@shopify/flash-list/dist/recyclerview/hooks/useBoundDetection';
import {RecyclerViewManager} from '@shopify/flash-list/dist/recyclerview/RecyclerViewManager';

import createMock from '../utils/createMock';

const mockLoadNewerChats = jest.fn();
let mockNewestCursor = '77';
let mockHasNewerActions = true;
let mockIsLoadingNewer = false;
let mockIsFocused = true;
let mockIsOffline = false;
let mockIsSearchTopmost = false;
const mockTransitions: Array<{callback: () => void; isCancelled: boolean}> = [];
const mockListRef = {current: createMock<ActionListRef>({})};

jest.mock('@hooks/useNetwork', () => () => ({isOffline: mockIsOffline}));
jest.mock('@react-navigation/native', () => ({useIsFocused: () => mockIsFocused}));
jest.mock('@hooks/useWindowDimensions', () => () => ({windowHeight: 800}));
jest.mock('@hooks/useReportScrollManager', () => () => ({}));
jest.mock('@hooks/useReportActionsScroll', () => () => ({trackVerticalScrolling: jest.fn()}));
jest.mock('@pages/inbox/report/useFollowActionBadgeTarget', () => () => {});
jest.mock('@pages/inbox/report/useScrollToEditingReportAction', () => () => {});
jest.mock('@pages/inbox/ActionListContext', () => ({useActionListRef: () => mockListRef}));
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => mockIsSearchTopmost);
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: ({callback}: {callback: () => void}) => {
            const transition = {callback, isCancelled: false};
            mockTransitions.push(transition);
            return {
                cancel: () => {
                    transition.isCancelled = true;
                },
            };
        },
    },
}));
jest.mock('@pages/inbox/report/ReportActionsListContext', () => ({
    useReportActionsListState: () => ({
        hasOnceLoadedReportActions: true,
        hasNewerActions: mockHasNewerActions,
        newestFetchedReportActionID: mockNewestCursor,
        isLoadingNewerReportActions: mockIsLoadingNewer,
    }),
    useReportActionsListActions: () => ({loadNewerChats: mockLoadNewerChats}),
}));

function actions(newest: number, count = 30) {
    return Array.from({length: count}, (_, index) => createMock<ReportAction>({reportActionID: String(newest - index)}));
}

function setupPagination() {
    let data = actions(77);
    const manager = new RecyclerViewManager<ReportAction>({data, renderItem: () => null});
    manager.updateLayoutParams({width: 100, height: 400}, 0);
    manager.modifyChildrenLayout(
        data.map((_, index) => ({index, dimensions: {width: 100, height: 50}})),
        data.length,
    );
    mockListRef.current = createMock<ActionListRef>({
        getLayout: (index) => manager.tryGetLayout(index),
        getAbsoluteLastScrollOffset: () => manager.getAbsoluteLastScrollOffset(),
        getWindowSize: () => manager.getWindowSize(),
    });
    const scroller = {current: createMock<CompatScroller>({scrollToEnd: jest.fn()})};
    const {result, rerender, unmount} = renderHook(() => {
        const {listProps} = useReportActionsListScroll(
            createMock<Parameters<typeof useReportActionsListScroll>[0]>({
                reportID: '1',
                renderedVisibleReportActions: data,
                sortedVisibleReportActions: data,
                reportActionIDToDisplayIndex: new Map(),
                onScrolledOverThresholdChange: jest.fn(),
            }),
        );
        manager.updateProps({
            ...manager.props,
            onStartReached: listProps.onStartReached,
            onStartReachedThreshold: listProps.onStartReachedThreshold,
        });
        const {checkBounds} = useBoundDetection(manager, scroller);
        return {listProps, checkBounds};
    });
    const settle = () => act(() => jest.runOnlyPendingTimers());
    const update = (nextData = data, {shouldSettle = true} = {}) => {
        data = nextData;
        manager.updateProps({...manager.props, data});
        manager.processDataUpdate();
        rerender({});
        if (shouldSettle) {
            settle();
        }
    };
    const scroll = (offset: number) => {
        manager.updateScrollOffset(offset);
        act(() => {
            result.current.listProps.onScroll(
                createMock<Parameters<typeof result.current.listProps.onScroll>[0]>({
                    nativeEvent: {contentOffset: {y: offset}, layoutMeasurement: {height: 400}},
                }),
            );
            result.current.checkBounds();
        });
    };
    settle();
    return {data, update, scroll, settle, unmount};
}

beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => Number(setTimeout(() => callback(0), 16)));
    jest.spyOn(global, 'cancelAnimationFrame').mockImplementation((frame) => clearTimeout(frame));
    mockNewestCursor = '77';
    mockHasNewerActions = true;
    mockIsLoadingNewer = false;
    mockIsFocused = true;
    mockIsOffline = false;
    mockIsSearchTopmost = false;
    mockTransitions.length = 0;
});

afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
});

describe('report list newer pagination', () => {
    it('requests the next cursor while remaining inside the real FlashList start threshold', () => {
        // Given a historical chat that requested newer history at its loaded start.
        const {data, scroll, update} = setupPagination();
        scroll(0);
        expect(mockLoadNewerChats).toHaveBeenCalledTimes(1);

        // When a newer page advances the fetched cursor without leaving the start threshold.
        mockNewestCursor = '106';
        update([...actions(106, 29), ...data]);

        // Then normal pagination requests the following page despite FlashList's latched start callback.
        expect(mockLoadNewerChats).toHaveBeenCalledTimes(2);
    });

    it('does not retry when visible data changes without advancing the fetched cursor', () => {
        // Given a request already made for the current fetched cursor.
        const {data, scroll, update} = setupPagination();
        scroll(0);

        // When a Pusher message arrives, messages are edited, and a response makes no cursor progress.
        update([...actions(132, 1), ...data]);
        update(data.map((action) => ({...action})));
        mockIsLoadingNewer = true;
        update();
        mockIsLoadingNewer = false;
        update();
        scroll(0);

        // Then none of those updates requests the same page again.
        expect(mockLoadNewerChats).toHaveBeenCalledTimes(1);
    });

    it('waits for the response to finish and respects a reader who moved away', () => {
        // Given an in-flight request while the reader leaves the start threshold.
        const {data, scroll, update} = setupPagination();
        scroll(0);
        mockIsLoadingNewer = true;
        update();
        scroll(600);

        // When the response advances the cursor and finishes while the reader remains away.
        mockNewestCursor = '106';
        update([...actions(106, 29), ...data]);
        mockIsLoadingNewer = false;
        update();

        // Then no automatic request occurs until the reader returns to the start.
        expect(mockLoadNewerChats).toHaveBeenCalledTimes(1);
        scroll(0);
        expect(mockLoadNewerChats).toHaveBeenCalledTimes(2);
    });

    it('allows retrying the same cursor after leaving and reentering the threshold', () => {
        // Given a failed request with no cursor advancement.
        const {scroll, update} = setupPagination();
        scroll(0);
        update();

        // When the reader leaves the threshold and returns.
        scroll(600);
        scroll(0);

        // Then normal edge entry retries once.
        expect(mockLoadNewerChats).toHaveBeenCalledTimes(2);
    });

    it('stops after the final page', () => {
        // Given a request for the remaining newer history.
        const {data, scroll, update} = setupPagination();
        scroll(0);

        // When the terminal page arrives.
        mockNewestCursor = '132';
        mockHasNewerActions = false;
        update([...actions(132, 55), ...data]);

        // Then the terminal boundary does not request another page.
        expect(mockLoadNewerChats).toHaveBeenCalledTimes(1);
    });

    it('waits for an in-flight response before requesting the advanced cursor', () => {
        // Given a request at the start while the next page is still being applied.
        const {data, scroll, update} = setupPagination();
        scroll(0);
        mockIsLoadingNewer = true;
        mockNewestCursor = '106';
        update([...actions(106, 29), ...data]);

        // Then the cursor change alone does not start an overlapping request.
        expect(mockLoadNewerChats).toHaveBeenCalledTimes(1);

        // When that response finishes, the same advanced cursor becomes eligible.
        mockIsLoadingNewer = false;
        update();

        // Then the next page is requested once.
        expect(mockLoadNewerChats).toHaveBeenCalledTimes(2);
    });

    it.each(['offline', 'unfocused'])('defers the next page while %s', (condition) => {
        // Given a request already made before the report becomes inactive or offline.
        const {data, scroll, update} = setupPagination();
        scroll(0);
        mockIsOffline = condition === 'offline';
        mockIsFocused = condition !== 'unfocused';
        mockNewestCursor = '106';

        // When the next cursor arrives without a focused online report.
        update([...actions(106, 29), ...data]);

        // Then it cannot cause a request until the report is usable again.
        expect(mockLoadNewerChats).toHaveBeenCalledTimes(1);
        mockIsOffline = false;
        mockIsFocused = true;
        update();
        expect(mockLoadNewerChats).toHaveBeenCalledTimes(2);
    });

    it('cancels a pending recheck on unmount', () => {
        // Given an advanced cursor with its next-frame recheck still pending.
        const {data, scroll, update, unmount, settle} = setupPagination();
        scroll(0);
        mockNewestCursor = '106';
        update([...actions(106, 29), ...data], {shouldSettle: false});

        // When the list unmounts before that frame.
        unmount();
        settle();

        // Then deferred work cannot request history for the departed list.
        expect(mockLoadNewerChats).toHaveBeenCalledTimes(1);
    });

    it('waits for search transitions and measures the viewport again afterward', () => {
        // Given a search report whose transition defers its start callback.
        mockIsSearchTopmost = true;
        const {scroll, settle} = setupPagination();
        const completeTransitions = () =>
            act(() => {
                for (const transition of mockTransitions.splice(0)) {
                    if (transition.isCancelled) {
                        continue;
                    }
                    transition.callback();
                }
            });
        scroll(0);
        expect(mockLoadNewerChats).not.toHaveBeenCalled();

        // When the reader moves away before the transition finishes.
        scroll(600);
        completeTransitions();
        settle();

        // Then the deferred callback respects the current viewport.
        expect(mockLoadNewerChats).not.toHaveBeenCalled();

        // When the reader returns and that transition finishes.
        scroll(0);
        completeTransitions();
        settle();

        // Then pagination resumes once through the existing transition path.
        expect(mockLoadNewerChats).toHaveBeenCalledTimes(1);
    });
});
