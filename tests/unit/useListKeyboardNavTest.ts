import {act, renderHook} from '@testing-library/react-native';
import useListKeyboardNav from '@hooks/useListKeyboardNav';
import type Navigation from '@libs/Navigation/Navigation';

type ShortcutCallback = () => void;
type ShortcutConfig = {isActive?: boolean};

const shortcuts: Record<string, {callback: ShortcutCallback; isActive: boolean}> = {};

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => true,
    };
});

jest.mock('@hooks/useActiveElementRole', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => null,
}));

jest.mock('@hooks/useKeyboardShortcut', () => (key: {shortcutKey: string}, callback: ShortcutCallback, config?: ShortcutConfig) => {
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

function pressEnter() {
    act(() => {
        if (!shortcuts.Enter?.isActive) {
            return;
        }
        shortcuts.Enter.callback();
    });
}

function pressSpace() {
    act(() => {
        if (!shortcuts.Space?.isActive) {
            return;
        }
        shortcuts.Space.callback();
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
                onSelect: jest.fn(),
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

    it('should call onSelect when Enter is pressed on a focused item', () => {
        const {ref, cleanup} = createContainerRef();
        const onSelect = jest.fn();
        renderHook(() =>
            useListKeyboardNav({
                isActive: true,
                itemKeys: ['a', 'b', 'c'],
                disabledIndexes: [],
                containerRef: ref,
                onSelect,
            }),
        );

        // Navigate to first item and focus in
        pressArrowDown();
        simulateFocusIn(ref.current);

        pressEnter();
        expect(onSelect).toHaveBeenCalledWith(0);

        cleanup();
    });

    it('should call onSelect when Space is pressed on a focused item', () => {
        const {ref, cleanup} = createContainerRef();
        const onSelect = jest.fn();
        renderHook(() =>
            useListKeyboardNav({
                isActive: true,
                itemKeys: ['a', 'b', 'c'],
                disabledIndexes: [],
                containerRef: ref,
                onSelect,
            }),
        );

        pressArrowDown();
        simulateFocusIn(ref.current);

        pressSpace();
        expect(onSelect).toHaveBeenCalledWith(0);

        cleanup();
    });

    it('should not call onSelect when focusedIndex is -1', () => {
        const {ref, cleanup} = createContainerRef();
        const onSelect = jest.fn();
        renderHook(() =>
            useListKeyboardNav({
                isActive: true,
                itemKeys: ['a', 'b', 'c'],
                disabledIndexes: [],
                containerRef: ref,
                onSelect,
            }),
        );

        simulateFocusIn(ref.current);
        pressEnter();
        expect(onSelect).not.toHaveBeenCalled();

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
                onSelect: jest.fn(),
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
                onSelect: jest.fn(),
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

    it('should track focused item across data reorders', () => {
        const {ref, cleanup} = createContainerRef();
        const {result, rerender} = renderHook(
            ({itemKeys}: {itemKeys: string[]}) =>
                useListKeyboardNav({
                    isActive: true,
                    itemKeys,
                    disabledIndexes: [],
                    containerRef: ref,
                    onSelect: jest.fn(),
                }),
            {initialProps: {itemKeys: ['a', 'b', 'c']}},
        );

        // Navigate to 'b' (index 1)
        pressArrowDown();
        pressArrowDown();
        expect(result.current.focusedIndex).toBe(1);

        // Reorder: 'b' moves to index 2
        rerender({itemKeys: ['a', 'c', 'b']});
        expect(result.current.focusedIndex).toBe(2);

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
                    onSelect: jest.fn(),
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
                onSelect: jest.fn(),
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
                onSelect: jest.fn(),
            }),
        );

        pressArrowDown();
        expect(result.current.focusedIndex).toBe(0);

        // Should skip index 1 (disabled) and go to index 2
        pressArrowDown();
        expect(result.current.focusedIndex).toBe(2);

        cleanup();
    });
});
