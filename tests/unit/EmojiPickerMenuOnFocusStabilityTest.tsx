import {renderHook} from '@testing-library/react-native';
import useStableIndexedHandler from '@hooks/useStableIndexedHandler';

describe('EmojiPickerMenu onFocus stability', () => {
    it('dispatches the correct index to setFocusedIndex when onFocus is called', () => {
        const setFocusedIndex = jest.fn();
        const {result} = renderHook(() => useStableIndexedHandler(setFocusedIndex));

        result.current(3)();
        expect(setFocusedIndex).toHaveBeenCalledWith(3);
    });

    it('returns the same onFocus reference for a given index across re-renders', () => {
        const setFocusedIndex = jest.fn();
        const {result, rerender} = renderHook(() => useStableIndexedHandler(setFocusedIndex));

        const onFocusAt2 = result.current(2);
        rerender({});
        expect(result.current(2)).toBe(onFocusAt2);
    });
});
