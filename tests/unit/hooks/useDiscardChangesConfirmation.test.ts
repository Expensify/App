import {act, renderHook} from '@testing-library/react-native';
import {withInternalPopstate} from '@components/Modal/internalPopstateGuard';
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

jest.mock('@react-navigation/native', () => ({
    useRoute: () => ({key: 'route-1', name: 'TestScreen'}),
}));

type MockRegisteredDiscardScreen = {
    hasUnsavedChanges: () => boolean;
    onBlocked: (action: {type: string}) => void;
};

let mockRegisteredScreen: MockRegisteredDiscardScreen | undefined;
const mockUnregisterDiscardScreen = jest.fn();
jest.mock('@libs/Navigation/guards/DiscardChangesGuard', () => ({
    registerDiscardChangesScreen: (routeKey: string, screen: MockRegisteredDiscardScreen) => {
        mockRegisteredScreen = screen;
        return mockUnregisterDiscardScreen;
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

// Both run their callback immediately so modal scheduling and the confirm navigation are synchronous in tests
jest.mock('@libs/Navigation/navigateAfterInteraction', () => ({
    __esModule: true,
    default: (callback: () => void) => callback(),
}));
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

type DiscardHookModule = {default: (options: UseDiscardChangesConfirmationOptions) => void};

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
        mockRegisteredScreen = undefined;
        resolveModal = undefined;
        historyGoSpy = jest.spyOn(window.history, 'go').mockImplementation(() => {});
        mockShowConfirmModal.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveModal = resolve;
                }),
        );
    });

    afterEach(() => {
        historyGoSpy.mockRestore();
    });

    describe('browser back prevented through beforeRemove', () => {
        it('prevents the reset, restores the URL once, and shows a single modal', () => {
            renderDiscardHook(() => true);

            const event = invokeBeforeRemove('RESET');

            expect(event.defaultPrevented).toBe(true);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);

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

        it('cancelling a reset blocked without a popstate (programmatic reset) leaves later popstates untouched', async () => {
            renderDiscardHook(() => true);

            invokeBeforeRemove('RESET');
            await resolveModalWith('CLOSE');

            dispatchPopstate();

            expect(historyGoSpy).not.toHaveBeenCalled();
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('swallows a beforeRemove while the modal is open and skips its popstate', () => {
            renderDiscardHook(() => true);

            invokeBeforeRemove('RESET');
            dispatchPopstate();
            dispatchPopstate();

            // e.g. a browser back while the modal is open
            const whileOpen = invokeBeforeRemove('RESET');
            expect(whileOpen.defaultPrevented).toBe(true);

            dispatchPopstate();

            expect(historyGoSpy).toHaveBeenCalledTimes(1);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
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
    });

    describe('browser back blocked by DiscardChangesGuard (focus change)', () => {
        const invokeGuardBlocked = () => {
            act(() => {
                mockRegisteredScreen?.onBlocked({type: 'RESET'});
            });
        };

        it('registers the screen on mount and unregisters on unmount', () => {
            const {unmount} = renderDiscardHook(() => true);

            expect(mockRegisteredScreen).toBeDefined();

            unmount();

            expect(mockUnregisterDiscardScreen).toHaveBeenCalledTimes(1);
        });

        it('shows a single modal and restores the URL once', () => {
            renderDiscardHook(() => true);

            invokeGuardBlocked();

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);

            dispatchPopstate();

            expect(historyGoSpy).toHaveBeenCalledTimes(1);
            expect(historyGoSpy).toHaveBeenCalledWith(1);

            dispatchPopstate();

            expect(historyGoSpy).toHaveBeenCalledTimes(1);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('reports the screen as clean while the confirmed action re-dispatches', async () => {
            renderDiscardHook(() => true);

            invokeGuardBlocked();
            dispatchPopstate();
            dispatchPopstate();

            expect(mockRegisteredScreen?.hasUnsavedChanges()).toBe(true);

            let dirtyDuringDispatch: boolean | undefined;
            mockNavigationDispatch.mockImplementation(() => {
                dirtyDuringDispatch = mockRegisteredScreen?.hasUnsavedChanges();
            });

            await resolveModalWith('CONFIRM');

            expect(mockNavigationDispatch).toHaveBeenCalledWith({type: 'RESET'});
            expect(dirtyDuringDispatch).toBe(false);
            expect(mockRegisteredScreen?.hasUnsavedChanges()).toBe(true);
        });

        it('restores the URL without stacking a second modal when blocked while the modal is open', () => {
            renderDiscardHook(() => true);

            invokeGuardBlocked();
            dispatchPopstate();
            dispatchPopstate();

            // e.g. another browser back while the modal is open
            invokeGuardBlocked();
            dispatchPopstate();

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
            expect(historyGoSpy).toHaveBeenCalledTimes(2);
            expect(historyGoSpy).toHaveBeenNthCalledWith(2, 1);
        });

        it('cancelling a block without a popstate (programmatic reset) leaves later popstates untouched', async () => {
            renderDiscardHook(() => true);

            invokeGuardBlocked();
            await resolveModalWith('CLOSE');

            dispatchPopstate();

            expect(historyGoSpy).not.toHaveBeenCalled();
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('cancel clears the blocked action so a later unrelated popstate does nothing', async () => {
            renderDiscardHook(() => true);

            invokeGuardBlocked();
            dispatchPopstate();
            dispatchPopstate();
            await resolveModalWith('CLOSE');

            dispatchPopstate();

            expect(historyGoSpy).toHaveBeenCalledTimes(1);
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

        it('ignores internal popstates from modal history cleanup', () => {
            renderDiscardHook(() => true);

            invokeBeforeRemove('RESET');

            act(() => {
                withInternalPopstate(() => {
                    window.dispatchEvent(new PopStateEvent('popstate'));
                });
            });

            // The internal popstate must not consume the pending URL restore
            expect(historyGoSpy).not.toHaveBeenCalled();

            dispatchPopstate();

            expect(historyGoSpy).toHaveBeenCalledTimes(1);
            expect(historyGoSpy).toHaveBeenCalledWith(1);
        });
    });
});
