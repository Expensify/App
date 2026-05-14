import {act, renderHook} from '@testing-library/react-native';
import type {Dispatch, SetStateAction} from 'react';
import useInlineEditState from '@components/Table/EditableCell/useInlineEditState';

type SetupOptions<T> = {
    canEdit?: boolean;
    onSave?: (value: T) => void;
    isEqual?: (newValue: T, originalValue: T) => boolean;
};

type WidenLiteral<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : T;

type HookProps<T> = {
    value: T;
    canEdit: boolean;
};

type HookResult<T> = {
    current: {
        isEditing: boolean;
        localValue: T;
        setLocalValue: Dispatch<SetStateAction<T>>;
        startEditing: () => void;
        save: () => void;
        cancelEditing: () => void;
    };
};

const setup = <T>(value: T, {canEdit = true, onSave, isEqual}: SetupOptions<WidenLiteral<T>> = {}) =>
    renderHook(({value: currentValue, canEdit: currentCanEdit}: HookProps<WidenLiteral<T>>) => useInlineEditState<WidenLiteral<T>>(currentCanEdit, currentValue, onSave, isEqual), {
        initialProps: {value: value as WidenLiteral<T>, canEdit},
    });

const startEditing = <T>(result: HookResult<T>) => {
    act(() => result.current.startEditing());
};

const setValue = <T>(result: HookResult<T>, value: T) => {
    act(() => result.current.setLocalValue(value));
};

const save = <T>(result: HookResult<T>) => {
    act(() => result.current.save());
};

const cancelEditing = <T>(result: HookResult<T>) => {
    act(() => result.current.cancelEditing());
};

describe('useInlineEditState', () => {
    it('starts with isEditing=false and localValue equal to the initial value', () => {
        const {result} = setup('hello');

        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('hello');
    });

    it('save calls onSave with the new value when localValue differs from original', () => {
        const onSave = jest.fn();
        const {result} = setup('hello', {onSave});

        startEditing(result);
        setValue(result, 'world');
        save(result);

        expect(onSave).toHaveBeenCalledWith('world');
        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('hello');
    });

    it('save does not call onSave when localValue matches the original value', () => {
        const onSave = jest.fn();
        const {result} = setup('hello', {onSave});

        startEditing(result);
        save(result);

        expect(onSave).not.toHaveBeenCalled();
        expect(result.current.isEditing).toBe(false);
    });

    it('uses isEqual to skip redundant saves after normalization', () => {
        const onSave = jest.fn();
        const isEqual = jest.fn((newValue: string, originalValue: string) => newValue.trim() === originalValue.trim());
        const {result} = setup('hello', {onSave, isEqual});

        startEditing(result);
        setValue(result, ' hello ');
        save(result);

        expect(onSave).not.toHaveBeenCalled();
        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('hello');
    });

    it('calls onSave when isEqual returns false', () => {
        const onSave = jest.fn();
        const isEqual = jest.fn((newValue: string, originalValue: string) => newValue.length === originalValue.length);
        const {result} = setup('hello', {onSave, isEqual});

        startEditing(result);
        setValue(result, 'world!');
        save(result);

        expect(isEqual).toHaveBeenCalledWith('world!', 'hello');
        expect(onSave).toHaveBeenCalledWith('world!');
        expect(result.current.localValue).toBe('hello');
    });

    it('save exits cleanly when onSave is undefined and the value changed', () => {
        const {result} = setup('hello');

        startEditing(result);
        setValue(result, 'changed');

        expect(() => save(result)).not.toThrow();
        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('hello');
    });

    it('cancel resets localValue to the original and sets isEditing to false', () => {
        const onSave = jest.fn();
        const {result} = setup('hello', {onSave});

        startEditing(result);
        setValue(result, 'modified');
        expect(result.current.localValue).toBe('modified');

        cancelEditing(result);

        expect(result.current.localValue).toBe('hello');
        expect(result.current.isEditing).toBe(false);
        expect(onSave).not.toHaveBeenCalled();
    });

    it('syncs localValue when the external value prop changes', () => {
        const {result, rerender} = setup('initial');

        expect(result.current.localValue).toBe('initial');

        rerender({value: 'updated', canEdit: true});

        expect(result.current.localValue).toBe('updated');
    });

    it('syncs localValue to the external value even while editing', () => {
        const {result, rerender} = setup('initial');

        startEditing(result);
        setValue(result, 'draft');

        expect(result.current.localValue).toBe('draft');

        rerender({value: 'updated externally', canEdit: true});

        expect(result.current.isEditing).toBe(true);
        expect(result.current.localValue).toBe('updated externally');
    });

    it('cancels editing when canEdit becomes false while editing', () => {
        const onSave = jest.fn();
        const {result, rerender} = setup('hello', {canEdit: true, onSave});

        startEditing(result);

        expect(result.current.isEditing).toBe(true);

        setValue(result, 'modified');

        rerender({value: 'hello', canEdit: false});

        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('hello');
        expect(onSave).not.toHaveBeenCalled();
    });

    it('prevents duplicate onSave calls when save is called multiple times', () => {
        const onSave = jest.fn();
        const {result} = setup('hello', {onSave});

        startEditing(result);
        setValue(result, 'world');

        act(() => {
            result.current.save();
            result.current.save();
        });

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith('world');
    });

    it('ignores cancelEditing after save has already ended editing', () => {
        const onSave = jest.fn();
        const {result} = setup('hello', {onSave});

        startEditing(result);
        setValue(result, 'world');

        act(() => {
            result.current.save();
            result.current.cancelEditing();
        });

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith('world');
        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('hello');
    });

    it('ignores save after cancelEditing has already ended editing', () => {
        const onSave = jest.fn();
        const {result} = setup('hello', {onSave});

        startEditing(result);
        setValue(result, 'world');

        act(() => {
            result.current.cancelEditing();
            result.current.save();
        });

        expect(onSave).not.toHaveBeenCalled();
        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('hello');
    });

    it('auto-cancels after starting to edit when canEdit is already false', () => {
        const onSave = jest.fn();
        const {result} = setup('hello', {canEdit: false, onSave});

        startEditing(result);

        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('hello');
        expect(onSave).not.toHaveBeenCalled();
    });
});
