import {act, renderHook} from '@testing-library/react-native';

import type {DiscardChangesConfirmation} from '@hooks/useDiscardChangesConfirmation/types';
import type UseDiscardChangesConfirmationOptions from '@hooks/useDiscardChangesConfirmation/types';

import {BackHandler} from 'react-native';

type MockBeforeRemoveEvent = {data: {action: {type: string}}};

let mockPreventRemoveFlag: boolean | undefined;
let mockPreventRemoveCallback: ((e: MockBeforeRemoveEvent) => void) | undefined;
let mockIsFocused = true;
jest.mock('@react-navigation/native', () => ({
    usePreventRemove: (flag: boolean, callback: (e: MockBeforeRemoveEvent) => void) => {
        mockPreventRemoveFlag = flag;
        mockPreventRemoveCallback = callback;
    },
    useIsFocused: () => mockIsFocused,
    // The hook reads `route.name` to key its tab-switch guard
    useRoute: () => ({name: 'test-route'}),
    // Focus effects behave like plain effects in these tests — the screen is always focused
    useFocusEffect: (callback: () => undefined | (() => void)) => {
        jest.requireActual<{useEffect: (effect: () => undefined | (() => void), deps: unknown[]) => void}>('react').useEffect(callback, [callback]);
    },
}));

const mockShowConfirmModal = jest.fn();
jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@components/Modal/Global/ModalContext', () => ({
    ModalActions: {CONFIRM: 'CONFIRM', CLOSE: 'CLOSE'},
}));

jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {warn: jest.fn()},
}));

const mockNavigationDispatch = jest.fn();
const mockNavigationGoBack = jest.fn();
jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        get current() {
            return {dispatch: mockNavigationDispatch, goBack: mockNavigationGoBack};
        },
    },
}));

type DiscardHookModule = {default: (options: UseDiscardChangesConfirmationOptions) => DiscardChangesConfirmation};

const useDiscardChangesConfirmation = jest.requireActual<DiscardHookModule>('@hooks/useDiscardChangesConfirmation/index.native.ts').default;

