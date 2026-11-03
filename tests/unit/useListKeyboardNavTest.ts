import {act, renderHook} from '@testing-library/react-native';

import type useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useListKeyboardNav from '@hooks/useListKeyboardNav';

import type * as ReactNavigation from '@react-navigation/native';
import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import createMock from '../utils/createMock';

type ShortcutCallback = Parameters<typeof useKeyboardShortcut>[1];
type ShortcutConfig = Parameters<typeof useKeyboardShortcut>[2];

const shortcuts: Record<string, {callback: ShortcutCallback; isActive: boolean}> = {};

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => true,
    };
});

jest.mock('@hooks/useKeyboardShortcut', () => (key: Parameters<typeof useKeyboardShortcut>[0], callback: ShortcutCallback, config?: ShortcutConfig) => {
    shortcuts[key.shortcutKey] = {callback, isActive: config?.isActive ?? true};
});

function pressArrowDown() {
    act(() => {
        if (!shortcuts.ArrowDown?.isActive) {
            return;
        }
        shortcuts.ArrowDown.callback();
    });
}

function pressArrowUp() {
    act(() => {
        if (!shortcuts.ArrowUp?.isActive) {
            return;
        }
        shortcuts.ArrowUp.callback();
    });
}

function createContainerRef() {
    const container = document.createElement('div');
    document.body.appendChild(container);
    return {ref: {current: container}, cleanup: () => container.remove()};
}

function simulateFocusIn(container: HTMLElement) {
    act(() => {
        container.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
    });
}

function simulateFocusOut(container: HTMLElement, relatedTarget: EventTarget | null = document.body) {
    act(() => {
        container.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget}));
    });
}

