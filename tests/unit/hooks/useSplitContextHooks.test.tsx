import {act, renderHook} from '@testing-library/react-native';
import React from 'react';
import type {PropsWithChildren} from 'react';
import type {SharedValue} from 'react-native-reanimated';
import {
    AttachmentCarouselPagerActionsContext,
    AttachmentCarouselPagerStateContext,
    useAttachmentCarouselPagerActions,
    useAttachmentCarouselPagerState,
} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import type {AttachmentCarouselPagerActionsContextType, AttachmentCarouselPagerStateContextType} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import {
    CustomStatusBarAndBackgroundProvider,
    useCustomStatusBarAndBackgroundActions,
    useCustomStatusBarAndBackgroundState,
} from '@components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext';
import type {CustomStatusBarAndBackgroundActionsContextType, CustomStatusBarAndBackgroundStateContextType} from '@components/CustomStatusBarAndBackground/types';
import {DragAndDropActionsContext, DragAndDropStateContext, useDragAndDropActions, useDragAndDropState} from '@components/DragAndDrop/Provider/DragAndDropContext';
import type {DragAndDropActionsContextType, DragAndDropStateContextType} from '@components/DragAndDrop/Provider/types';
import MultifactorAuthenticationStateProvider, {
    DEFAULT_STATE,
    useMultifactorAuthenticationActions,
    useMultifactorAuthenticationState,
} from '@components/MultifactorAuthentication/Context/State';

/**
 * Creates a mock SharedValue that satisfies the SharedValue<T> interface used in reanimated.
 */
function createMockSharedValue<T>(initialValue: T): SharedValue<T> {
    let current = initialValue;
    return {
        value: initialValue,
        get: () => current,
        set: (newValue: T | ((val: T) => T)) => {
            current = typeof newValue === 'function' ? (newValue as (val: T) => T)(current) : newValue;
        },
        addListener: () => -1,
        removeListener: () => {},
        modify: () => {},
    } as unknown as SharedValue<T>;
}

