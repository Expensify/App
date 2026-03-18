import {act, renderHook} from '@testing-library/react-native';
import React from 'react';
import type {PropsWithChildren} from 'react';
import {FABMenuContext} from '@pages/inbox/sidebar/FABPopoverContent/FABMenuContext';
import type {FABMenuContextType} from '@pages/inbox/sidebar/FABPopoverContent/FABMenuContext';
import useFABMenuItem from '@pages/inbox/sidebar/FABPopoverContent/useFABMenuItem';

function createMockContext(overrides: Partial<FABMenuContextType> = {}): FABMenuContextType {
    return {
        focusedIndex: -1,
        setFocusedIndex: jest.fn(),
        onItemPress: jest.fn(),
        isVisible: true,
        registeredItems: [],
        registerItem: jest.fn(),
        unregisterItem: jest.fn(),
        ...overrides,
    };
}

function createWrapper(contextValue: FABMenuContextType) {
    // eslint-disable-next-line react/function-component-definition
    const Wrapper = ({children}: PropsWithChildren) => <FABMenuContext.Provider value={contextValue}>{children}</FABMenuContext.Provider>;
    return Wrapper;
}

describe('useFABMenuItem', () => {
    it('registers the item on mount when visible', () => {
        const ctx = createMockContext();
        renderHook(() => useFABMenuItem('expense', true), {wrapper: createWrapper(ctx)});

        expect(ctx.registerItem).toHaveBeenCalledWith('expense');
    });

    it('does not register the item when not visible', () => {
        const ctx = createMockContext();
        renderHook(() => useFABMenuItem('expense', false), {wrapper: createWrapper(ctx)});

        expect(ctx.registerItem).not.toHaveBeenCalled();
    });

    it('unregisters the item on unmount', () => {
        const ctx = createMockContext();
        const {unmount} = renderHook(() => useFABMenuItem('expense', true), {wrapper: createWrapper(ctx)});

        unmount();

        expect(ctx.unregisterItem).toHaveBeenCalledWith('expense');
    });

    it('does not unregister on unmount when the item was never visible', () => {
        const ctx = createMockContext();
        const {unmount} = renderHook(() => useFABMenuItem('expense', false), {wrapper: createWrapper(ctx)});

        unmount();

        expect(ctx.unregisterItem).not.toHaveBeenCalled();
    });

    it('registers when visibility changes from false to true', () => {
        const ctx = createMockContext();
        const {rerender} = renderHook(({visible}: {visible: boolean}) => useFABMenuItem('expense', visible), {
            wrapper: createWrapper(ctx),
            initialProps: {visible: false},
        });

        expect(ctx.registerItem).not.toHaveBeenCalled();

        rerender({visible: true});

        expect(ctx.registerItem).toHaveBeenCalledWith('expense');
    });

    it('unregisters when visibility changes from true to false', () => {
        const ctx = createMockContext();
        const {rerender} = renderHook(({visible}: {visible: boolean}) => useFABMenuItem('expense', visible), {
            wrapper: createWrapper(ctx),
            initialProps: {visible: true},
        });

        rerender({visible: false});

        expect(ctx.unregisterItem).toHaveBeenCalledWith('expense');
    });

    it('returns correct itemIndex from registeredItems', () => {
        const ctx = createMockContext({registeredItems: ['quick-action', 'expense', 'track-distance']});
        const {result} = renderHook(() => useFABMenuItem('expense', true), {wrapper: createWrapper(ctx)});

        expect(result.current.itemIndex).toBe(1);
    });

    it('returns -1 when item is not in registeredItems', () => {
        const ctx = createMockContext({registeredItems: ['quick-action', 'track-distance']});
        const {result} = renderHook(() => useFABMenuItem('expense', true), {wrapper: createWrapper(ctx)});

        expect(result.current.itemIndex).toBe(-1);
    });

    it('returns isFocused true when focusedIndex matches itemIndex', () => {
        const ctx = createMockContext({
            registeredItems: ['quick-action', 'expense', 'track-distance'],
            focusedIndex: 1,
        });
        const {result} = renderHook(() => useFABMenuItem('expense', true), {wrapper: createWrapper(ctx)});

        expect(result.current.isFocused).toBe(true);
    });

    it('returns isFocused false when focusedIndex does not match', () => {
        const ctx = createMockContext({
            registeredItems: ['quick-action', 'expense', 'track-distance'],
            focusedIndex: 0,
        });
        const {result} = renderHook(() => useFABMenuItem('expense', true), {wrapper: createWrapper(ctx)});

        expect(result.current.isFocused).toBe(false);
    });

    it('returns isFocused false when focusedIndex is -1', () => {
        const ctx = createMockContext({
            registeredItems: ['quick-action', 'expense'],
            focusedIndex: -1,
        });
        const {result} = renderHook(() => useFABMenuItem('expense', true), {wrapper: createWrapper(ctx)});

        expect(result.current.isFocused).toBe(false);
    });

    it('passes through setFocusedIndex from context', () => {
        const mockSetFocusedIndex = jest.fn();
        const ctx = createMockContext({setFocusedIndex: mockSetFocusedIndex});
        const {result} = renderHook(() => useFABMenuItem('expense', true), {wrapper: createWrapper(ctx)});

        act(() => {
            result.current.setFocusedIndex(2);
        });

        expect(mockSetFocusedIndex).toHaveBeenCalledWith(2);
    });

    it('passes through onItemPress from context', () => {
        const mockOnItemPress = jest.fn();
        const ctx = createMockContext({onItemPress: mockOnItemPress});
        const {result} = renderHook(() => useFABMenuItem('expense', true), {wrapper: createWrapper(ctx)});

        const callback = jest.fn();
        act(() => {
            result.current.onItemPress(callback, {shouldCallAfterModalHide: true});
        });

        expect(mockOnItemPress).toHaveBeenCalledWith(callback, {shouldCallAfterModalHide: true});
    });

    it('defaults isVisible to true when not provided', () => {
        const ctx = createMockContext();
        renderHook(() => useFABMenuItem('expense'), {wrapper: createWrapper(ctx)});

        expect(ctx.registerItem).toHaveBeenCalledWith('expense');
    });
});
