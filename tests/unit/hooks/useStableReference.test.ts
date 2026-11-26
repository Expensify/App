import {renderHook} from '@testing-library/react-native';

import useStableReference from '@hooks/useStableReference';

type Value = {name: string};

const haveSameName = (previous: Value, next: Value) => previous.name === next.name;

function renderStableReference(initialValue: Value) {
    return renderHook(({value}: {value: Value}) => useStableReference(value, haveSameName), {initialProps: {value: initialValue}});
}

describe('useStableReference', () => {
    it('returns the input on the first render', () => {
        // Given a value
        const value = {name: 'a'};

        // When the hook renders for the first time
        const {result} = renderStableReference(value);

        // Then the input is returned
        expect(result.current).toBe(value);
    });

    it.each([
        ['keeps the previous reference when the comparison says the values are equal', {name: 'a'}, true],
        ['returns the new value when the comparison says the values differ', {name: 'b'}, false],
    ])('%s', (_description, nextValue, shouldKeepPreviousReference) => {
        // Given the value from the first render
        const firstValue = {name: 'a'};
        const {result, rerender} = renderStableReference(firstValue);

        // When the next render passes a new object
        rerender({value: nextValue});

        // Then the comparison decides whether the previous reference is kept
        expect(result.current).toBe(shouldKeepPreviousReference ? firstValue : nextValue);
    });

    it('keeps the new reference after a change while later values stay equal', () => {
        // Given a value that changed on the second render
        const {result, rerender} = renderStableReference({name: 'a'});
        const changedValue = {name: 'b'};
        rerender({value: changedValue});

        // When later renders pass new objects equal to the changed value
        rerender({value: {name: 'b'}});
        rerender({value: {name: 'b'}});

        // Then the reference from the change is kept
        expect(result.current).toBe(changedValue);
    });
});
