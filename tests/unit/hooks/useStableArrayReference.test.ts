import {renderHook} from '@testing-library/react-native';
import useStableArrayReference from '@hooks/useStableArrayReference';

describe('useStableArrayReference', () => {
    it('returns the input array on the first render', () => {
        const input = [1, 2, 3];
        const {result} = renderHook(({value}: {value: number[]}) => useStableArrayReference(value), {initialProps: {value: input}});

        expect(result.current).toBe(input);
    });

    it('preserves the previous reference when contents are equal but the array is new', () => {
        const initial = [1, 2, 3];
        const {result, rerender} = renderHook(({value}: {value: number[]}) => useStableArrayReference(value), {initialProps: {value: initial}});
        const firstReference = result.current;

        rerender({value: [1, 2, 3]});

        expect(result.current).toBe(firstReference);
    });

    it('returns the new reference when contents change', () => {
        const initial = [1, 2, 3];
        const next = [1, 2, 4];
        const {result, rerender} = renderHook(({value}: {value: number[]}) => useStableArrayReference(value), {initialProps: {value: initial}});

        rerender({value: next});

        expect(result.current).toBe(next);
    });

    it('returns the new reference when array length changes', () => {
        const initial = [1, 2, 3];
        const longer = [1, 2, 3, 4];
        const {result, rerender} = renderHook(({value}: {value: number[]}) => useStableArrayReference(value), {initialProps: {value: initial}});

        rerender({value: longer});

        expect(result.current).toBe(longer);
    });

    it('keeps the same reference across multiple content-equal renders', () => {
        const initial = ['a', 'b'];
        const {result, rerender} = renderHook(({value}: {value: string[]}) => useStableArrayReference(value), {initialProps: {value: initial}});
        const firstReference = result.current;

        rerender({value: ['a', 'b']});
        rerender({value: ['a', 'b']});
        rerender({value: ['a', 'b']});

        expect(result.current).toBe(firstReference);
    });

    it('stabilizes on the new reference after a content change, then preserves it', () => {
        const initial = [1, 2];
        const changed = [1, 2, 3];
        const {result, rerender} = renderHook(({value}: {value: number[]}) => useStableArrayReference(value), {initialProps: {value: initial}});

        rerender({value: changed});
        const referenceAfterChange = result.current;

        rerender({value: [1, 2, 3]});
        expect(result.current).toBe(referenceAfterChange);
    });

    it('handles transitions involving empty arrays', () => {
        const initial: number[] = [];
        const {result, rerender} = renderHook(({value}: {value: number[]}) => useStableArrayReference(value), {initialProps: {value: initial}});
        const firstReference = result.current;

        rerender({value: []});
        expect(result.current).toBe(firstReference);

        const populated = [1];
        rerender({value: populated});
        expect(result.current).toBe(populated);

        rerender({value: []});
        expect(result.current).not.toBe(firstReference);
        expect(result.current).toEqual([]);
    });

    it('treats element identity as the equality check (object refs matter)', () => {
        const objectA = {id: 1};
        const objectB = {id: 1};
        const initial = [objectA];
        const {result, rerender} = renderHook(({value}: {value: Array<{id: number}>}) => useStableArrayReference(value), {initialProps: {value: initial}});
        const firstReference = result.current;

        rerender({value: [objectB]});

        expect(result.current).not.toBe(firstReference);
        expect(result.current.at(0)).toBe(objectB);
    });
});
