/* eslint-disable @typescript-eslint/naming-convention */
import {act, renderHook} from '@testing-library/react-native';
import type {TextInput} from 'react-native';
import {InteractionManager} from 'react-native';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import isWindowReadyToFocus from '@libs/isWindowReadyToFocus';
import CONST from '@src/CONST';

type TransitionEndListener = (event?: {data?: {closing?: boolean}}) => void;

let capturedFocusEffect: (() => void | (() => void)) | undefined;
let capturedTransitionEndListener: TransitionEndListener | undefined;

const mockAddListener = jest.fn();
const mockSidePanelState = {isSidePanelTransitionEnded: false, shouldHideSidePanel: false};

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (callback: () => void | (() => void)) => {
        capturedFocusEffect = callback;
    },
    useNavigation: () => ({
        addListener: mockAddListener,
    }),
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
    default: () => mockSidePanelState,
}));

jest.mock('@libs/ComposerFocusManager', () => ({
    __esModule: true,
    default: {
        isReadyToFocus: jest.fn(() => Promise.resolve(true)),
    },
}));

jest.mock('@libs/isWindowReadyToFocus', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve()),
}));

const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
let originalActiveElementDescriptor: PropertyDescriptor | undefined;
let activeElement: unknown;

function createDeferredPromise() {
    let resolvePromise: (() => void) | undefined;
    const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
    });

    return {
        promise,
        resolve: () => resolvePromise?.(),
    };
}

function createInput() {
    const focus = jest.fn();

    return {
        focus,
        input: {focus} as unknown as TextInput,
    };
}

async function flushPromises() {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
}

describe('useAutoFocusInput', () => {
    beforeAll(() => {
        if (!globalThis.document) {
            Object.defineProperty(globalThis, 'document', {
                value: {body: {}, documentElement: {}} as Document,
                configurable: true,
            });
        }

        originalActiveElementDescriptor = Object.getOwnPropertyDescriptor(document, 'activeElement');
        Object.defineProperty(document, 'activeElement', {
            configurable: true,
            get: () => activeElement as Element | null,
        });
    });

    beforeEach(() => {
        capturedFocusEffect = undefined;
        capturedTransitionEndListener = undefined;
        activeElement = document.body;
        mockSidePanelState.isSidePanelTransitionEnded = false;
        mockSidePanelState.shouldHideSidePanel = false;

        jest.clearAllMocks();
        jest.useFakeTimers();

        mockAddListener.mockImplementation((eventName: string, callback: TransitionEndListener) => {
            if (eventName === 'transitionEnd') {
                capturedTransitionEndListener = callback;
            }
            return jest.fn();
        });

        jest.spyOn(InteractionManager, 'runAfterInteractions').mockImplementation(((task?: (() => void) | {gen?: () => void}) => {
            if (typeof task === 'function') {
                task();
            } else {
                task?.gen?.();
            }

            return {
                then: jest.fn(() => Promise.resolve()),
                done: jest.fn(),
                cancel: jest.fn(),
            };
        }) as unknown as typeof InteractionManager.runAfterInteractions);
    });

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    afterAll(() => {
        if (originalActiveElementDescriptor) {
            Object.defineProperty(document, 'activeElement', originalActiveElementDescriptor);
        }

        if (originalDocumentDescriptor) {
            Object.defineProperty(globalThis, 'document', originalDocumentDescriptor);
            return;
        }

        Reflect.deleteProperty(globalThis as typeof globalThis & {document?: Document}, 'document');
    });

    it('autofocuses after transitionEnd when no other element owns focus', async () => {
        const {focus, input} = createInput();
        const {result} = renderHook(() => useAutoFocusInput());

        act(() => {
            result.current.inputCallbackRef(input);
            capturedFocusEffect?.();
        });

        expect(mockAddListener).toHaveBeenCalledWith('transitionEnd', expect.any(Function));

        await act(async () => {
            capturedTransitionEndListener?.({data: {closing: false}});
        });
        await flushPromises();

        expect(focus).toHaveBeenCalledTimes(1);
    });

    it('autofocuses via timeout fallback when transitionEnd does not fire', async () => {
        const {focus, input} = createInput();
        const {result} = renderHook(() => useAutoFocusInput());

        act(() => {
            result.current.inputCallbackRef(input);
            capturedFocusEffect?.();
            jest.advanceTimersByTime(CONST.SCREEN_TRANSITION_END_TIMEOUT);
        });
        await flushPromises();

        expect(focus).toHaveBeenCalledTimes(1);
    });

    it('re-arms autofocus on a later screen focus', async () => {
        const {focus, input} = createInput();
        const {result} = renderHook(() => useAutoFocusInput());

        act(() => {
            result.current.inputCallbackRef(input);
        });

        let cleanup: void | (() => void) | undefined;
        act(() => {
            cleanup = capturedFocusEffect?.();
        });

        await act(async () => {
            capturedTransitionEndListener?.({data: {closing: false}});
        });
        await flushPromises();

        act(() => {
            cleanup?.();
            cleanup = capturedFocusEffect?.();
        });

        await act(async () => {
            capturedTransitionEndListener?.({data: {closing: false}});
        });
        await flushPromises();

        expect(focus).toHaveBeenCalledTimes(2);
    });

    it('does not steal focus if another element becomes active before focus executes', async () => {
        const deferred = createDeferredPromise();
        jest.mocked(isWindowReadyToFocus).mockReturnValueOnce(deferred.promise);

        const {focus, input} = createInput();
        const otherFocusedElement = {} as HTMLElement;
        const {result} = renderHook(() => useAutoFocusInput());

        act(() => {
            result.current.inputCallbackRef(input);
            capturedFocusEffect?.();
        });

        await act(async () => {
            capturedTransitionEndListener?.({data: {closing: false}});
        });

        activeElement = otherFocusedElement;

        await act(async () => {
            deferred.resolve();
            await deferred.promise;
        });

        expect(focus).not.toHaveBeenCalled();
    });

    it('recovers after skipping focus while another element is active', async () => {
        const {focus, input} = createInput();
        const otherFocusedElement = {} as HTMLElement;
        const {result} = renderHook(() => useAutoFocusInput());

        act(() => {
            result.current.inputCallbackRef(input);
            capturedFocusEffect?.();
        });

        activeElement = otherFocusedElement;

        await act(async () => {
            capturedTransitionEndListener?.({data: {closing: false}});
        });
        await flushPromises();

        expect(focus).not.toHaveBeenCalled();

        activeElement = document.body;

        await act(async () => {
            capturedTransitionEndListener?.({data: {closing: false}});
        });
        await flushPromises();

        expect(focus).toHaveBeenCalledTimes(1);
    });

    it('still autofocuses when the side panel finishes closing', async () => {
        const {focus, input} = createInput();
        const {result, rerender} = renderHook(() => useAutoFocusInput());

        act(() => {
            result.current.inputCallbackRef(input);
        });

        mockSidePanelState.shouldHideSidePanel = true;
        rerender(undefined);

        mockSidePanelState.isSidePanelTransitionEnded = true;
        rerender(undefined);
        await flushPromises();

        expect(jest.mocked(ComposerFocusManager.isReadyToFocus)).toHaveBeenCalled();
        expect(jest.mocked(isWindowReadyToFocus)).toHaveBeenCalled();
        expect(focus).toHaveBeenCalledTimes(1);
    });
});
