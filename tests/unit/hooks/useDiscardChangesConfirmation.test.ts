import {act, renderHook} from '@testing-library/react-native';

import type {DiscardChangesConfirmation} from '@hooks/useDiscardChangesConfirmation/types';
import type UseDiscardChangesConfirmationOptions from '@hooks/useDiscardChangesConfirmation/types';

import {releaseFlowDiscardPromptSuppression, runWhileReplayingDiscardedNavigation, suppressFlowDiscardPrompt} from '@libs/Navigation/helpers/discardPromptState';

type MockNavigationAction = {
    type: string;
    source?: string;
    target?: string;
    payload?: unknown;
};

type MockBeforeRemoveEvent = {
    data: {action: MockNavigationAction};
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
let mockIsFlowFocused = true;
let mockOwnNavigatorState: {type: string; key: string; index: number; routes: Array<{key: string}>} = {type: 'stack', key: 'flow-stack', index: 0, routes: [{key: 'test-route-key'}]};
const mockNavigation = {
    getState: () => mockOwnNavigatorState,
    getParent: () => ({getState: () => undefined, getParent: () => undefined, isFocused: () => mockIsFlowFocused}),
    isFocused: () => mockIsFocused,
};
jest.mock('@react-navigation/native', () => ({
    useIsFocused: () => mockIsFocused,
    useNavigation: () => mockNavigation,
    // The hook reads `route.name` to key its tab-switch guard
    useRoute: () => ({name: 'test-route', key: 'test-route-key', params: {transactionID: '1'}}),
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
        isReady: () => true,
        getRootState: () => ({key: 'root', routes: [{key: 'rhp-route'}]}),
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

const createBeforeRemoveEvent = (type: string, action: Omit<MockNavigationAction, 'type'> = {}): MockBeforeRemoveEvent => {
    const event: MockBeforeRemoveEvent = {
        data: {action: {type, ...action}},
        defaultPrevented: false,
        preventDefault: () => {
            event.defaultPrevented = true;
        },
    };
    return event;
};

const invokeBeforeRemove = (type: string, action?: Omit<MockNavigationAction, 'type'>): MockBeforeRemoveEvent => {
    const event = createBeforeRemoveEvent(type, action);
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
        mockIsFlowFocused = true;
        mockOwnNavigatorState = {type: 'stack', key: 'flow-stack', index: 0, routes: [{key: 'test-route-key'}]};
        releaseFlowDiscardPromptSuppression();
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
            dispatchPopstate();

            let redeliveredEvent: MockBeforeRemoveEvent | undefined;
            mockNavigationDispatch.mockImplementation(() => {
                redeliveredEvent = createBeforeRemoveEvent('RESET');
                mockBeforeRemoveCallback?.(redeliveredEvent);
            });

            await resolveModalWith('CONFIRM');

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
    describe('flow root', () => {
        const renderFlowRootHook = (options: Partial<UseDiscardChangesConfirmationOptions> = {}) =>
            renderHook(() => useDiscardChangesConfirmation({getHasUnsavedChanges: () => true, shouldPromptWhenUnfocused: true, ...options}));

        it('prompts while a later step of the flow covers the root', () => {
            // Given a dirty flow root covered by a later step, so the root itself isn't focused
            mockIsFocused = false;
            renderFlowRootHook();

            // When the RHP overlay closes the whole flow
            const event = invokeBeforeRemove('GO_BACK', {source: 'rhp-route'});

            // Then the root blocks the close and asks the user, since the draft would be lost
            expect(event.defaultPrevented).toBe(true);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('lets the removal through when the flow itself is not visible', () => {
            // Given a dirty flow root whose flow is covered by another RHP or a fullscreen
            mockIsFocused = false;
            mockIsFlowFocused = false;
            renderFlowRootHook();

            // When the root is removed
            const event = invokeBeforeRemove('RESET');

            // Then it doesn't prompt, because the user isn't leaving a flow they can see
            expect(event.defaultPrevented).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('lets the removal through from a hidden sibling tab', () => {
            // Given a dirty flow root rendered in a tab that isn't the active one
            mockOwnNavigatorState = {type: 'tab', key: 'tabs', index: 1, routes: [{key: 'test-route-key'}, {key: 'other-tab'}]};
            renderFlowRootHook();

            // When closing the flow removes every mounted tab
            const event = invokeBeforeRemove('POP');

            // Then only the active tab may prompt, so this one stays quiet
            expect(event.defaultPrevented).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('lets a browser back that keeps the flow root through', () => {
            // Given a dirty flow root
            renderFlowRootHook();

            // When a browser back after a refresh restores a state that still holds the flow root
            const event = invokeBeforeRemove('RESET', {payload: {routes: [{name: 'test-route', params: {transactionID: '1'}}]}});

            // Then the user stays in the flow, so nothing is discarded
            expect(event.defaultPrevented).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('lets a replace inside the flow stack through', () => {
            // Given a dirty flow root
            renderFlowRootHook();

            // When going back replaces the root with an earlier step of the same flow
            const event = invokeBeforeRemove('REPLACE', {target: 'flow-stack'});

            // Then the draft stays, so it doesn't prompt
            expect(event.defaultPrevented).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('lets an action through when the caller opts out of prompting for it', () => {
            // Given a dirty guard that never prompts for a POP
            renderHook(() => useDiscardChangesConfirmation({getHasUnsavedChanges: () => true, shouldPromptForNavigationAction: (action) => action.type !== 'POP'}));

            // When a POP removes the screen
            const event = invokeBeforeRemove('POP');

            // Then the navigation goes through without a prompt
            expect(event.defaultPrevented).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('stays quiet while a later step submits, and prompts again once the suppression is released', () => {
            // Given a dirty flow root and a submit from a later step that muted the flow's guards
            renderFlowRootHook();
            suppressFlowDiscardPrompt();

            // When the submit dismisses the flow
            const duringSubmit = invokeBeforeRemove('DISMISS_MODAL');

            // Then the submit isn't interrupted
            expect(duringSubmit.defaultPrevented).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();

            // When the submit aborts and the user later leaves the flow
            releaseFlowDiscardPromptSuppression();
            const afterAbort = invokeBeforeRemove('DISMISS_MODAL');

            // Then the guard prompts again
            expect(afterAbort.defaultPrevented).toBe(true);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('replays the overlay close at the root navigator on Discard, after running onDiscarded', async () => {
            // Given a dirty flow root that clears its drafts on discard
            const onDiscarded = jest.fn(() => {
                expect(mockNavigationDispatch).not.toHaveBeenCalled();
            });
            mockIsFocused = false;
            renderFlowRootHook({onDiscarded});

            // When the overlay sends its GO_BACK without a target from the root-level RHP route and the user confirms Discard
            invokeBeforeRemove('GO_BACK', {source: 'rhp-route'});
            await resolveModalWith('CONFIRM');

            // Then the replay targets the root, which closes the whole RHP instead of popping one inner screen, and the drafts were cleared first
            expect(onDiscarded).toHaveBeenCalledTimes(1);
            expect(mockNavigationDispatch).toHaveBeenCalledWith({type: 'GO_BACK', source: 'rhp-route', target: 'root'});
        });

        it('replays an action that the root did not originally handle unchanged', async () => {
            // Given a dirty flow root
            renderFlowRootHook();

            // When a targeted pop is blocked and the user confirms Discard
            invokeBeforeRemove('POP', {source: 'some-screen', target: 'rhp-stack'});
            await resolveModalWith('CONFIRM');

            // Then the original action is replayed as is
            expect(mockNavigationDispatch).toHaveBeenCalledWith({type: 'POP', source: 'some-screen', target: 'rhp-stack'});
        });

        it('discards without a second prompt when another guard already confirmed the navigation', () => {
            // Given a dirty flow root under another guard of the same flow
            const onDiscarded = jest.fn();
            renderFlowRootHook({onDiscarded});

            // When the other guard replays the navigation the user confirmed to discard
            let event: MockBeforeRemoveEvent | undefined;
            runWhileReplayingDiscardedNavigation(() => {
                event = invokeBeforeRemove('DISMISS_MODAL');
            });

            // Then the root lets it through without asking again, and still discards its own changes
            expect(event?.defaultPrevented).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
            expect(onDiscarded).toHaveBeenCalledTimes(1);
        });
    });
});
