/* eslint-disable @typescript-eslint/naming-convention */
import {act, renderHook} from '@testing-library/react-native';
import useAutoFocusInput from '@hooks/useAutoFocusInput';

let capturedFocusEffect: (() => void | (() => void)) | undefined;

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (callback: () => void | (() => void)) => {
        capturedFocusEffect = callback;
    },
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [null],
}));

jest.mock('@src/SplashScreenStateContext', () => ({
    useSplashScreenState: () => ({
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        splashScreenState: require('@src/CONST').default.BOOT_SPLASH_STATE.HIDDEN,
    }),
}));

jest.mock('@hooks/useSidePanelState', () => ({
    __esModule: true,
    default: () => ({isSidePanelTransitionEnded: false, shouldHideSidePanel: false}),
}));

jest.mock('@hooks/usePrevious', () => ({
    __esModule: true,
    default: () => false,
}));

jest.mock('@libs/ComposerFocusManager', () => ({
    __esModule: true,
    default: {
        isReadyToFocus: jest.fn(() => Promise.resolve(true)),
    },
}));

jest.mock('@libs/isWindowReadyToFocus', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve(true)),
}));

describe('useAutoFocusInput', () => {
    beforeEach(() => {
        capturedFocusEffect = undefined;
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
    });

    it('schedules the initial focus transition only once across repeated focus callbacks', () => {
        const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

        renderHook(() => useAutoFocusInput());

        expect(typeof capturedFocusEffect).toBe('function');

        let firstCleanup: void | (() => void) | undefined;
        act(() => {
            firstCleanup = capturedFocusEffect?.();
        });
        expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

        act(() => {
            jest.runOnlyPendingTimers();
        });

        const timeoutCallsAfterFirstRun = setTimeoutSpy.mock.calls.length;

        let secondCleanup: void | (() => void) | undefined;
        act(() => {
            secondCleanup = capturedFocusEffect?.();
        });

        expect(setTimeoutSpy.mock.calls.length).toBe(timeoutCallsAfterFirstRun);
        expect(secondCleanup).toBeUndefined();

        act(() => {
            firstCleanup?.();
        });
        setTimeoutSpy.mockRestore();
    });
});
