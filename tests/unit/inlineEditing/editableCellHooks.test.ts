import {act, renderHook} from '@testing-library/react-native';

import useInlineEditState from '@components/TransactionItemRow/EditableCell/useInlineEditState';
import usePopoverEditState from '@components/TransactionItemRow/EditableCell/usePopoverEditState';

type InlineHookParameters<T> = Parameters<typeof useInlineEditState<T>>;

type InlineSetupOptions<T> = {
    canEdit?: InlineHookParameters<T>[0];
    onSave?: InlineHookParameters<T>[2];
    isEqual?: InlineHookParameters<T>[3];
};

type WidenLiteral<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : T;

type InlineHookProps<T> = {
    value: InlineHookParameters<T>[1];
    canEdit: NonNullable<InlineHookParameters<T>[0]>;
};

const setupInline = <T>(value: T, {canEdit = true, onSave, isEqual}: InlineSetupOptions<WidenLiteral<T>> = {}) =>
    renderHook(({value: currentValue, canEdit: currentCanEdit}: InlineHookProps<WidenLiteral<T>>) => useInlineEditState<WidenLiteral<T>>(currentCanEdit, currentValue, onSave, isEqual), {
        initialProps: {value: value as WidenLiteral<T>, canEdit},
    });

type InlineHookResult<T> = ReturnType<typeof setupInline<T>>['result'];

const startInlineEditing = <T>(result: InlineHookResult<T>) => {
    act(() => result.current.startEditing());
};

const setInlineValue = <T>(result: InlineHookResult<T>, value: WidenLiteral<T>) => {
    act(() => result.current.setLocalValue(value));
};

const saveInline = <T>(result: InlineHookResult<T>) => {
    act(() => result.current.save());
};

type PopoverSetupOptions<T> = Partial<Parameters<typeof usePopoverEditState<T>>[0]>;
type PopoverHookResult<T> = ReturnType<typeof setupPopover<T>>['result'];

const setupPopover = <T>(options: PopoverSetupOptions<T> = {}) => renderHook(() => usePopoverEditState<T>({canEdit: true, ...options}));

const handlePopoverSave = <T>(result: PopoverHookResult<T>, value: T) => {
    act(() => result.current.handleSave(value));
};

describe('useInlineEditState', () => {
    it('starts with isEditing=false and localValue equal to the initial value', () => {
        const {result} = setupInline('hello');

        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('hello');
    });

    it('save calls onSave with the new value when localValue differs from original', () => {
        const onSave = jest.fn();
        const {result} = setupInline('hello', {onSave});

        startInlineEditing(result);
        setInlineValue(result, 'world');
        saveInline(result);

        expect(onSave).toHaveBeenCalledWith('world');
        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('hello');
    });

    it('save does not call onSave when localValue matches the original value', () => {
        const onSave = jest.fn();
        const {result} = setupInline('hello', {onSave});

        startInlineEditing(result);
        saveInline(result);

        expect(onSave).not.toHaveBeenCalled();
        expect(result.current.isEditing).toBe(false);
    });

    it('uses isEqual to skip redundant saves after normalization', () => {
        const onSave = jest.fn();
        const isEqual = jest.fn((newValue: string, originalValue: string) => newValue.trim() === originalValue.trim());
        const {result} = setupInline('hello', {onSave, isEqual});

        startInlineEditing(result);
        setInlineValue(result, ' hello ');
        saveInline(result);

        expect(onSave).not.toHaveBeenCalled();
        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('hello');
    });

    it('calls onSave when isEqual returns false', () => {
        const onSave = jest.fn();
        const isEqual = jest.fn((newValue: string, originalValue: string) => newValue.length === originalValue.length);
        const {result} = setupInline('hello', {onSave, isEqual});

        startInlineEditing(result);
        setInlineValue(result, 'world!');
        saveInline(result);

        expect(isEqual).toHaveBeenCalledWith('world!', 'hello');
        expect(onSave).toHaveBeenCalledWith('world!');
        expect(result.current.localValue).toBe('hello');
    });

    it('save exits cleanly when onSave is undefined and the value changed', () => {
        const {result} = setupInline('hello');

        startInlineEditing(result);
        setInlineValue(result, 'changed');

        expect(() => saveInline(result)).not.toThrow();
        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('hello');
    });

    it('cancel resets localValue to the original and sets isEditing to false', () => {
        const onSave = jest.fn();
        const {result} = setupInline('hello', {onSave});

        startInlineEditing(result);
        setInlineValue(result, 'modified');
        expect(result.current.localValue).toBe('modified');

        act(() => result.current.cancelEditing());

        expect(result.current.localValue).toBe('hello');
        expect(result.current.isEditing).toBe(false);
        expect(onSave).not.toHaveBeenCalled();
    });

    it('syncs localValue when the external value prop changes', () => {
        const {result, rerender} = setupInline('initial');

        expect(result.current.localValue).toBe('initial');

        rerender({value: 'updated', canEdit: true});

        expect(result.current.localValue).toBe('updated');
    });

    it('syncs localValue to the external value even while editing', () => {
        const {result, rerender} = setupInline('initial');

        startInlineEditing(result);
        setInlineValue(result, 'draft');

        expect(result.current.localValue).toBe('draft');

        rerender({value: 'updated externally', canEdit: true});

        expect(result.current.isEditing).toBe(true);
        expect(result.current.localValue).toBe('updated externally');
    });

    it('cancels editing when canEdit becomes false while editing', () => {
        const onSave = jest.fn();
        const {result, rerender} = setupInline('hello', {canEdit: true, onSave});

        startInlineEditing(result);

        expect(result.current.isEditing).toBe(true);

        setInlineValue(result, 'modified');

        rerender({value: 'hello', canEdit: false});

        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('hello');
        expect(onSave).not.toHaveBeenCalled();
    });

    it('prevents duplicate onSave calls when save is called multiple times', () => {
        const onSave = jest.fn();
        const {result} = setupInline('hello', {onSave});

        startInlineEditing(result);
        setInlineValue(result, 'world');

        act(() => {
            result.current.save();
            result.current.save();
        });

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith('world');
    });

    it('ignores cancelEditing after save has already ended editing', () => {
        const onSave = jest.fn();
        const {result} = setupInline('hello', {onSave});

        startInlineEditing(result);
        setInlineValue(result, 'world');

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
        const {result} = setupInline('hello', {onSave});

        startInlineEditing(result);
        setInlineValue(result, 'world');

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
        const {result} = setupInline('hello', {canEdit: false, onSave});

        startInlineEditing(result);

        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('hello');
        expect(onSave).not.toHaveBeenCalled();
    });
});

describe('usePopoverEditState', () => {
    it('starts with isEditing=false and isPopoverVisible=false', () => {
        const {result} = setupPopover({value: 'hello'});

        expect(result.current.isEditing).toBe(false);
        expect(result.current.isPopoverVisible).toBe(false);
    });

    it('does not call onSave when selecting the same value multiple times', () => {
        const onSave = jest.fn();
        const {result} = setupPopover({value: 'hello', onSave});

        handlePopoverSave(result, 'hello');
        handlePopoverSave(result, 'hello');
        handlePopoverSave(result, 'hello');

        expect(onSave).not.toHaveBeenCalled();
        expect(result.current.isPopoverVisible).toBe(false);
    });

    it('calls onSave when selecting a different value', () => {
        const onSave = jest.fn();
        const {result} = setupPopover({value: 'hello', onSave});

        handlePopoverSave(result, 'world');

        expect(onSave).toHaveBeenCalledWith('world');
        expect(result.current.isPopoverVisible).toBe(false);
    });
});
