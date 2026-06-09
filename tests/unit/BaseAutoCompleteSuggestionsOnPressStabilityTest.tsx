import {renderHook} from '@testing-library/react-native';
import useStableIndexedHandler from '@hooks/useStableIndexedHandler';

describe('BaseAutoCompleteSuggestions onPress stability', () => {
    it('dispatches the correct index to onSelect when onPress is called', () => {
        const onSelect = jest.fn();
        const {result} = renderHook(() => useStableIndexedHandler(onSelect));

        result.current(1)();
        expect(onSelect).toHaveBeenCalledWith(1);
    });

    it('returns the same onPress reference for a given index across re-renders', () => {
        const onSelect = jest.fn();
        const {result, rerender} = renderHook(() => useStableIndexedHandler(onSelect));

        const onPressAt0 = result.current(0);
        rerender({});
        expect(result.current(0)).toBe(onPressAt0);
    });
});
