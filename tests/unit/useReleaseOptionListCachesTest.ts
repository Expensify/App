import {renderHook} from '@testing-library/react-native';

import useReleaseOptionListCaches from '@hooks/useReleaseOptionListCaches';

/** Called once per release of the cached option lists, whichever cache it belongs to. */
const mockRelease = jest.fn();

/** Whether Search is the tab currently on top, read by the hook on every navigation state change. */
let mockIsSearchTopmostRoute = true;

/** The listener the hook subscribes to the root navigation with. */
let mockNavigationListener: (() => void) | undefined;
const mockUnsubscribe = jest.fn();

jest.mock('@hooks/usePersonalDetailOptions', () => ({
    __esModule: true,
    default: jest.fn(),
    clearPersonalDetailOptionsCache: () => {
        mockRelease();
    },
}));

jest.mock('@hooks/usePersonalDetailSearchSelector/base', () => ({
    __esModule: true,
    default: jest.fn(),
    clearPersonalDetailSearchSelectorCaches: () => {
        mockRelease();
    },
}));

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => ({
    __esModule: true,
    default: () => mockIsSearchTopmostRoute,
}));

jest.mock('@libs/Navigation/helpers/subscribeToRootNavigation', () => ({
    __esModule: true,
    default: (listener: () => void) => {
        mockNavigationListener = listener;
        return mockUnsubscribe;
    },
}));

/** Moves to another tab and reports the navigation state change the hook listens for. */
function leaveSearch() {
    mockIsSearchTopmostRoute = false;
    mockNavigationListener?.();
}

/** Reports a navigation state change that leaves Search on top, e.g. a right hand pane opening over it. */
function navigateWithinSearch() {
    mockNavigationListener?.();
}

function renderReleaseHook() {
    return renderHook(() => useReleaseOptionListCaches());
}

beforeEach(() => {
    jest.clearAllMocks();
    mockIsSearchTopmostRoute = true;
    mockNavigationListener = undefined;
});

describe('useReleaseOptionListCaches', () => {
    it('releases the cached lists when another tab takes over from Search', () => {
        renderReleaseHook();

        leaveSearch();

        expect(mockRelease).toHaveBeenCalled();
    });

    it('keeps the cached lists while Search is still the tab on top', () => {
        renderReleaseHook();

        navigateWithinSearch();

        expect(mockRelease).not.toHaveBeenCalled();
    });

    it('stops listening to navigation once it is no longer used', () => {
        const {unmount} = renderReleaseHook();

        unmount();

        expect(mockUnsubscribe).toHaveBeenCalled();
    });
});
