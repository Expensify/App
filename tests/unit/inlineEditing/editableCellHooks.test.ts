import {act, renderHook} from '@testing-library/react-native';

import useInlineEditState from '@components/EditableCell/useInlineEditState';
import usePopoverEditState from '@components/EditableCell/usePopoverEditState';

type InlineHookParameters = Parameters<typeof useInlineEditState<string>>;

type InlineSetupOptions = {
    canEdit?: InlineHookParameters[0];
    onSave?: InlineHookParameters[2];
    isEqual?: InlineHookParameters[3];
    onKeepEditing?: InlineHookParameters[4];
};

type InlineHookProps = {
    value: InlineHookParameters[1];
    canEdit: NonNullable<InlineHookParameters[0]>;
};

const setupInline = (value: string, {canEdit = true, onSave, isEqual, onKeepEditing}: InlineSetupOptions = {}) =>
    renderHook(({value: currentValue, canEdit: currentCanEdit}: InlineHookProps) => useInlineEditState<string>(currentCanEdit, currentValue, onSave, isEqual, onKeepEditing), {
        initialProps: {value, canEdit},
    });

type InlineHookResult = ReturnType<typeof setupInline>['result'];

const startInlineEditing = (result: InlineHookResult) => {
    act(() => result.current.startEditing());
};

const setInlineValue = (result: InlineHookResult, value: string) => {
    act(() => result.current.setLocalValue(value));
};

const saveInline = (result: InlineHookResult) => {
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

    it('keeps the typed value on screen while onSave is waiting for confirmation', async () => {
        // Given a save that must wait for a confirm modal before the edit is allowed to close
        let resolveSave: (shouldClose: boolean) => void = () => {};
        const onSave = jest.fn(
            () =>
                new Promise<boolean>((resolve) => {
                    resolveSave = resolve;
                }),
        );
        const onKeepEditing = jest.fn();
        const {result} = setupInline('10', {onSave, onKeepEditing});

        startInlineEditing(result);
        setInlineValue(result, '0');

        // When the user commits the edit and blur from the modal commits it again
        act(() => {
            result.current.save();
            result.current.save();
        });

        // Then the draft stays visible and onSave runs once, because closing now would hide the typed amount behind the modal
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith('0');
        expect(result.current.isEditing).toBe(true);
        expect(result.current.isAwaitingConfirm).toBe(true);
        expect(result.current.localValue).toBe('0');
        expect(onKeepEditing).not.toHaveBeenCalled();

        // When confirmation is declined
        await act(async () => {
            resolveSave(false);
        });

        // Then the editor stays open and focus can return to the input, because the limit was not written
        expect(result.current.isEditing).toBe(true);
        expect(result.current.isAwaitingConfirm).toBe(false);
        expect(result.current.localValue).toBe('0');
        expect(onKeepEditing).toHaveBeenCalledTimes(1);
    });

    it('closes the editor after a deferred save is confirmed', async () => {
        // Given a save that waits for confirmation before writing
        let resolveSave: (shouldClose: boolean) => void = () => {};
        const onSave = jest.fn(
            () =>
                new Promise<boolean>((resolve) => {
                    resolveSave = resolve;
                }),
        );
        const onKeepEditing = jest.fn();
        const {result} = setupInline('10', {onSave, onKeepEditing});

        startInlineEditing(result);
        setInlineValue(result, '0');
        act(() => result.current.save());

        // When the user confirms the change
        await act(async () => {
            resolveSave(true);
        });

        // Then the editor closes back to the stored value, because the write is no longer deferred
        expect(result.current.isEditing).toBe(false);
        expect(result.current.isAwaitingConfirm).toBe(false);
        expect(result.current.localValue).toBe('10');
        expect(onKeepEditing).not.toHaveBeenCalled();
    });

    it('cancels a declined confirmation when editing permission was revoked while the modal was open', async () => {
        // Given an edit that is waiting on a confirm modal
        let resolveSave: (shouldClose: boolean) => void = () => {};
        const onSave = jest.fn(
            () =>
                new Promise<boolean>((resolve) => {
                    resolveSave = resolve;
                }),
        );
        const {result, rerender} = setupInline('10', {onSave});

        startInlineEditing(result);
        setInlineValue(result, '0');
        act(() => result.current.save());

        // When permission is revoked while the modal is still open and the user then declines
        rerender({value: '10', canEdit: false});
        expect(result.current.isEditing).toBe(true);

        await act(async () => {
            resolveSave(false);
        });

        // Then the editor closes instead of reopening on a cell the user may no longer edit
        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('10');
    });

    it('stays open when onSave rejects the edit immediately', () => {
        // Given a save that refuses to close, the way a caller does when it still needs the typed value
        const onSave = jest.fn(() => false);
        const onKeepEditing = jest.fn();
        const {result} = setupInline('10', {onSave, onKeepEditing});

        startInlineEditing(result);
        setInlineValue(result, '0');

        // When the user commits the edit
        saveInline(result);

        // Then the editor stays on the typed value so the field does not snap back
        expect(onSave).toHaveBeenCalledWith('0');
        expect(result.current.isEditing).toBe(true);
        expect(result.current.localValue).toBe('0');
        expect(onKeepEditing).toHaveBeenCalledTimes(1);
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
