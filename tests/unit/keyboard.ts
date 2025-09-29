import CONST from '@src/CONST';
import type {SimplifiedKeyboardEvent} from '@src/utils/keyboard';

const mockKeyboardListeners: Record<string, Array<(e: SimplifiedKeyboardEvent) => void>> = {};
const mockKeyboardControllerListeners: Record<string, Array<(e: SimplifiedKeyboardEvent) => void>> = {};
const mockDismissKeyboard = jest.fn();
const mockGetPlatform = jest.fn();

jest.mock('react-native', () => ({
    Keyboard: {
        dismiss: mockDismissKeyboard,
        addListener: jest.fn((event: string, handler: (e: SimplifiedKeyboardEvent) => void) => {
            mockKeyboardListeners[event] = mockKeyboardListeners[event] || [];
            mockKeyboardListeners[event].push(handler);
            return {
                remove: jest.fn(() => {
                    mockKeyboardListeners[event] = mockKeyboardListeners[event].filter((h) => h !== handler);
                }),
            };
        }),
    },
}));

// Mock react-native-keyboard-controller
jest.mock('react-native-keyboard-controller', () => ({
    KeyboardEvents: {
        addListener: jest.fn((event: string, handler: (e: SimplifiedKeyboardEvent) => void) => {
            mockKeyboardControllerListeners[event] = mockKeyboardControllerListeners[event] || [];
            mockKeyboardControllerListeners[event].push(handler);
            return {
                remove: jest.fn(() => {
                    mockKeyboardControllerListeners[event] = mockKeyboardControllerListeners[event].filter((h) => h !== handler);
                }),
            };
        }),
    },
}));

jest.mock('@libs/getPlatform', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: mockGetPlatform,
}));

jest.mock('@src/CONST', () => ({
    PLATFORM: {
        ANDROID: 'android',
        IOS: 'ios',
    },
}));

// Helper to trigger keyboard events
const triggerKeyboardEvent = (event: string, data: SimplifiedKeyboardEvent = {}) => {
    (mockKeyboardListeners[event] || []).forEach((handler) => handler(data));
};

const triggerKeyboardControllerEvent = (event: string, data: SimplifiedKeyboardEvent = {}) => {
    (mockKeyboardControllerListeners[event] || []).forEach((handler) => handler(data));
};

// Helper to clear listeners
const clearListeners = () => {
    Object.keys(mockKeyboardListeners).forEach((key) => {
        mockKeyboardListeners[key] = [];
    });
    Object.keys(mockKeyboardControllerListeners).forEach((key) => {
        mockKeyboardControllerListeners[key] = [];
    });
};

