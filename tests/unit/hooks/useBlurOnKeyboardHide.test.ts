import {renderHook} from '@testing-library/react-native';

import useBlurOnKeyboardHide from '@hooks/useBlurOnKeyboardHide/index.android';

import type {KeyboardEventData} from 'react-native-keyboard-controller';

const mockKeyboardDidHideListeners: Array<(e: KeyboardEventData) => void> = [];
const mockRemove = jest.fn();

jest.mock('react-native-keyboard-controller', () => ({
    KeyboardEvents: {
        addListener: jest.fn((event: string, handler: (e: KeyboardEventData) => void) => {
            if (event === 'keyboardDidHide') {
                mockKeyboardDidHideListeners.push(handler);
            }
            return {remove: mockRemove};
        }),
    },
}));

function emitKeyboardDidHide(height: number) {
    const event: KeyboardEventData = {height, duration: 0, timestamp: 0, target: -1, type: 'default', appearance: 'light'};
    for (const handler of mockKeyboardDidHideListeners) {
        handler(event);
    }
}

describe('useBlurOnKeyboardHide', () => {
    beforeEach(() => {
        mockKeyboardDidHideListeners.length = 0;
        jest.clearAllMocks();
    });

    it('blurs the ref only when keyboardDidHide reports zero height', () => {
        const blur = jest.fn();
        renderHook(() => useBlurOnKeyboardHide({current: {blur}}));

        emitKeyboardDidHide(100);
        expect(blur).not.toHaveBeenCalled();

        emitKeyboardDidHide(0);
        expect(blur).toHaveBeenCalledTimes(1);
    });
});
