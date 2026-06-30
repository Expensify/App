import {renderHook} from '@testing-library/react-native';
import type {OnyxCollection} from 'react-native-onyx';
import useCollectionDelta from '@hooks/useCollectionDelta';

type Item = {v: number};

function renderUseCollectionDelta(initialProps: OnyxCollection<Item>) {
    return renderHook((value: OnyxCollection<Item>) => useCollectionDelta(value), {initialProps});
}

describe('useCollectionDelta', () => {
    it('should return undefined on the first render (nothing to diff against)', () => {
        const {result} = renderUseCollectionDelta({a: {v: 1}});
        expect(result.current).toBeUndefined();
    });

    it('should return the members added since the previous render', () => {
        const a: Item = {v: 1};
        const b: Item = {v: 2};
        const {result, rerender} = renderUseCollectionDelta({a});

        rerender({a, b});
        expect(result.current).toStrictEqual({b});
    });

    it('should return a changed member with its current value', () => {
        const a: Item = {v: 1};
        const aNext: Item = {v: 2};
        const {result, rerender} = renderUseCollectionDelta({a});

        rerender({a: aNext});
        expect(result.current).toStrictEqual({a: aNext});
    });

    it('should return a removed member as undefined', () => {
        const a: Item = {v: 1};
        const b: Item = {v: 2};
        const {result, rerender} = renderUseCollectionDelta({a, b});

        rerender({a});
        expect(result.current).toStrictEqual({b: undefined});
    });

    it('should return undefined when the value reference is unchanged between renders', () => {
        const collection: OnyxCollection<Item> = {a: {v: 1}};
        const {result, rerender} = renderUseCollectionDelta(collection);

        rerender(collection);
        expect(result.current).toBeUndefined();
    });

    it('should return undefined when members keep their references across renders (structural sharing)', () => {
        const a: Item = {v: 1};
        const {result, rerender} = renderUseCollectionDelta({a});

        // New container object, same member reference.
        rerender({a});
        expect(result.current).toBeUndefined();
    });
});