describe('useDiscardChangesConfirmation (native)', () => {
    let backHandlerSpy: jest.SpyInstance;
    let hardwareBackCallback: (() => boolean | null | undefined) | undefined;
    const removeSubscription = jest.fn();
    let resolveModal: ((result: {action: string}) => void) | undefined;

    const renderDiscardHook = (getHasUnsavedChanges: () => boolean) => renderHook(() => useDiscardChangesConfirmation({getHasUnsavedChanges}));

    const pressHardwareBack = (): boolean | null | undefined => {
        let consumed: boolean | null | undefined;
        act(() => {
            consumed = hardwareBackCallback?.();
        });
        return consumed;
    };

    const resolveModalWith = async (action: string) => {
        await act(async () => {
            resolveModal?.({action});
            await Promise.resolve();
            await Promise.resolve();
            await Promise.resolve();
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockPreventRemoveFlag = undefined;
        mockPreventRemoveCallback = undefined;
        mockIsFocused = true;
        hardwareBackCallback = undefined;
        resolveModal = undefined;
        backHandlerSpy = jest.spyOn(BackHandler, 'addEventListener').mockImplementation((event, handler) => {
            hardwareBackCallback = handler;
            return {remove: removeSubscription};
        });
        mockShowConfirmModal.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveModal = resolve;
                }),
        );
    });

    afterEach(() => {
        backHandlerSpy.mockRestore();
    });

    describe('hardware back (tab-switch case: no removal, usePreventRemove blind)', () => {
        it('consumes the back press and shows the modal when the form is dirty', () => {
            renderDiscardHook(() => true);

            expect(pressHardwareBack()).toBe(true);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
            expect(mockNavigationGoBack).not.toHaveBeenCalled();
        });

        it('lets the back press through when the form is clean', () => {
            renderDiscardHook(() => false);

            expect(pressHardwareBack()).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('lets the back press through after notifySaving, and prompts again once the save ends', () => {
            const {result} = renderDiscardHook(() => true);

            act(() => result.current.notifySaving());
            expect(pressHardwareBack()).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();

            act(() => result.current.notifySaving(false));
            expect(pressHardwareBack()).toBe(true);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('lets the back press through when the screen is not focused, even with a dirty form', () => {
            mockIsFocused = false;
            renderDiscardHook(() => true);

            expect(pressHardwareBack()).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('swallows back presses while the modal is open without stacking a second modal', () => {
            renderDiscardHook(() => true);

            pressHardwareBack();

            expect(pressHardwareBack()).toBe(true);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('replays the back with goBack on confirm and keeps prevention armed', async () => {
            renderDiscardHook(() => true);

            pressHardwareBack();
            await resolveModalWith('CONFIRM');

            expect(mockNavigationGoBack).toHaveBeenCalledTimes(1);
            expect(mockNavigationDispatch).not.toHaveBeenCalled();
            expect(mockPreventRemoveFlag).toBe(true);
        });

        it('re-dispatches a beforeRemove fired during the goBack replay instead of re-prompting', async () => {
            renderDiscardHook(() => true);

            pressHardwareBack();

            // On the initial tab the replayed goBack pops the screen, which fires beforeRemove synchronously
            mockNavigationGoBack.mockImplementationOnce(() => {
                mockPreventRemoveCallback?.({data: {action: {type: 'POP'}}});
            });

            await resolveModalWith('CONFIRM');

            expect(mockNavigationDispatch).toHaveBeenCalledWith({type: 'POP'});
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('stays put on cancel and prompts again on the next back press', async () => {
            renderDiscardHook(() => true);
            const onCancel = jest.fn();
            renderHook(() => useDiscardChangesConfirmation({getHasUnsavedChanges: () => true, onCancel}));

            pressHardwareBack();
            await resolveModalWith('CLOSE');

            expect(onCancel).toHaveBeenCalledTimes(1);
            expect(mockNavigationGoBack).not.toHaveBeenCalled();
            expect(mockNavigationDispatch).not.toHaveBeenCalled();

            expect(pressHardwareBack()).toBe(true);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(2);
        });

        it('removes the hardware back subscription on unmount', () => {
            const {unmount} = renderDiscardHook(() => true);

            unmount();

            expect(removeSubscription).toHaveBeenCalled();
        });
    });

    describe('usePreventRemove (removal case: header back, in-app pop)', () => {
        const invokeBeforeRemove = (type: string) => {
            act(() => {
                mockPreventRemoveCallback?.({data: {action: {type}}});
            });
        };

        it('shows the modal and dispatches the blocked action on confirm', async () => {
            renderDiscardHook(() => true);

            invokeBeforeRemove('POP');
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);

            await resolveModalWith('CONFIRM');

            expect(mockNavigationDispatch).toHaveBeenCalledWith({type: 'POP'});
            expect(mockNavigationGoBack).not.toHaveBeenCalled();
        });

        it('allows and replays the action immediately when the form is clean', () => {
            renderDiscardHook(() => false);

            invokeBeforeRemove('POP');

            expect(mockShowConfirmModal).not.toHaveBeenCalled();
            expect(mockNavigationDispatch).toHaveBeenCalledWith({type: 'POP'});
        });

        it('ignores beforeRemove while the modal is already open', () => {
            renderDiscardHook(() => true);

            pressHardwareBack();
            invokeBeforeRemove('POP');

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('clears the blocked action on cancel so a later hardware-back confirm uses goBack', async () => {
            renderDiscardHook(() => true);

            invokeBeforeRemove('POP');
            await resolveModalWith('CLOSE');

            pressHardwareBack();
            await resolveModalWith('CONFIRM');

            expect(mockNavigationDispatch).not.toHaveBeenCalled();
            expect(mockNavigationGoBack).toHaveBeenCalledTimes(1);
        });
    });
});
