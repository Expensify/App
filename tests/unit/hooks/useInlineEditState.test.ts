import {act, renderHook} from '@testing-library/react-native';
import useInlineEditState from '@components/Table/EditableCell/useInlineEditState';

describe('useInlineEditState', () => {
    it('starts with isEditing=false and localValue equal to the initial value', () => {
        const {result} = renderHook(() => useInlineEditState<string>('hello'));

        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('hello');
    });

    it('startEditing sets isEditing to true', () => {
        const {result} = renderHook(() => useInlineEditState<string>('hello'));

        act(() => {
            result.current.startEditing();
        });

        expect(result.current.isEditing).toBe(true);
    });

    it('save calls onSave with the new value when localValue differs from original', () => {
        const onSave = jest.fn();
        const {result} = renderHook(() => useInlineEditState<string>('hello', onSave));

        act(() => {
            result.current.startEditing();
        });
        act(() => {
            result.current.setLocalValue('world');
        });
        act(() => {
            result.current.save();
        });

        expect(onSave).toHaveBeenCalledWith('world');
        expect(result.current.isEditing).toBe(false);
    });

    it('save does NOT call onSave when localValue equals the original value', () => {
        const onSave = jest.fn();
        const {result} = renderHook(() => useInlineEditState<string>('hello', onSave));

        act(() => {
            result.current.startEditing();
        });
        act(() => {
            result.current.save();
        });

        expect(onSave).not.toHaveBeenCalled();
        expect(result.current.isEditing).toBe(false);
    });

    it('save works without an onSave callback (no crash)', () => {
        const {result} = renderHook(() => useInlineEditState<string>('hello'));

        act(() => {
            result.current.startEditing();
        });
        act(() => {
            result.current.setLocalValue('changed');
        });

        expect(() => {
            act(() => {
                result.current.save();
            });
        }).not.toThrow();
        expect(result.current.isEditing).toBe(false);
    });

    it('cancel resets localValue to the original and sets isEditing to false', () => {
        const onSave = jest.fn();
        const {result} = renderHook(() => useInlineEditState<string>('hello', onSave));

        act(() => {
            result.current.startEditing();
        });
        act(() => {
            result.current.setLocalValue('modified');
        });
        expect(result.current.localValue).toBe('modified');

        act(() => {
            result.current.cancelEditing();
        });

        expect(result.current.localValue).toBe('hello');
        expect(result.current.isEditing).toBe(false);
        expect(onSave).not.toHaveBeenCalled();
    });

    it('cancel without prior edits still sets isEditing to false', () => {
        const {result} = renderHook(() => useInlineEditState<string>('hello'));

        act(() => {
            result.current.startEditing();
        });
        act(() => {
            result.current.cancelEditing();
        });

        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('hello');
    });

    it('syncs localValue when the external value prop changes', () => {
        let externalValue = 'initial';
        const {result, rerender} = renderHook(() => useInlineEditState<string>(externalValue));

        expect(result.current.localValue).toBe('initial');

        externalValue = 'updated';
        rerender({});

        expect(result.current.localValue).toBe('updated');
    });

    it('works with numeric values', () => {
        const onSave = jest.fn();
        const {result} = renderHook(() => useInlineEditState<number>(42, onSave));

        act(() => {
            result.current.startEditing();
        });
        act(() => {
            result.current.setLocalValue(99);
        });
        act(() => {
            result.current.save();
        });

        expect(onSave).toHaveBeenCalledWith(99);
        expect(result.current.isEditing).toBe(false);
    });
});
