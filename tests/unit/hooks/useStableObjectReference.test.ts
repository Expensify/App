import {renderHook} from '@testing-library/react-native';

import useStableObjectReference from '@hooks/useStableObjectReference';

type Value = Record<string, unknown> | undefined;

const sharedEntry = {id: 1};

describe('useStableObjectReference', () => {
    it.each<[string, Value, Value, boolean]>([
        ['keeps the previous reference when a new object holds the same value references', {entry: sharedEntry}, {entry: sharedEntry}, true],
        ['returns the new object when a value reference changes', {entry: sharedEntry}, {entry: {id: 1}}, false],
        ['returns the new object when a key is added', {entry: sharedEntry}, {entry: sharedEntry, other: 1}, false],
        ['keeps undefined when it stays undefined', undefined, undefined, true],
        ['returns the new object when the value was undefined', undefined, {entry: sharedEntry}, false],
        ['returns undefined when the object becomes undefined', {entry: sharedEntry}, undefined, false],
    ])('%s', (_description, firstValue, nextValue, shouldKeepPreviousReference) => {
        // Given the value from the first render
        const {result, rerender} = renderHook(({value}: {value: Value}) => useStableObjectReference(value), {initialProps: {value: firstValue}});

        // When the next render passes another value
        rerender({value: nextValue});

        // Then the previous reference is kept only while every value is the same reference
        expect(result.current).toBe(shouldKeepPreviousReference ? firstValue : nextValue);
    });
});