describe('Keyboard utils', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let utils: {dismiss: () => Promise<void>; dismissKeyboardAndExecute: (cb: () => void) => Promise<void>};

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        clearListeners();
        // Clear module cache and reimport to reset isVisible state
        jest.resetModules();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        utils = require('@src/utils/keyboard').default as {dismiss: () => Promise<void>; dismissKeyboardAndExecute: (cb: () => void) => Promise<void>};
    });

    describe('dismiss', () => {
        it('should resolve immediately when keyboard is not visible', async () => {
            // Keyboard starts as not visible (isVisible = false)
            await expect(utils.dismiss()).resolves.toBeUndefined();
            expect(mockDismissKeyboard).not.toHaveBeenCalled();
        });

        it('should wait for keyboardDidHide event when keyboard is visible', async () => {
            triggerKeyboardEvent('keyboardDidShow');

            const dismissPromise = utils.dismiss();

            // Promise should not resolve immediately
            let resolved = false;
            dismissPromise.then(() => {
                resolved = true;
            });

            expect(resolved).toBe(false);
            expect(mockDismissKeyboard).toHaveBeenCalledTimes(1);

            triggerKeyboardEvent('keyboardDidHide');

            await dismissPromise;
            expect(resolved).toBe(true);
        });

        it('should remove listener after keyboard is hidden', async () => {
            triggerKeyboardEvent('keyboardDidShow');

            const dismissPromise = utils.dismiss();

            const subscriptionsCount = mockKeyboardListeners.keyboardDidHide.length;

            triggerKeyboardEvent('keyboardDidHide');
            await dismissPromise;

            expect(mockKeyboardListeners.keyboardDidHide.length).toBe(subscriptionsCount - 1);
        });

        it('should handle multiple concurrent dismiss calls', async () => {
            triggerKeyboardEvent('keyboardDidShow');

            const promise1 = utils.dismiss();
            const promise2 = utils.dismiss();

            triggerKeyboardEvent('keyboardDidHide');

            await expect(Promise.all([promise1, promise2])).resolves.toEqual([undefined, undefined]);
        });
    });

    describe('dismissKeyboardAndExecute', () => {
        it('should execute callback immediately when keyboard is not visible', async () => {
            const callback = jest.fn();
            mockGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);

            await utils.dismissKeyboardAndExecute(callback);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(mockDismissKeyboard).not.toHaveBeenCalled();
        });

        it('should execute callback immediately when platform is not Android', async () => {
            triggerKeyboardEvent('keyboardDidShow');

            const callback = jest.fn();
            mockGetPlatform.mockReturnValue(CONST.PLATFORM.IOS);

            await utils.dismissKeyboardAndExecute(callback);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(mockDismissKeyboard).not.toHaveBeenCalled();
        });

        it('should wait for keyboardDidHide with height=0 on Android when keyboard is visible', async () => {
            triggerKeyboardEvent('keyboardDidShow');

            const callback = jest.fn();
            mockGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);

            const executePromise = utils.dismissKeyboardAndExecute(callback);

            expect(callback).not.toHaveBeenCalled();
            expect(mockDismissKeyboard).toHaveBeenCalledTimes(1);

            triggerKeyboardControllerEvent('keyboardDidHide', {height: 0});

            await executePromise;

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should ignore keyboardDidHide event when height is not 0', async () => {
            triggerKeyboardEvent('keyboardDidShow');

            const callback = jest.fn();
            mockGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);

            const executePromise = utils.dismissKeyboardAndExecute(callback);

            // Trigger hide with height != 0
            triggerKeyboardControllerEvent('keyboardDidHide', {height: 100});

            await executePromise;

            expect(callback).not.toHaveBeenCalled();

            // Trigger hide with height = 0
            triggerKeyboardControllerEvent('keyboardDidHide', {height: 0});

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should remove listener after callback is executed', async () => {
            triggerKeyboardEvent('keyboardDidShow');

            const callback = jest.fn();
            mockGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);

            const executePromise = utils.dismissKeyboardAndExecute(callback);

            const subscriptionsCount = mockKeyboardControllerListeners.keyboardDidHide.length;

            expect(callback).not.toHaveBeenCalled();

            triggerKeyboardControllerEvent('keyboardDidHide', {height: 0});
            expect(mockDismissKeyboard).toHaveBeenCalledTimes(1);

            await executePromise;

            expect(callback).toHaveBeenCalledTimes(1);

            expect(mockKeyboardControllerListeners.keyboardDidHide.length).toBe(subscriptionsCount - 1);
        });

        it('should handle multiple events before height=0', async () => {
            triggerKeyboardEvent('keyboardDidShow');

            const callback = jest.fn();
            mockGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);

            const executePromise = utils.dismissKeyboardAndExecute(callback);

            // Trigger multiple events with wrong height
            triggerKeyboardControllerEvent('keyboardDidHide', {height: 200});
            triggerKeyboardControllerEvent('keyboardDidHide', {height: 150});
            triggerKeyboardControllerEvent('keyboardDidHide', {height: 50});

            await executePromise;
            expect(callback).not.toHaveBeenCalled();

            // Finally trigger with height=0
            triggerKeyboardControllerEvent('keyboardDidHide', {height: 0});

            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('isVisible state management', () => {
        it('should track keyboard visibility across multiple show/hide events', async () => {
            // Initially not visible
            await expect(utils.dismiss()).resolves.toBeUndefined();

            // Show keyboard
            triggerKeyboardEvent('keyboardDidShow');
            const promise1 = utils.dismiss();
            triggerKeyboardEvent('keyboardDidHide');
            await promise1;

            // Show again
            triggerKeyboardEvent('keyboardDidShow');
            const promise2 = utils.dismiss();
            triggerKeyboardEvent('keyboardDidHide');
            await promise2;

            // Should be not visible now
            await expect(utils.dismiss()).resolves.toBeUndefined();
        });

        it('should properly track state when dismiss is called while keyboard is showing', async () => {
            triggerKeyboardEvent('keyboardDidShow');

            const dismissPromise = utils.dismiss();

            // While waiting, keyboard hides
            triggerKeyboardEvent('keyboardDidHide');

            await dismissPromise;

            // Should be marked as not visible now
            await expect(utils.dismiss()).resolves.toBeUndefined();
        });
    });
});
