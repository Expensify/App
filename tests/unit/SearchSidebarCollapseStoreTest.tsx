import {act, renderHook} from '@testing-library/react-native';

import {COLLAPSE_SURFACE, useSearchSidebarCollapse} from '@components/Navigation/SearchSidebarCollapseStore';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

function renderSurfaces() {
    return renderHook(() => ({
        bar: useSearchSidebarCollapse(COLLAPSE_SURFACE.NAVIGATION_BAR),
        spend: useSearchSidebarCollapse(),
    }));
}

describe('SearchSidebarCollapseStore', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        // The peek lives in module state, so a test that leaves one running would leak it into the next.
        const {result, unmount} = renderSurfaces();
        act(() => {
            result.current.bar.endPeek();
            result.current.spend.endPeek();
        });
        unmount();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });
    });

    it('collapses every surface from the one persisted flag', async () => {
        // Given an expanded sidebar and both surfaces mounted
        const {result} = renderSurfaces();
        await waitForBatchedUpdates();

        // When the bar's toggle is pressed
        await act(async () => {
            result.current.bar.toggleSidebar();
            await waitForBatchedUpdates();
        });

        // Then both the bar and the Spend column read the same flag, so they collapse together
        expect(result.current.bar.isCollapsed).toBe(true);
        expect(result.current.spend.isCollapsed).toBe(true);
    });

    it('reads a flag that was persisted before the surfaces mounted', async () => {
        // Given a collapsed state saved by an earlier session, as after a page reload
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
            await waitForBatchedUpdates();
        });

        // When the surfaces mount
        const {result} = renderSurfaces();
        await waitForBatchedUpdates();

        // Then they start collapsed, with no toggle press needed
        expect(result.current.bar.isVisuallyCollapsed).toBe(true);
        expect(result.current.spend.isVisuallyCollapsed).toBe(true);
    });

    it('peeks only the surface the pointer is on', async () => {
        // Given both surfaces collapsed
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
            await waitForBatchedUpdates();
        });
        const {result} = renderSurfaces();
        await waitForBatchedUpdates();

        // When the pointer enters the navigation bar
        act(() => {
            result.current.bar.startPeek();
        });

        // Then the bar widens while the Spend column next to it stays collapsed
        expect(result.current.bar.isPeeking).toBe(true);
        expect(result.current.bar.isVisuallyCollapsed).toBe(false);
        expect(result.current.spend.isPeeking).toBe(false);
        expect(result.current.spend.isVisuallyCollapsed).toBe(true);
    });

    it('ignores a peek on another surface while one is already peeking', async () => {
        // Given the bar peeking
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
            await waitForBatchedUpdates();
        });
        const {result} = renderSurfaces();
        await waitForBatchedUpdates();
        act(() => {
            result.current.bar.startPeek();
        });

        // When the Spend column tries to peek too, and then ends its own peek
        act(() => {
            result.current.spend.startPeek();
            result.current.spend.endPeek();
        });

        // Then the bar keeps peeking, because only the surface that started a peek can end it
        expect(result.current.bar.isPeeking).toBe(true);
        expect(result.current.spend.isPeeking).toBe(false);
    });

    it('does not peek an expanded surface', async () => {
        // Given an expanded sidebar
        const {result} = renderSurfaces();
        await waitForBatchedUpdates();

        // When the pointer enters the bar
        act(() => {
            result.current.bar.startPeek();
        });

        // Then nothing peeks, since there is nothing collapsed to widen
        expect(result.current.bar.isPeeking).toBe(false);
    });

    it('ends the peek when the sidebar is toggled', async () => {
        // Given the bar peeking over a collapsed sidebar
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
            await waitForBatchedUpdates();
        });
        const {result} = renderSurfaces();
        await waitForBatchedUpdates();
        act(() => {
            result.current.bar.startPeek();
        });

        // When the toggle expands the sidebar
        await act(async () => {
            result.current.bar.toggleSidebar();
            await waitForBatchedUpdates();
        });

        // Then the bar is expanded for good and no peek is left over to collapse it again later
        expect(result.current.bar.isCollapsed).toBe(false);
        expect(result.current.bar.isPeeking).toBe(false);
    });

    it('maintains a stable endPeek callback reference across renders', () => {
        // Given a surface hook mounted
        const {result, rerender} = renderHook(() => useSearchSidebarCollapse(COLLAPSE_SURFACE.NAVIGATION_BAR));
        const initialEndPeek = result.current.endPeek;

        // When the hook rerenders
        rerender({});

        // Then the endPeek reference is identical, so the bar's unmount cleanup that depends on it does not end a peek on every render
        expect(result.current.endPeek).toBe(initialEndPeek);
    });

    it('does not re-render a surface when another surface peeks', async () => {
        // Given both surfaces collapsed
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
            await waitForBatchedUpdates();
        });
        const {result: barResult} = renderHook(() => useSearchSidebarCollapse(COLLAPSE_SURFACE.NAVIGATION_BAR));
        let spendRenderCount = 0;
        renderHook(() => {
            spendRenderCount++;
            return useSearchSidebarCollapse(COLLAPSE_SURFACE.SEARCH_SIDEBAR);
        });
        await waitForBatchedUpdates();
        const initialSpendRenderCount = spendRenderCount;

        // When the navigation bar peeks and collapses back
        act(() => {
            barResult.current.startPeek();
        });
        await waitForBatchedUpdates();
        act(() => {
            barResult.current.endPeek();
        });
        await waitForBatchedUpdates();

        // Then Spend consumers do not re-render because their peek snapshot boolean did not change
        expect(spendRenderCount).toBe(initialSpendRenderCount);
    });
});
