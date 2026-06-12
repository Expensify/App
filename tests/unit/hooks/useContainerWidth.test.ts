import {act, renderHook} from '@testing-library/react-native';
import type {LayoutChangeEvent} from 'react-native';
import useContainerWidth from '@hooks/useContainerWidth';

function createLayoutEvent(width: number): LayoutChangeEvent {
    return {nativeEvent: {layout: {x: 0, y: 0, width, height: 0}}} as LayoutChangeEvent;
}

describe('useContainerWidth', () => {
    it('should start with containerWidth of 0', () => {
        const {result} = renderHook(() => useContainerWidth());

        expect(result.current.containerWidth).toBe(0);
    });

    it('should update containerWidth when onLayout is called', () => {
        const {result} = renderHook(() => useContainerWidth());

        act(() => {
            result.current.onLayout(createLayoutEvent(320));
        });

        expect(result.current.containerWidth).toBe(320);
    });

    it('should subtract offset from the layout width', () => {
        const {result} = renderHook(() => useContainerWidth(24));

        act(() => {
            result.current.onLayout(createLayoutEvent(320));
        });

        expect(result.current.containerWidth).toBe(296);
    });

    it('should use updated offset when re-rendered with a new value', () => {
        const {result, rerender} = renderHook(({offset}) => useContainerWidth(offset), {initialProps: {offset: 10}});

        act(() => {
            result.current.onLayout(createLayoutEvent(200));
        });

        expect(result.current.containerWidth).toBe(190);

        rerender({offset: 30});

        act(() => {
            result.current.onLayout(createLayoutEvent(200));
        });

        expect(result.current.containerWidth).toBe(170);
    });
});
