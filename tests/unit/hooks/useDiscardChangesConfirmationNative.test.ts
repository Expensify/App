import {act, renderHook} from '@testing-library/react-native';

import type {DiscardChangesConfirmation} from '@hooks/useDiscardChangesConfirmation/types';
import type UseDiscardChangesConfirmationOptions from '@hooks/useDiscardChangesConfirmation/types';

import {releaseFlowDiscardPromptSuppression, runWhileReplayingDiscardedNavigation, suppressFlowDiscardPrompt} from '@libs/Navigation/helpers/discardPromptState';

import type {HardwareBackPressEvent} from 'react-native/Libraries/Utilities/BackHandler';

import {BackHandler} from 'react-native';

type MockBeforeRemoveEvent = {data: {action: {type: string; source?: string; target?: string; payload?: unknown}}};

const mockHardwareBackPressEvent: HardwareBackPressEvent = {type: 'hardwareBackPress', timeStamp: 0};

let mockPreventRemoveFlag: boolean | undefined;
let mockPreventRemoveCallback: ((e: MockBeforeRemoveEvent) => void) | undefined;
let mockIsFocused = true;
let mockIsFlowFocused = true;
const mockNavigation = {
    getState: () => ({type: 'stack', key: 'flow-stack', index: 0, routes: [{key: 'test-route-key'}]}),
    getParent: () => ({getState: () => undefined, getParent: () => undefined, isFocused: () => mockIsFlowFocused}),
    isFocused: () => mockIsFocused,
};
jest.mock('@react-navigation/native', () => ({
    usePreventRemove: (flag: boolean, callback: (e: MockBeforeRemoveEvent) => void) => {
        mockPreventRemoveFlag = flag;
        mockPreventRemoveCallback = callback;
    },
    useIsFocused: () => mockIsFocused,
    useNavigation: () => mockNavigation,
    // The hook reads `route.name` to key its tab-switch guard
    useRoute: () => ({name: 'test-route', key: 'test-route-key', params: {transactionID: '1'}}),
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
        isReady: () => true,
        getRootState: () => ({key: 'root', routes: [{key: 'rhp-route'}]}),
    },
}));

type DiscardHookModule = {default: (options: UseDiscardChangesConfirmationOptions) => DiscardChangesConfirmation};

const useDiscardChangesConfirmation = jest.requireActual<DiscardHookModule>('@hooks/useDiscardChangesConfirmation/index.native.ts').default;