describe('Split context hooks', () => {
    describe('AttachmentCarouselPager context hooks', () => {
        it('returns null when used outside provider', () => {
            const {result: stateResult} = renderHook(() => useAttachmentCarouselPagerState());
            const {result: actionsResult} = renderHook(() => useAttachmentCarouselPagerActions());

            expect(stateResult.current).toBeNull();
            expect(actionsResult.current).toBeNull();
        });

        it('returns state from provider', () => {
            const mockState: AttachmentCarouselPagerStateContextType = {
                pagerItems: [],
                activePage: 2,
                isPagerScrolling: createMockSharedValue(false),
                isScrollEnabled: createMockSharedValue(true),
            };

            function wrapper({children}: PropsWithChildren) {
                return <AttachmentCarouselPagerStateContext.Provider value={mockState}>{children}</AttachmentCarouselPagerStateContext.Provider>;
            }

            const {result} = renderHook(() => useAttachmentCarouselPagerState(), {wrapper});

            expect(result.current).not.toBeNull();
            expect(result.current?.activePage).toBe(2);
            expect(result.current?.pagerItems).toEqual([]);
        });

        it('returns actions from provider', () => {
            const onTap = jest.fn();
            const onSwipeDown = jest.fn();
            const mockActions: AttachmentCarouselPagerActionsContextType = {
                onTap,
                onSwipeDown,
            };

            function wrapper({children}: PropsWithChildren) {
                return <AttachmentCarouselPagerActionsContext.Provider value={mockActions}>{children}</AttachmentCarouselPagerActionsContext.Provider>;
            }

            const {result} = renderHook(() => useAttachmentCarouselPagerActions(), {wrapper});

            expect(result.current).not.toBeNull();
            result.current?.onTap?.(true);
            expect(onTap).toHaveBeenCalledWith(true);
            result.current?.onSwipeDown?.();
            expect(onSwipeDown).toHaveBeenCalled();
        });

        it('state and actions contexts are independent', () => {
            const mockState: AttachmentCarouselPagerStateContextType = {
                pagerItems: [],
                activePage: 0,
                isPagerScrolling: createMockSharedValue(false),
                isScrollEnabled: createMockSharedValue(true),
            };

            function stateOnlyWrapper({children}: PropsWithChildren) {
                return <AttachmentCarouselPagerStateContext.Provider value={mockState}>{children}</AttachmentCarouselPagerStateContext.Provider>;
            }

            const {result: stateResult} = renderHook(() => useAttachmentCarouselPagerState(), {wrapper: stateOnlyWrapper});
            const {result: actionsResult} = renderHook(() => useAttachmentCarouselPagerActions(), {wrapper: stateOnlyWrapper});

            expect(stateResult.current).not.toBeNull();
            expect(actionsResult.current).toBeNull();
        });
    });

    describe('CustomStatusBarAndBackground context hooks', () => {
        it('returns defaults when used outside provider', () => {
            const {result: stateResult} = renderHook(() => useCustomStatusBarAndBackgroundState());
            const {result: actionsResult} = renderHook(() => useCustomStatusBarAndBackgroundActions());

            expect(stateResult.current.isRootStatusBarEnabled).toBe(true);
            expect(typeof actionsResult.current.setRootStatusBarEnabled).toBe('function');
        });

        it('returns provided state and actions', () => {
            const mockState: CustomStatusBarAndBackgroundStateContextType = {
                isRootStatusBarEnabled: false,
            };
            const setRootStatusBarEnabled = jest.fn();
            const mockActions: CustomStatusBarAndBackgroundActionsContextType = {
                setRootStatusBarEnabled,
            };

            function wrapper({children}: PropsWithChildren) {
                return (
                    <CustomStatusBarAndBackgroundProvider
                        state={mockState}
                        actions={mockActions}
                    >
                        {children}
                    </CustomStatusBarAndBackgroundProvider>
                );
            }

            const {result: stateResult} = renderHook(() => useCustomStatusBarAndBackgroundState(), {wrapper});
            const {result: actionsResult} = renderHook(() => useCustomStatusBarAndBackgroundActions(), {wrapper});

            expect(stateResult.current.isRootStatusBarEnabled).toBe(false);
            actionsResult.current.setRootStatusBarEnabled(true);
            expect(setRootStatusBarEnabled).toHaveBeenCalledWith(true);
        });
    });

    describe('DragAndDrop context hooks', () => {
        it('returns defaults when used outside provider', () => {
            const {result: stateResult} = renderHook(() => useDragAndDropState());
            const {result: actionsResult} = renderHook(() => useDragAndDropActions());

            expect(stateResult.current.isDraggingOver).toBe(false);
            expect(stateResult.current.dropZoneID).toBe('');
            expect(typeof actionsResult.current.setOnDropHandler).toBe('function');
        });

        it('returns provided state and actions', () => {
            const mockState: DragAndDropStateContextType = {
                isDraggingOver: true,
                dropZoneID: 'test-zone',
            };
            const setOnDropHandler = jest.fn();
            const mockActions: DragAndDropActionsContextType = {
                setOnDropHandler,
            };

            function wrapper({children}: PropsWithChildren) {
                return (
                    <DragAndDropStateContext.Provider value={mockState}>
                        <DragAndDropActionsContext.Provider value={mockActions}>{children}</DragAndDropActionsContext.Provider>
                    </DragAndDropStateContext.Provider>
                );
            }

            const {result: stateResult} = renderHook(() => useDragAndDropState(), {wrapper});
            const {result: actionsResult} = renderHook(() => useDragAndDropActions(), {wrapper});

            expect(stateResult.current.isDraggingOver).toBe(true);
            expect(stateResult.current.dropZoneID).toBe('test-zone');
            const callback = jest.fn();
            actionsResult.current.setOnDropHandler(callback);
            expect(setOnDropHandler).toHaveBeenCalledWith(callback);
        });

        it('state and actions contexts are independent', () => {
            const mockState: DragAndDropStateContextType = {
                isDraggingOver: true,
                dropZoneID: 'zone-1',
            };

            function stateOnlyWrapper({children}: PropsWithChildren) {
                return <DragAndDropStateContext.Provider value={mockState}>{children}</DragAndDropStateContext.Provider>;
            }

            const {result: stateResult} = renderHook(() => useDragAndDropState(), {wrapper: stateOnlyWrapper});
            const {result: actionsResult} = renderHook(() => useDragAndDropActions(), {wrapper: stateOnlyWrapper});

            expect(stateResult.current.isDraggingOver).toBe(true);
            // actions should still return defaults since no actions provider is present
            expect(typeof actionsResult.current.setOnDropHandler).toBe('function');
        });
    });

    describe('MultifactorAuthentication context hooks', () => {
        it('throws when used outside provider', () => {
            jest.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => {
                renderHook(() => useMultifactorAuthenticationState());
            }).toThrow('useMultifactorAuthenticationState must be used within a MultifactorAuthenticationStateProvider');

            expect(() => {
                renderHook(() => useMultifactorAuthenticationActions());
            }).toThrow('useMultifactorAuthenticationActions must be used within a MultifactorAuthenticationStateProvider');

            (console.error as jest.Mock).mockRestore();
        });

        it('returns default state when wrapped in provider', () => {
            function wrapper({children}: PropsWithChildren) {
                return <MultifactorAuthenticationStateProvider>{children}</MultifactorAuthenticationStateProvider>;
            }

            const {result} = renderHook(() => useMultifactorAuthenticationState(), {wrapper});

            expect(result.current).toEqual(DEFAULT_STATE);
            expect(result.current.error).toBeUndefined();
            expect(result.current.validateCode).toBeUndefined();
            expect(result.current.softPromptApproved).toBe(false);
            expect(result.current.isFlowComplete).toBe(false);
        });

        it('returns dispatch function when wrapped in provider', () => {
            function wrapper({children}: PropsWithChildren) {
                return <MultifactorAuthenticationStateProvider>{children}</MultifactorAuthenticationStateProvider>;
            }

            const {result} = renderHook(() => useMultifactorAuthenticationActions(), {wrapper});

            expect(result.current).toBeDefined();
            expect(typeof result.current.dispatch).toBe('function');
        });

        it('dispatch updates state correctly', () => {
            function wrapper({children}: PropsWithChildren) {
                return <MultifactorAuthenticationStateProvider>{children}</MultifactorAuthenticationStateProvider>;
            }

            const {result} = renderHook(
                () => ({
                    state: useMultifactorAuthenticationState(),
                    actions: useMultifactorAuthenticationActions(),
                }),
                {wrapper},
            );

            act(() => {
                result.current.actions.dispatch({type: 'SET_VALIDATE_CODE', payload: '123456'});
            });

            expect(result.current.state.validateCode).toBe('123456');
        });

        it('dispatch handles SET_SOFT_PROMPT_APPROVED', () => {
            function wrapper({children}: PropsWithChildren) {
                return <MultifactorAuthenticationStateProvider>{children}</MultifactorAuthenticationStateProvider>;
            }

            const {result} = renderHook(
                () => ({
                    state: useMultifactorAuthenticationState(),
                    actions: useMultifactorAuthenticationActions(),
                }),
                {wrapper},
            );

            expect(result.current.state.softPromptApproved).toBe(false);

            act(() => {
                result.current.actions.dispatch({type: 'SET_SOFT_PROMPT_APPROVED', payload: true});
            });

            expect(result.current.state.softPromptApproved).toBe(true);
        });

        it('dispatch handles SET_FLOW_COMPLETE', () => {
            function wrapper({children}: PropsWithChildren) {
                return <MultifactorAuthenticationStateProvider>{children}</MultifactorAuthenticationStateProvider>;
            }

            const {result} = renderHook(
                () => ({
                    state: useMultifactorAuthenticationState(),
                    actions: useMultifactorAuthenticationActions(),
                }),
                {wrapper},
            );

            act(() => {
                result.current.actions.dispatch({type: 'SET_FLOW_COMPLETE', payload: true});
            });

            expect(result.current.state.isFlowComplete).toBe(true);
        });

        it('RESET action restores default state', () => {
            function wrapper({children}: PropsWithChildren) {
                return <MultifactorAuthenticationStateProvider>{children}</MultifactorAuthenticationStateProvider>;
            }

            const {result} = renderHook(
                () => ({
                    state: useMultifactorAuthenticationState(),
                    actions: useMultifactorAuthenticationActions(),
                }),
                {wrapper},
            );

            act(() => {
                result.current.actions.dispatch({type: 'SET_VALIDATE_CODE', payload: '999'});
                result.current.actions.dispatch({type: 'SET_SOFT_PROMPT_APPROVED', payload: true});
            });

            expect(result.current.state.validateCode).toBe('999');
            expect(result.current.state.softPromptApproved).toBe(true);

            act(() => {
                result.current.actions.dispatch({type: 'RESET'});
            });

            expect(result.current.state).toEqual(DEFAULT_STATE);
        });
    });
});
