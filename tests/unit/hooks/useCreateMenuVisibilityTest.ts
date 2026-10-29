import {act, renderHook} from '@testing-library/react-native';

import useDragoverDismiss from '@hooks/useDragoverDismiss';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import useCreateMenuVisibility from '@pages/inbox/sidebar/FABPopoverContent/useCreateMenuVisibility';

import {useFocusEffect, useIsFocused} from '@react-navigation/native';

import createMock from '../../utils/createMock';

jest.mock('@react-navigation/native', () => ({
    useIsFocused: jest.fn(),
    useFocusEffect: jest.fn(),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useDragoverDismiss', () => ({
    __esModule: true,
    default: jest.fn(),
}));

function mockScreen({shouldUseNarrowLayout, isFocused}: {shouldUseNarrowLayout: boolean; isFocused: boolean}) {
    jest.mocked(useResponsiveLayout).mockReturnValue(createMock<ReturnType<typeof useResponsiveLayout>>({shouldUseNarrowLayout}));
    jest.mocked(useIsFocused).mockReturnValue(isFocused);
}

/** Runs the cleanup of the last focus effect the hook registered, which is what React Navigation does on blur. */
function blurScreen() {
    const effect = jest.mocked(useFocusEffect).mock.calls.at(-1)?.[0];
    const cleanup = effect?.();
    act(() => {
        cleanup?.();
    });
}

/** Calls the dismiss callback the hook handed to the dragover listener, which is what a file drag over the page does. */
function dragOverPage() {
    const dismiss = jest.mocked(useDragoverDismiss).mock.calls.at(-1)?.[1];
    act(() => {
        dismiss?.();
    });
}

describe('useCreateMenuVisibility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockScreen({shouldUseNarrowLayout: false, isFocused: true});
    });

    it('opens on the first toggle and closes on the second', () => {
        // Given a closed menu on a wide layout
        const {result} = renderHook(() => useCreateMenuVisibility());

        // When the button toggles it once
        act(() => result.current.toggleCreateMenu());

        // Then it is open and visible
        expect(result.current.isCreateMenuActive).toBe(true);
        expect(result.current.isCreateMenuVisible).toBe(true);

        // When the button toggles it again
        act(() => result.current.toggleCreateMenu());

        // Then it closes, so one button both opens and closes the menu
        expect(result.current.isCreateMenuActive).toBe(false);
    });

    it('opens only after the step that runs before showing settles', async () => {
        // Given a button that has to measure where the menu goes before opening it
        const {result} = renderHook(() => useCreateMenuVisibility());
        let finishMeasuring: () => void = () => {};
        const measure = () =>
            new Promise<void>((resolve) => {
                finishMeasuring = resolve;
            });

        // When it toggles the menu
        act(() => result.current.toggleCreateMenu(measure));

        // Then the menu waits for the measurement, so it never opens at a stale position
        expect(result.current.isCreateMenuActive).toBe(false);

        // When the measurement finishes
        await act(async () => {
            finishMeasuring();
            await Promise.resolve();
        });

        // Then the menu opens
        expect(result.current.isCreateMenuActive).toBe(true);
    });

    it('does not open on a narrow layout while the screen is out of focus', () => {
        // Given a narrow layout whose screen is not focused
        mockScreen({shouldUseNarrowLayout: true, isFocused: false});
        const {result} = renderHook(() => useCreateMenuVisibility());

        // When the menu is toggled
        act(() => result.current.toggleCreateMenu());

        // Then it stays closed, because the narrow bar of a screen in the background must not open a menu over another screen
        expect(result.current.isCreateMenuActive).toBe(false);
        expect(result.current.isCreateMenuVisible).toBe(false);
    });

    it('closes when the screen loses focus', () => {
        // Given an open menu
        const {result} = renderHook(() => useCreateMenuVisibility());
        act(() => result.current.toggleCreateMenu());

        // When the user navigates away and the screen blurs
        blurScreen();

        // Then the menu closes, so it is not left open on a screen the user has left
        expect(result.current.isCreateMenuActive).toBe(false);
    });

    it('closes when a file is dragged over the page', () => {
        // Given an open menu
        const {result} = renderHook(() => useCreateMenuVisibility());
        act(() => result.current.toggleCreateMenu());
        expect(jest.mocked(useDragoverDismiss)).toHaveBeenLastCalledWith(true, expect.any(Function));

        // When a file drag passes over the page
        dragOverPage();

        // Then the menu closes, so it does not cover the drop zones
        expect(result.current.isCreateMenuActive).toBe(false);
    });
});