describe('useDiscardChangesConfirmation (native)', () => {
    let backHandlerSpy: jest.SpyInstance;
    let hardwareBackCallback: ((event: HardwareBackPressEvent) => boolean | null | undefined) | undefined;
    const removeSubscription = jest.fn();
    let resolveModal: ((result: {action: string}) => void) | undefined;

    const renderDiscardHook = (getHasUnsavedChanges: () => boolean) => renderHook(() => useDiscardChangesConfirmation({getHasUnsavedChanges}));

    const pressHardwareBack = (): boolean | null | undefined => {
        let consumed: boolean | null | undefined;
        act(() => {
            consumed = hardwareBackCallback?.(mockHardwareBackPressEvent);
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

    // Mirrors how the step screens compute dirtiness: the current value against the committed baseline
    const renderValueDrivenHook = (baseline: string) =>
        renderHook(({typed}: {typed: string}) => useDiscardChangesConfirmation({getHasUnsavedChanges: () => typed !== baseline}), {initialProps: {typed: baseline}});

    beforeEach(() => {
        jest.clearAllMocks();
        mockPreventRemoveFlag = undefined;
        mockPreventRemoveCallback = undefined;
        mockIsFocused = true;
        mockIsFlowFocused = true;
        releaseFlowDiscardPromptSuppression();
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

        it('lets the back press through after suppressDiscardPrompt, and prompts again once the save ends', () => {
            const {result} = renderDiscardHook(() => true);

            act(() => result.current.suppressDiscardPrompt());
            expect(pressHardwareBack()).toBe(false);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();

            act(() => result.current.suppressDiscardPrompt(false));
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

        it('leaves prevention off on a clean screen', () => {
            renderValueDrivenHook('');

            expect(mockPreventRemoveFlag).toBe(false);
        });

        it('leaves prevention off on a prefilled screen still matching its baseline', () => {
            renderValueDrivenHook('42');

            expect(mockPreventRemoveFlag).toBe(false);
        });

        it('arms prevention as soon as the value differs from the baseline', () => {
            const {rerender} = renderValueDrivenHook('');

            rerender({typed: '5'});

            expect(mockPreventRemoveFlag).toBe(true);
        });

        it('relaxes prevention as soon as the value is reverted to the baseline', () => {
            const {rerender} = renderValueDrivenHook('42');

            rerender({typed: '4'});
            expect(mockPreventRemoveFlag).toBe(true);

            // No timer to flush: a swipe started right after the revert must not be swallowed
            rerender({typed: '42'});
            expect(mockPreventRemoveFlag).toBe(false);
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
    describe('flow root', () => {
        const invokeBeforeRemove = (type: string, action: Omit<MockBeforeRemoveEvent['data']['action'], 'type'> = {}) => {
            act(() => {
                mockPreventRemoveCallback?.({data: {action: {type, ...action}}});
            });
        };

        const renderFlowRootHook = (options: Partial<UseDiscardChangesConfirmationOptions> = {}) =>
            renderHook(() => useDiscardChangesConfirmation({getHasUnsavedChanges: () => true, shouldPromptWhenUnfocused: true, ...options}));

        it('keeps prevention armed and prompts while a later step covers the root', () => {
            // Given a dirty flow root covered by a later step
            mockIsFocused = false;
            renderFlowRootHook();

            // When closing the flow removes the root
            invokeBeforeRemove('POP', {target: 'rhp-stack'});

            // Then the root still blocks the removal and asks the user
            expect(mockPreventRemoveFlag).toBe(true);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
            expect(mockNavigationDispatch).not.toHaveBeenCalled();
        });

        it('lets the removal through when the flow itself is not visible', () => {
            // Given a dirty flow root whose flow is covered by another screen
            mockIsFocused = false;
            mockIsFlowFocused = false;
            renderFlowRootHook();

            // When the root is removed
            invokeBeforeRemove('POP', {target: 'rhp-stack'});

            // Then it isn't asked about and the removal proceeds
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
            expect(mockNavigationDispatch).toHaveBeenCalledWith({type: 'POP', target: 'rhp-stack'});
        });

        it('lets a replace inside the flow stack through without prompting', () => {
            // Given a dirty flow root
            renderFlowRootHook();

            // When going back replaces the root with an earlier step of the same flow
            invokeBeforeRemove('REPLACE', {target: 'flow-stack'});

            // Then the draft stays, so the navigation proceeds without a prompt
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
            expect(mockNavigationDispatch).toHaveBeenCalledWith({type: 'REPLACE', target: 'flow-stack'});
        });

        it('lets a submit from a later step through while the flow is suppressed', () => {
            // Given a dirty flow root and a submit that muted the flow's guards
            renderFlowRootHook();
            suppressFlowDiscardPrompt();

            // When the submit dismisses the flow
            invokeBeforeRemove('DISMISS_MODAL');

            // Then it isn't interrupted
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
            expect(mockNavigationDispatch).toHaveBeenCalledWith({type: 'DISMISS_MODAL'});
        });

        it('runs onDiscarded and replays a root-level close at the root navigator on Discard', async () => {
            // Given a dirty flow root that clears its drafts on discard
            const onDiscarded = jest.fn();
            renderFlowRootHook({onDiscarded});

            // When a close sent from the root-level RHP route is blocked and the user confirms Discard
            invokeBeforeRemove('GO_BACK', {source: 'rhp-route'});
            await resolveModalWith('CONFIRM');

            // Then the drafts are cleared and the close is replayed where it was first handled, closing the whole RHP
            expect(onDiscarded).toHaveBeenCalledTimes(1);
            expect(mockNavigationDispatch).toHaveBeenCalledWith({type: 'GO_BACK', source: 'rhp-route', target: 'root'});
        });

        it('discards without a second prompt when another guard already confirmed the navigation', () => {
            // Given a dirty flow root under another guard of the same flow
            const onDiscarded = jest.fn();
            renderFlowRootHook({onDiscarded});

            // When the other guard replays the navigation the user confirmed to discard
            runWhileReplayingDiscardedNavigation(() => invokeBeforeRemove('DISMISS_MODAL'));

            // Then the root lets it through without asking again, and still discards its own changes
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
            expect(onDiscarded).toHaveBeenCalledTimes(1);
            expect(mockNavigationDispatch).toHaveBeenCalledWith({type: 'DISMISS_MODAL'});
        });
    });
});
