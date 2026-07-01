import {act, renderHook} from '@testing-library/react-native';
import type {DiscardChangesConfirmation} from '@hooks/useDiscardChangesConfirmation/types';
import type UseDiscardChangesConfirmationOptions from '@hooks/useDiscardChangesConfirmation/types';

type MockBeforeRemoveEvent = {
    data: {action: {type: string}};
    defaultPrevented: boolean;
    preventDefault: () => void;
};

let mockBeforeRemoveCallback: ((e: MockBeforeRemoveEvent) => void) | undefined;
jest.mock('@hooks/useBeforeRemove', () => ({
    __esModule: true,
    default: (callback: (e: MockBeforeRemoveEvent) => void) => {
        mockBeforeRemoveCallback = callback;
    },
}));

let mockIsFocused = true;
jest.mock('@react-navigation/native', () => ({
    useIsFocused: () => mockIsFocused,
    // The hook reads `route.name` to key its tab-switch guard
    useRoute: () => ({name: 'test-route'}),
    useFocusEffect: (callback: () => undefined | (() => void)) => {
        jest.requireActual<{useEffect: (effect: () => undefined | (() => void), deps: unknown[]) => void}>('react').useEffect(callback, []);
    },
}));

const mockShowConfirmModal = jest.fn();
const mockCloseModal = jest.fn();
jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal, closeModal: mockCloseModal}),
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

// Runs its callback immediately so the confirm navigation is synchronous in tests
jest.mock('@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue', () => ({
    __esModule: true,
    default: (callback: () => void) => callback(),
}));

const mockNavigationDispatch = jest.fn();
jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        get current() {
            return {dispatch: mockNavigationDispatch, goBack: jest.fn()};
        },
    },
}));

type DiscardHookModule = {default: (options: UseDiscardChangesConfirmationOptions) => DiscardChangesConfirmation};

// Jest resolves platform extensions native-first, so the web implementation is loaded explicitly
const useDiscardChangesConfirmation = jest.requireActual<DiscardHookModule>('@hooks/useDiscardChangesConfirmation/index.ts').default;

const dispatchPopstate = () => {
    act(() => {
        window.dispatchEvent(new PopStateEvent('popstate'));
    });
};

const createBeforeRemoveEvent = (type: string): MockBeforeRemoveEvent => {
    const event: MockBeforeRemoveEvent = {
        data: {action: {type}},
        defaultPrevented: false,
        preventDefault: () => {
            event.defaultPrevented = true;
        },
    };
    return event;
};

const invokeBeforeRemove = (type: string): MockBeforeRemoveEvent => {
    const event = createBeforeRemoveEvent(type);
    act(() => {
        mockBeforeRemoveCallback?.(event);
    });
    return event;
};

