import {act, renderHook} from '@testing-library/react-native';

import useNavigationBarWidth from '@components/Navigation/FlatNavigationBar/useNavigationBarWidth';
import {COLLAPSE_SURFACE, useSearchSidebarCollapse} from '@components/Navigation/SearchSidebarCollapseStore';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

let mockShouldUseFlatNavigationBar = true;
jest.mock('@components/Navigation/FlatNavigationBar/useShouldUseFlatNavigationBar', () => ({
    __esModule: true,
    default: () => mockShouldUseFlatNavigationBar,
}));

describe('useNavigationBarWidth', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockShouldUseFlatNavigationBar = true;
    });

    afterEach(async () => {
        // The peek lives in module state, so a test that leaves one running would leak it into the next.
        const {result, unmount} = renderHook(() => useSearchSidebarCollapse(COLLAPSE_SURFACE.NAVIGATION_BAR));
        act(() => {
            result.current.endPeek();
        });
        unmount();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });
    });

    it('returns the standard navigationTabBarSize when flat navigation is not active', () => {
        // Given flat navigation disabled
        mockShouldUseFlatNavigationBar = false;

        // When reading the navigation bar width
        const {result} = renderHook(() => useNavigationBarWidth());

        // Then it returns the classic icon bar width
        expect(result.current).toBe(variables.navigationTabBarSize);
    });

    it('returns expanded width when flat navigation is active and not collapsed', async () => {
        // Given flat navigation active and no collapsed state saved

        // When reading the navigation bar width
        const {result} = renderHook(() => useNavigationBarWidth());
        await waitForBatchedUpdates();

        // Then it returns the full flat navigation bar width
        expect(result.current).toBe(variables.flatNavigationBarWidth);
    });

    it('returns collapsed width when flat navigation is collapsed', async () => {
        // Given flat navigation collapsed in Onyx
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
            await waitForBatchedUpdates();
        });

        // When reading the navigation bar width
        const {result} = renderHook(() => useNavigationBarWidth());
        await waitForBatchedUpdates();

        // Then it returns the skinny rail width
        expect(result.current).toBe(variables.flatNavigationBarCollapsedWidth);
    });

    it('does not re-render or change value when a surface starts or ends peeking', async () => {
        // Given flat navigation collapsed
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_SEARCH_SIDEBAR, {isCollapsed: true});
            await waitForBatchedUpdates();
        });

        let renderCount = 0;
        const {result} = renderHook(() => {
            renderCount += 1;
            return useNavigationBarWidth();
        });
        await waitForBatchedUpdates();
        const initialRenderCount = renderCount;

        // When peeking starts on the navigation bar
        const {result: surfaceStore} = renderHook(() => useSearchSidebarCollapse(COLLAPSE_SURFACE.NAVIGATION_BAR));
        act(() => {
            surfaceStore.current.startPeek();
        });
        await waitForBatchedUpdates();

        // Then the width stays the collapsed layout width, since a peek overlays the content instead of pushing it, and the hook does not re-render
        expect(result.current).toBe(variables.flatNavigationBarCollapsedWidth);
        expect(renderCount).toBe(initialRenderCount);

        // When peeking ends
        act(() => {
            surfaceStore.current.endPeek();
        });
        await waitForBatchedUpdates();

        // Then it still does not re-render
        expect(renderCount).toBe(initialRenderCount);
    });
});
