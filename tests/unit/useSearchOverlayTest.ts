import {act, renderHook} from '@testing-library/react-native';

import useSearchOverlay from '@hooks/useSearchOverlay';

let mockHasPendingSearchWrite = false;
let mockIsFullscreenPreInsertedUnderRHP = false;
let mockIsRevealingPreMountedFullscreen = false;
let mockPreMountedFullscreenRouteKey: string | undefined;
let mockFocusCallback: (() => void) | undefined;

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useFocusEffect: (callback: () => void) => {
        mockFocusCallback = callback;
    },
}));

jest.mock('@libs/pendingSearchWrite', () => ({
    hasPendingSearchWrite: () => mockHasPendingSearchWrite,
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        getIsFullscreenPreInsertedUnderRHP: () => mockIsFullscreenPreInsertedUnderRHP,
        getIsRevealingPreMountedFullscreen: () => mockIsRevealingPreMountedFullscreen,
        getPreMountedFullscreenRouteKey: () => mockPreMountedFullscreenRouteKey,
    },
}));

jest.mock('@components/OnyxListItemProvider', () => ({
    useSession: () => undefined,
}));

jest.mock('@components/Search/SearchStaticList', () => () => null);

jest.mock('@hooks/useOnyx', () => () => [undefined]);

jest.mock('@hooks/useIsVendorColumnAvailable', () => () => false);

jest.mock('@hooks/usePolicyForMovingExpenses', () => () => ({policyForMovingExpensesID: undefined}));

function renderOverlayAndRefocusWithPendingWrite() {
    const {result} = renderHook(() =>
        useSearchOverlay({searchResults: undefined, queryJSON: undefined, shouldUseNarrowLayout: false, isMobileSelectionModeEnabled: false, currentSearchKey: undefined}),
    );
    mockHasPendingSearchWrite = true;
    act(() => {
        mockFocusCallback?.();
    });
    return result;
}

describe('useSearchOverlay', () => {
    beforeEach(() => {
        mockHasPendingSearchWrite = false;
        mockIsFullscreenPreInsertedUnderRHP = false;
        mockIsRevealingPreMountedFullscreen = false;
        mockPreMountedFullscreenRouteKey = undefined;
        mockFocusCallback = undefined;
    });

    it('covers Search with the overlay when it regains focus with a new pending write', () => {
        // Given a mounted Search with nothing pending
        // When it regains focus after a new expense registered a deferred write
        const result = renderOverlayAndRefocusWithPendingWrite();

        // Then the overlay is armed until the real content is ready
        expect(result.current.isOverlayActive).toBe(true);
    });

    it('skips the overlay when the focus comes from revealing a wide pre-mount', () => {
        // Given a wide pre-mount being revealed, which already shows real content
        mockIsRevealingPreMountedFullscreen = true;

        // When the revealed Search focuses with the new pending write
        const result = renderOverlayAndRefocusWithPendingWrite();

        // Then no overlay is shown, because covering real content would only flash
        expect(result.current.isOverlayActive).toBe(false);
    });

    it('skips the overlay when the origin screen regains focus while its wide pre-mount is still live', () => {
        // Given a live wide pre-mount, whose key the reveal would have cleared before the destination focused
        mockPreMountedFullscreenRouteKey = 'pre-mounted-route-key';

        // When Search focuses again with the pending write
        const result = renderOverlayAndRefocusWithPendingWrite();

        // Then no overlay is shown, because this is the unchanged origin, not a revealed destination
        expect(result.current.isOverlayActive).toBe(false);
    });
});