describe('useDiscardChangesConfirmation (web)', () => {
    let historyGoSpy: jest.SpyInstance;
    let resolveModal: ((result: {action: string}) => void) | undefined;

    const renderDiscardHook = (getHasUnsavedChanges: () => boolean) => renderHook(() => useDiscardChangesConfirmation({getHasUnsavedChanges}));

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
        mockBeforeRemoveCallback = undefined;
        mockIsFocused = true;
        resolveModal = undefined;
        historyGoSpy = jest.spyOn(window.history, 'go').mockImplementation(() => {});
        mockShowConfirmModal.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveModal = resolve;
                }),
        );
        mockCloseModal.mockImplementation(() => resolveModal?.({action: 'CLOSE'}));
    });

    afterEach(() => {
        historyGoSpy.mockRestore();
    });

    describe('browser back prevented through beforeRemove', () => {
        it('prevents the reset, restores the URL once, and shows a single history-inert modal', () => {
            renderDiscardHook(() => true);

            const event = invokeBeforeRemove('RESET');

            expect(event.defaultPrevented).toBe(true);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
            expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({shouldHandleNavigationBack: false}));

            dispatchPopstate();

            expect(historyGoSpy).toHaveBeenCalledTimes(1);
            expect(historyGoSpy).toHaveBeenCalledWith(1);

            // The restore round-trip popstate must not start a new flow
            dispatchPopstate();

            expect(historyGoSpy).toHaveBeenCalledTimes(1);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('swallows the beforeRemove echo during the restore round-trip without re-blocking', () => {
            renderDiscardHook(() => true);

            invokeBeforeRemove('RESET');
            dispatchPopstate();

            const echo = invokeBeforeRemove('RESET');
            expect(echo.defaultPrevented).toBe(true);

            dispatchPopstate();

            expect(historyGoSpy).toHaveBeenCalledTimes(1);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('dispatches the blocked action when the user confirms discarding', async () => {
            renderDiscardHook(() => true);

            invokeBeforeRemove('RESET');
            dispatchPopstate();
            dispatchPopstate();
            await resolveModalWith('CONFIRM');

            expect(mockNavigationDispatch).toHaveBeenCalledWith({type: 'RESET'});
            expect(historyGoSpy).toHaveBeenCalledTimes(1);
        });

        it('lets the confirmed re-dispatch through without re-blocking it', async () => {
            renderDiscardHook(() => true);

            invokeBeforeRemove('RESET');
            dispatchPopstate();
            dispatchPopstate();

            let redeliveredEvent: MockBeforeRemoveEvent | undefined;
            mockNavigationDispatch.mockImplementation(() => {
                redeliveredEvent = createBeforeRemoveEvent('RESET');
                mockBeforeRemoveCallback?.(redeliveredEvent);
            });

            await resolveModalWith('CONFIRM');

            expect(mockNavigationDispatch).toHaveBeenCalledWith({type: 'RESET'});
            expect(redeliveredEvent?.defaultPrevented).toBe(false);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('lets the confirmed re-dispatch through even before the restore echo arrives', async () => {
            renderDiscardHook(() => true);

            invokeBeforeRemove('RESET');
            // Only the go(1) has fired — restoreState is still 'restoring', its echo popstate not yet delivered
            dispatchPopstate();

            let redeliveredEvent: MockBeforeRemoveEvent | undefined;
            mockNavigationDispatch.mockImplementation(() => {
                redeliveredEvent = createBeforeRemoveEvent('RESET');
                mockBeforeRemoveCallback?.(redeliveredEvent);
            });

            await resolveModalWith('CONFIRM');

            // The intentional replay must not be swallowed by the restore guard mid-restore
            expect(mockNavigationDispatch).toHaveBeenCalledWith({type: 'RESET'});
            expect(redeliveredEvent?.defaultPrevented).toBe(false);
        });

        it('starts a fresh flow after cancelling', async () => {
            renderDiscardHook(() => true);

            invokeBeforeRemove('RESET');
            dispatchPopstate();
            dispatchPopstate();
            await resolveModalWith('CLOSE');

            const secondEvent = invokeBeforeRemove('RESET');
            expect(secondEvent.defaultPrevented).toBe(true);

            dispatchPopstate();

            expect(historyGoSpy).toHaveBeenCalledTimes(2);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(2);
        });

        it('cancelling a reset blocked without a popstate (programmatic reset) leaves later popstate events untouched', async () => {
            renderDiscardHook(() => true);

            invokeBeforeRemove('RESET');
            await resolveModalWith('CLOSE');

            dispatchPopstate();

            expect(historyGoSpy).not.toHaveBeenCalled();
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('dismisses the prompt as Cancel and restores the URL on a browser back while it is open', async () => {
            renderDiscardHook(() => true);

            invokeBeforeRemove('RESET');
            dispatchPopstate();
            dispatchPopstate();

            // e.g. a browser back while the modal is open
            const whileOpen = invokeBeforeRemove('RESET');
            expect(whileOpen.defaultPrevented).toBe(true);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);

            dispatchPopstate();

            expect(historyGoSpy).toHaveBeenCalledTimes(2);
            expect(mockCloseModal).toHaveBeenCalledTimes(1);

            await act(async () => {
                await Promise.resolve();
            });
            expect(mockNavigationDispatch).not.toHaveBeenCalled();
        });
    });

    describe('in-app navigation', () => {
        it('shows the modal without touching browser history for non-RESET actions', () => {
            renderDiscardHook(() => true);

            const event = invokeBeforeRemove('POP');

            expect(event.defaultPrevented).toBe(true);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
            expect(historyGoSpy).not.toHaveBeenCalled();
        });

        it('allows navigation when there are no unsaved changes', () => {
            renderDiscardHook(() => false);

            const event = invokeBeforeRemove('RESET');

            expect(event.defaultPrevented).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('allows navigation when the screen is not focused, even with a dirty predicate', () => {
            mockIsFocused = false;
            renderDiscardHook(() => true);

            const event = invokeBeforeRemove('RESET');

            expect(event.defaultPrevented).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('suppresses the prompt while a save is in progress, and re-arms when notified it ended', () => {
            const {result} = renderDiscardHook(() => true);

            act(() => result.current.suppressDiscardPrompt());
            const duringSave = invokeBeforeRemove('RESET');

            expect(duringSave.defaultPrevented).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();

            act(() => result.current.suppressDiscardPrompt(false));
            const afterSave = invokeBeforeRemove('RESET');

            expect(afterSave.defaultPrevented).toBe(true);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });
    });

    describe('popstate guards', () => {
        it('does nothing on a popstate without a preceding prevented reset', () => {
            renderDiscardHook(() => true);

            dispatchPopstate();

            expect(historyGoSpy).not.toHaveBeenCalled();
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });
    });
});