describe('useListKeyboardNav', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        for (const key of Object.keys(shortcuts)) {
            delete shortcuts[key];
        }
    });

    it('should navigate with arrow keys after focusin', () => {
        const {ref, cleanup} = createContainerRef();
        const {result} = renderHook(() =>
            useListKeyboardNav({
                isActive: true,
                itemKeys: ['a', 'b', 'c'],
                disabledIndexes: [],
                containerRef: ref,
            }),
        );

        expect(result.current.focusedIndex).toBe(-1);

        // Arrow keys should work on fresh mount (isFocused && !hasBeenFocused)
        pressArrowDown();
        expect(result.current.focusedIndex).toBe(0);

        pressArrowDown();
        expect(result.current.focusedIndex).toBe(1);

        pressArrowUp();
        expect(result.current.focusedIndex).toBe(0);

        cleanup();
    });

    it('should wrap from last item to first on ArrowDown', () => {
        const {ref, cleanup} = createContainerRef();
        const {result} = renderHook(() =>
            useListKeyboardNav({
                isActive: true,
                itemKeys: ['a', 'b', 'c'],
                disabledIndexes: [],
                containerRef: ref,
            }),
        );

        // Navigate to last item
        pressArrowDown();
        pressArrowDown();
        pressArrowDown();
        expect(result.current.focusedIndex).toBe(2);

        // ArrowDown at last item should wrap to first
        pressArrowDown();
        expect(result.current.focusedIndex).toBe(0);

        cleanup();
    });

    it('should wrap from first item to last on ArrowUp', () => {
        const {ref, cleanup} = createContainerRef();
        const {result} = renderHook(() =>
            useListKeyboardNav({
                isActive: true,
                itemKeys: ['a', 'b', 'c'],
                disabledIndexes: [],
                containerRef: ref,
            }),
        );

        // Navigate to first item
        pressArrowDown();
        expect(result.current.focusedIndex).toBe(0);

        // ArrowUp at first item should wrap to last
        pressArrowUp();
        expect(result.current.focusedIndex).toBe(2);

        cleanup();
    });

    it('should disable arrow keys when isActive is false', () => {
        const {ref, cleanup} = createContainerRef();
        const {result} = renderHook(() =>
            useListKeyboardNav({
                isActive: false,
                itemKeys: ['a', 'b', 'c'],
                disabledIndexes: [],
                containerRef: ref,
            }),
        );

        pressArrowDown();
        expect(result.current.focusedIndex).toBe(-1);

        cleanup();
    });

    it('should disable arrow keys after focusout and re-enable after focusin', () => {
        const {ref, cleanup} = createContainerRef();
        const {result} = renderHook(() =>
            useListKeyboardNav({
                isActive: true,
                itemKeys: ['a', 'b', 'c'],
                disabledIndexes: [],
                containerRef: ref,
            }),
        );

        // Focus in and navigate
        simulateFocusIn(ref.current);
        pressArrowDown();
        expect(result.current.focusedIndex).toBe(0);

        // Focus out resets focusedIndex and disables arrows
        simulateFocusOut(ref.current);
        expect(result.current.focusedIndex).toBe(-1);

        pressArrowDown();
        // After focusout, hasBeenFocused=true and hasFocus=false, so isArrowKeyActive=false
        expect(result.current.focusedIndex).toBe(-1);

        // Focus back in re-enables arrows
        simulateFocusIn(ref.current);
        pressArrowDown();
        expect(result.current.focusedIndex).toBe(0);

        cleanup();
    });

    it('should keep focusedIndex at same position when data reorders', () => {
        const {ref, cleanup} = createContainerRef();
        const {result, rerender} = renderHook(
            ({itemKeys}: {itemKeys: string[]}) =>
                useListKeyboardNav({
                    isActive: true,
                    itemKeys,
                    disabledIndexes: [],
                    containerRef: ref,
                }),
            {initialProps: {itemKeys: ['a', 'b', 'c']}},
        );

        // Navigate to 'b' (index 1)
        pressArrowDown();
        pressArrowDown();
        expect(result.current.focusedIndex).toBe(1);

        // Reorder: 'b' moves to index 2, focus stays at index 1 (now 'c')
        rerender({itemKeys: ['a', 'c', 'b']});
        expect(result.current.focusedIndex).toBe(1);

        cleanup();
    });

    it('should clamp focusedIndex when list shrinks', () => {
        const {ref, cleanup} = createContainerRef();
        const {result, rerender} = renderHook(
            ({itemKeys}: {itemKeys: string[]}) =>
                useListKeyboardNav({
                    isActive: true,
                    itemKeys,
                    disabledIndexes: [],
                    containerRef: ref,
                }),
            {initialProps: {itemKeys: ['a', 'b', 'c']}},
        );

        // Navigate to 'c' (index 2)
        pressArrowDown();
        pressArrowDown();
        pressArrowDown();
        expect(result.current.focusedIndex).toBe(2);

        // Shrink list — focusedIndex should clamp to last item
        rerender({itemKeys: ['a', 'b']});
        expect(result.current.focusedIndex).toBe(1);

        cleanup();
    });

    it('should preserve focusedIndex when focusout has null relatedTarget (React re-render)', () => {
        const {ref, cleanup} = createContainerRef();
        const {result} = renderHook(() =>
            useListKeyboardNav({
                isActive: true,
                itemKeys: ['a', 'b', 'c'],
                disabledIndexes: [],
                containerRef: ref,
            }),
        );

        simulateFocusIn(ref.current);
        pressArrowDown();
        expect(result.current.focusedIndex).toBe(0);

        // focusout with null relatedTarget (DOM element destroyed by React re-render)
        simulateFocusOut(ref.current, null);
        expect(result.current.focusedIndex).toBe(0);

        cleanup();
    });

    it('should skip disabled indexes', () => {
        const {ref, cleanup} = createContainerRef();
        const {result} = renderHook(() =>
            useListKeyboardNav({
                isActive: true,
                itemKeys: ['a', 'b', 'c'],
                disabledIndexes: [1],
                containerRef: ref,
            }),
        );

        pressArrowDown();
        expect(result.current.focusedIndex).toBe(0);

        // Should skip index 1 (disabled) and go to index 2
        pressArrowDown();
        expect(result.current.focusedIndex).toBe(2);

        cleanup();
    });

    it('should skip forward past disabled index when reorder lands focus on disabled item', () => {
        const {ref, cleanup} = createContainerRef();
        const {result, rerender} = renderHook(
            ({itemKeys, disabledIndexes}: {itemKeys: string[]; disabledIndexes: number[]}) =>
                useListKeyboardNav({
                    isActive: true,
                    itemKeys,
                    disabledIndexes,
                    containerRef: ref,
                }),
            {initialProps: {itemKeys: ['disabled', 'a', 'b'], disabledIndexes: [0]}},
        );

        // Navigate to 'a' (index 1)
        pressArrowDown();
        expect(result.current.focusedIndex).toBe(1);

        // Reorder: 'a' moves away, disabled item shifts to index 1
        rerender({itemKeys: ['a', 'disabled', 'b'], disabledIndexes: [1]});
        // Focus should skip past disabled index 1 to index 2
        expect(result.current.focusedIndex).toBe(2);

        cleanup();
    });

    it('should sync focusedIndex when Tab focuses an item (focusin with matching id)', () => {
        const {ref, cleanup} = createContainerRef();
        const {result} = renderHook(() =>
            useListKeyboardNav({
                isActive: true,
                itemKeys: ['a', 'b', 'c'],
                disabledIndexes: [],
                containerRef: ref,
            }),
        );

        expect(result.current.focusedIndex).toBe(-1);

        // Simulate Tab-focusing the item with id='b' (index 1)
        const child = document.createElement('button');
        child.id = 'b';
        ref.current.appendChild(child);

        act(() => {
            child.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        });

        expect(result.current.focusedIndex).toBe(1);

        child.remove();
        cleanup();
    });

    it('should scan backward when all items after focused index are disabled', () => {
        const {ref, cleanup} = createContainerRef();
        const {result, rerender} = renderHook(
            ({itemKeys, disabledIndexes}: {itemKeys: string[]; disabledIndexes: number[]}) =>
                useListKeyboardNav({
                    isActive: true,
                    itemKeys,
                    disabledIndexes,
                    containerRef: ref,
                }),
            {initialProps: {itemKeys: ['a', 'b', 'disabled'], disabledIndexes: [2]}},
        );

        // Navigate to 'b' (index 1)
        pressArrowDown();
        pressArrowDown();
        expect(result.current.focusedIndex).toBe(1);

        // Reorder: disabled item moves to index 1, 'b' moves to index 2 (also disabled)
        rerender({itemKeys: ['a', 'disabled', 'disabled2'], disabledIndexes: [1, 2]});
        // Focus should scan backward from index 1 to index 0
        expect(result.current.focusedIndex).toBe(0);

        cleanup();
    });

    it('keeps focus active when moving between children in the container', () => {
        // Given two rows in the same list, focusout must not disable internal keyboard navigation.
        const {ref, cleanup} = createContainerRef();
        const first = document.createElement('button');
        const second = document.createElement('button');
        first.id = 'a';
        second.id = 'b';
        ref.current.append(first, second);
        const {result} = renderHook(() => useListKeyboardNav({isActive: true, itemKeys: ['a', 'b', 'c'], disabledIndexes: [], containerRef: ref}));
        // When the browser transfers focus to another row, the related target is still contained.
        act(() => {
            first.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            first.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget: second}));
        });
        pressArrowDown();
        // Then the next arrow must advance instead of becoming inactive or resetting the index.
        expect(result.current.focusedIndex).toBe(1);
        cleanup();
    });

    it('updates focus state for unmatched and non-element targets without selecting a row', () => {
        // Given a list that previously lost focus, target-id matching cannot gate focus-state updates.
        const {ref, cleanup} = createContainerRef();
        const unmatched = document.createElement('button');
        unmatched.id = 'unmatched';
        const text = document.createTextNode('nested text');
        ref.current.append(unmatched, text);
        const {result} = renderHook(() => useListKeyboardNav({isActive: true, itemKeys: ['a', 'b'], disabledIndexes: [], containerRef: ref}));
        simulateFocusIn(ref.current);
        simulateFocusOut(ref.current);
        // When an unmatched row and then a text node receive focus, both still activate the list.
        act(() => {
            unmatched.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        });
        expect(result.current.focusedIndex).toBe(-1);
        pressArrowDown();
        expect(result.current.focusedIndex).toBe(0);
        simulateFocusOut(ref.current);
        act(() => {
            text.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        });
        pressArrowDown();
        // Then the list recovers arrow navigation without interpreting either target as a known row.
        expect(result.current.focusedIndex).toBe(0);
        cleanup();
    });

    it('handles a null focus target and removes the exact DOM listeners on unmount', () => {
        // Given a browser container, retain the actual registered callback rather than replacing the hook.
        const {ref, cleanup} = createContainerRef();
        const addListener = jest.spyOn(ref.current, 'addEventListener');
        const removeListener = jest.spyOn(ref.current, 'removeEventListener');
        const {result, unmount} = renderHook(() => useListKeyboardNav({isActive: true, itemKeys: ['a'], disabledIndexes: [], containerRef: ref}));
        const focusIn = addListener.mock.calls.find(([name]) => name === 'focusin');
        const focusOut = addListener.mock.calls.find(([name]) => name === 'focusout');
        expect(focusIn).toBeDefined();
        expect(focusOut).toBeDefined();
        if (!focusIn || !focusOut || typeof focusIn[1] !== 'function') {
            throw new Error('The list must register its DOM focus listeners');
        }
        // When a newly constructed event has no target, it still represents focus activation.
        const notifyFocusIn = focusIn[1];
        act(() => notifyFocusIn(new FocusEvent('focusin')));
        pressArrowDown();
        unmount();
        // Then navigation remains usable and both exact callbacks are released.
        expect(result.current.focusedIndex).toBe(0);
        expect(removeListener).toHaveBeenCalledWith('focusin', focusIn[1]);
        expect(removeListener).toHaveBeenCalledWith('focusout', focusOut[1]);
        cleanup();
    });

    it('retains native View ownership without attaching DOM listeners', () => {
        // Given a real native View contract, no browser methods are part of the container.
        const nativeView = createMock<ComponentRef<typeof View>>({focus: jest.fn<void, []>()});
        const containerRef = {current: nativeView};
        // When the generic hook receives a native container, traversal remains independent of DOM focus.
        const {result, unmount} = renderHook(() => useListKeyboardNav({isActive: true, itemKeys: ['a'], disabledIndexes: [], containerRef}));
        pressArrowDown();
        // Then native ownership is unchanged and the DOM listener branch is bypassed.
        expect(result.current.focusedIndex).toBe(0);
        unmount();
    });

    it.each([
        {itemKeys: [], disabledIndexes: []},
        {itemKeys: ['a', 'b'], disabledIndexes: [0, 1]},
    ])('does not select an item when no enabled row exists: %j', ({itemKeys, disabledIndexes}) => {
        // Given an empty or fully disabled list, neither direction may manufacture an enabled row.
        const {ref, cleanup} = createContainerRef();
        const {result} = renderHook(() => useListKeyboardNav({isActive: true, itemKeys, disabledIndexes, containerRef: ref}));
        // When traversal is requested in both directions, execute the real arrow manager.
        pressArrowDown();
        pressArrowUp();
        // Then the unfocused marker remains intact, including the all-disabled loop termination.
        expect(result.current.focusedIndex).toBe(-1);
        cleanup();
    });

    it('uses the latest item order for focus events and adjusts after shrinking', () => {
        // Given focus on the last row, a reorder changes the id-to-index correspondence.
        const {ref, cleanup} = createContainerRef();
        const child = document.createElement('button');
        child.id = 'c';
        ref.current.appendChild(child);
        const {result, rerender} = renderHook(({itemKeys}: {itemKeys: string[]}) => useListKeyboardNav({isActive: true, itemKeys, disabledIndexes: [], containerRef: ref}), {
            initialProps: {itemKeys: ['a', 'b', 'c']},
        });
        act(() => {
            child.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        });
        expect(result.current.focusedIndex).toBe(2);
        // When the order changes, the layout effect must update the keys before the next focus event.
        rerender({itemKeys: ['c', 'a', 'b']});
        act(() => {
            child.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        });
        expect(result.current.focusedIndex).toBe(0);
        act(() => result.current.setFocusedIndex(2));
        rerender({itemKeys: ['c']});
        // Then shrinking clamps to the surviving row and an empty list restores the unfocused marker.
        expect(result.current.focusedIndex).toBe(0);
        rerender({itemKeys: []});
        expect(result.current.focusedIndex).toBe(-1);
        cleanup();
    });
});
