/** Verifies that Escape cancels a destination pre-mount before dismissing its RHP. */
import {act, render} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';

import EscapeHandler from '@libs/Navigation/AppNavigator/KeyboardShortcutsHandler/EscapeHandler';
import Navigation from '@libs/Navigation/Navigation';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

let mockTopRouteName: string = NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
let mockEscapeCallback: (() => void) | undefined;

jest.mock('@components/WideRHPContextProvider', () => ({
    useWideRHPState: () => ({}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: jest.fn(() => [undefined]),
}));

jest.mock('@libs/KeyboardShortcut', () => ({
    __esModule: true,
    default: {
        subscribe: (_shortcut: string, callback: () => void) => {
            mockEscapeCallback = callback;
            return () => {
                mockEscapeCallback = undefined;
            };
        },
    },
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        removePreInsertedFullscreenIfNeeded: jest.fn(),
        dismissModal: jest.fn(),
    },
    navigationRef: {
        getRootState: () => ({routes: [{key: 'top', name: mockTopRouteName}]}),
    },
}));

describe('EscapeHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockTopRouteName = NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
        jest.mocked(useOnyx).mockReturnValue([undefined, {status: 'loaded'}]);
    });

    it('restores the original tab before dismissing the RHP', () => {
        // Given an open RHP whose pre-mounted destination must not become the visible tab on cancellation
        const calls: string[] = [];
        jest.mocked(Navigation.removePreInsertedFullscreenIfNeeded).mockImplementation(() => calls.push('restore'));
        jest.mocked(Navigation.dismissModal).mockImplementation(() => {
            calls.push('dismiss');
        });
        render(<EscapeHandler />);

        // When Escape cancels the flow without submitting
        act(() => mockEscapeCallback?.());

        // Then restoration happens while the RHP still covers the destination, not during later unmount cleanup
        expect(calls).toEqual(['restore', 'dismiss']);
    });

    it('does not start pre-mount cleanup when Escape is pressed outside an RHP', () => {
        // Given a root screen with no side modal to cancel
        mockTopRouteName = SCREENS.HOME;
        render(<EscapeHandler />);

        // When Escape is pressed
        act(() => mockEscapeCallback?.());

        // Then it does not restore a saved tab belonging to some other flow
        expect(Navigation.removePreInsertedFullscreenIfNeeded).not.toHaveBeenCalled();
    });
});
