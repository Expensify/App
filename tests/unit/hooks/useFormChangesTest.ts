import {act, renderHook} from '@testing-library/react-native';

import useFormChanges from '@hooks/useFormChanges';

describe('useFormChanges', () => {
    it('tracks local edits and becomes clean after reverting them', () => {
        // Given a form initialized from saved input
        const {result} = renderHook(() => useFormChanges({categoryName: 'Travel'}));
        expect(result.current.getHasUnsavedChanges()).toBe(false);
        // When the user changes the input
        act(() => result.current.recordChange('Meals', 'categoryName'));
        // Then it stays dirty only until the original value is restored
        expect(result.current.getHasUnsavedChanges()).toBe(true);
        act(() => result.current.recordChange('Travel', 'categoryName'));
        expect(result.current.getHasUnsavedChanges()).toBe(false);
    });

    it('captures asynchronously loaded defaults when editing starts and retains that baseline', () => {
        // Given defaults arrive after the loading render
        const {result, rerender} = renderHook(({name}) => useFormChanges({name}), {initialProps: {name: ''}});
        rerender({name: 'Loaded'});
        // When editing begins and a later render supplies different defaults
        act(() => result.current.recordChange('Edited', 'name'));
        rerender({name: 'Edited'});
        // Then new props cannot silently mark the pending edit saved
        expect(result.current.getHasUnsavedChanges()).toBe(true);
        act(() => result.current.recordChange('Loaded', 'name'));
        expect(result.current.getHasUnsavedChanges()).toBe(false);
    });
});
