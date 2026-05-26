import {act, renderHook} from '@testing-library/react-native';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';

type ShortcutCallback = () => void;
type ShortcutConfig = {isActive?: boolean};

const shortcuts: Record<string, {callback: ShortcutCallback; isActive: boolean}> = {};

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

describe('useArrowKeyFocusManager', () => {
    afterEach(() => {
        for (const key of Object.keys(shortcuts)) {
            delete shortcuts[key];
        }
    });

    it('defaults shouldScroll to false when the setter is called without the optional flag', () => {
        const onFocusedIndexChange = jest.fn();
        const {result} = renderHook(() =>
            useArrowKeyFocusManager({
                maxIndex: 5,
                initialFocusedIndex: 0,
                onFocusedIndexChange,
            }),
        );

        act(() => {
            result.current[1](2);
        });

        expect(onFocusedIndexChange).toHaveBeenCalledTimes(1);
        expect(onFocusedIndexChange).toHaveBeenCalledWith(2, false);
    });

    it('forwards shouldScroll: true through to onFocusedIndexChange', () => {
        const onFocusedIndexChange = jest.fn();
        const {result} = renderHook(() =>
            useArrowKeyFocusManager({
                maxIndex: 5,
                initialFocusedIndex: 0,
                onFocusedIndexChange,
            }),
        );

        act(() => {
            result.current[1](2, true);
        });

        expect(onFocusedIndexChange).toHaveBeenCalledTimes(1);
        expect(onFocusedIndexChange).toHaveBeenCalledWith(2, true);
    });

    it('forwards shouldScroll: false through to onFocusedIndexChange', () => {
        const onFocusedIndexChange = jest.fn();
        const {result} = renderHook(() =>
            useArrowKeyFocusManager({
                maxIndex: 5,
                initialFocusedIndex: 0,
                onFocusedIndexChange,
            }),
        );

        act(() => {
            result.current[1](2, false);
        });

        expect(onFocusedIndexChange).toHaveBeenCalledTimes(1);
        expect(onFocusedIndexChange).toHaveBeenCalledWith(2, false);
    });

    it('arrow key navigation forwards shouldScroll: true', () => {
        const onFocusedIndexChange = jest.fn();
        renderHook(() =>
            useArrowKeyFocusManager({
                maxIndex: 5,
                initialFocusedIndex: 0,
                onFocusedIndexChange,
                isActive: true,
            }),
        );

        pressArrowDown();

        expect(onFocusedIndexChange).toHaveBeenCalledTimes(1);
        expect(onFocusedIndexChange).toHaveBeenCalledWith(1, true);
    });

    it('arrow keys override a previous shouldScroll: false from setFocusedIndex', () => {
        const onFocusedIndexChange = jest.fn();
        const {result} = renderHook(() =>
            useArrowKeyFocusManager({
                maxIndex: 5,
                initialFocusedIndex: 0,
                onFocusedIndexChange,
                isActive: true,
            }),
        );

        // Public setter parks the ref at false (e.g., focus-driven update).
        act(() => {
            result.current[1](2, false);
        });
        expect(onFocusedIndexChange).toHaveBeenLastCalledWith(2, false);

        // Arrow key must reassert shouldScroll: true; otherwise a focus event
        // before an arrow press would silently suppress the next scroll.
        pressArrowDown();
        expect(onFocusedIndexChange).toHaveBeenLastCalledWith(3, true);
    });

    it('forwards independent shouldScroll values on successive calls', () => {
        const onFocusedIndexChange = jest.fn();
        const {result} = renderHook(() =>
            useArrowKeyFocusManager({
                maxIndex: 5,
                initialFocusedIndex: 0,
                onFocusedIndexChange,
            }),
        );

        act(() => {
            result.current[1](2, false);
        });
        expect(onFocusedIndexChange).toHaveBeenLastCalledWith(2, false);

        act(() => {
            result.current[1](3, true);
        });
        expect(onFocusedIndexChange).toHaveBeenLastCalledWith(3, true);

        act(() => {
            result.current[1](4, false);
        });
        expect(onFocusedIndexChange).toHaveBeenLastCalledWith(4, false);

        expect(onFocusedIndexChange).toHaveBeenCalledTimes(3);
    });
});
