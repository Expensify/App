import useBlurOnKeyboardHide from '@hooks/useBlurOnKeyboardHide/index.android';

import type {RefObject} from 'react';
import type {KeyboardEventData} from 'react-native-keyboard-controller';

import React from 'react';
import {View} from 'react-native';

import renderScreenWithCover from '../../utils/ScreenCoverHarness';

const mockKeyboardListeners: Record<string, Array<(event: KeyboardEventData) => void>> = {};
let mockIsKeyboardVisible = false;

jest.mock('react-native-keyboard-controller', () => ({
    KeyboardController: {
        isVisible: () => mockIsKeyboardVisible,
    },
    KeyboardEvents: {
        addListener: (event: string, handler: (eventData: KeyboardEventData) => void) => {
            (mockKeyboardListeners[event] ??= []).push(handler);
            return {
                remove: () => {
                    mockKeyboardListeners[event] = (mockKeyboardListeners[event] ?? []).filter((registered) => registered !== handler);
                },
            };
        },
    },
}));

/** Moves the keyboard the way the platform does: what the input can read changes, and whoever listens hears it. */
function emitKeyboardEvent(event: 'keyboardDidShow' | 'keyboardDidHide', height: number) {
    mockIsKeyboardVisible = height > 0;
    const eventData: KeyboardEventData = {height, duration: 0, timestamp: 0, target: -1, type: 'default', appearance: 'light'};
    for (const handler of mockKeyboardListeners[event] ?? []) {
        handler(eventData);
    }
}

function ComposerProbe({inputRef}: {inputRef: RefObject<{blur: () => void} | null>}) {
    useBlurOnKeyboardHide(inputRef);
    return <View testID="concierge-composer" />;
}

/**
 * The Concierge composer on Home uses this hook, because Android leaves an EditText focused when the keyboard goes
 * away on its own. A hidden screen has no keyboard listener, so the keyboard the navigation to an RHP dismisses is
 * never heard, and the composer came back from the reveal still focused with no keyboard on screen.
 */
describe('useBlurOnKeyboardHide on Android', () => {
    beforeEach(() => {
        for (const event of Object.keys(mockKeyboardListeners)) {
            delete mockKeyboardListeners[event];
        }
        mockIsKeyboardVisible = false;
    });

    it('blurs the input whose keyboard went away while the screen was covered', async () => {
        const blur = jest.fn();
        const screenCover = renderScreenWithCover(<ComposerProbe inputRef={{current: {blur}}} />);
        emitKeyboardEvent('keyboardDidShow', 300);

        await screenCover.hide();
        emitKeyboardEvent('keyboardDidHide', 0);
        await screenCover.reveal();

        expect(blur).toHaveBeenCalledTimes(1);
        screenCover.unmount();
    });

    it('leaves an input that never had the keyboard alone', async () => {
        const blur = jest.fn();
        const screenCover = renderScreenWithCover(<ComposerProbe inputRef={{current: {blur}}} />);

        await screenCover.hide();
        await screenCover.reveal();

        expect(blur).not.toHaveBeenCalled();
        screenCover.unmount();
    });
});
