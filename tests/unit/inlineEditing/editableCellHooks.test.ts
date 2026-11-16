import {act, renderHook} from '@testing-library/react-native';

import useInlineEditState from '@components/EditableCell/useInlineEditState';
import usePopoverEditState from '@components/EditableCell/usePopoverEditState';

import CONST from '@src/CONST';

import type {View} from 'react-native';

import createMock from '../../utils/createMock';

let mockWindowHeight = 900;

jest.mock('@hooks/useWindowDimensions', () => () => ({windowHeight: mockWindowHeight}));

// The hook opens the popover inside a requestAnimationFrame callback, so run it synchronously to keep the tests simple.
jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
    callback(0);
    return 0;
});

const PADDING = CONST.MODAL.POPOVER_MENU_PADDING;
const PREFERRED_HEIGHT = CONST.POPOVER_DROPDOWN_MAX_HEIGHT;
const MIN_HEIGHT = CONST.POPOVER_DROPDOWN_MIN_USABLE_HEIGHT;

type MeasureInWindow = (callback: (x: number, y: number, width: number, height: number) => void) => void;

/** Measurements of the anchor cell, as `measureInWindow` would report them */
type AnchorRect = {x: number; y: number; width: number; height: number};

const CELL: AnchorRect = {x: 50, y: 0, width: 120, height: 32};

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

/** Renders the hook with its anchor measurement stubbed out to `anchor`, then opens the popover */
const openPopoverForAnchor = (anchor: AnchorRect, options: PopoverSetupOptions<string> = {}) => {
    const measureInWindow: MeasureInWindow = (callback) => callback(anchor.x, anchor.y, anchor.width, anchor.height);
    const {result} = setupPopover<string>({value: 'hello', ...options});

    result.current.anchorRef.current = createMock<View>({measureInWindow});
    act(() => result.current.startEditing());

    return result;
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

    it('keeps the draft when the external value changes while editing', () => {
        // Given an open editor holding a value the user typed
        const {result, rerender} = setupInline('initial');

        startInlineEditing(result);
        setInlineValue(result, 'draft');

        expect(result.current.localValue).toBe('draft');

        // When an external update lands mid-edit
        rerender({value: 'updated externally', canEdit: true});

        // Then the draft survives, because overwriting it would make the next blur read the edit as unchanged and drop it
        expect(result.current.isEditing).toBe(true);
        expect(result.current.localValue).toBe('draft');

        // When the user cancels out of the editor
        act(() => result.current.cancelEditing());

        // Then the cell catches up to the newer value it skipped while the editor was open
        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('updated externally');
    });

    it('saves the draft after an external update changed the value mid-edit', () => {
        // Given an edit typed over a value that an external update has since changed
        const onSave = jest.fn();
        const {result, rerender} = setupInline('initial', {onSave});

        startInlineEditing(result);
        setInlineValue(result, 'draft');
        rerender({value: 'updated externally', canEdit: true});

        // When the user commits the edit
        saveInline(result);

        // Then what they typed is what gets written, rather than being swallowed as a no-op
        expect(onSave).toHaveBeenCalledWith('draft');
        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('updated externally');
    });

    it('adopts an external update when the editor is open but untouched, so blur does not write the stale value', () => {
        // Given an open editor the user has not typed in
        const onSave = jest.fn();
        const {result, rerender} = setupInline('old', {onSave});

        startInlineEditing(result);

        // When an external rename lands before the user changes anything
        rerender({value: 'renamed', canEdit: true});

        // Then the open editor shows the rename instead of the stale buffer
        expect(result.current.isEditing).toBe(true);
        expect(result.current.localValue).toBe('renamed');

        // When the user blurs
        saveInline(result);

        // Then the stale buffer is not written back over the rename
        expect(onSave).not.toHaveBeenCalled();
        expect(result.current.isEditing).toBe(false);
        expect(result.current.localValue).toBe('renamed');
    });

    it('adopts an external update when the open edit only differs by the caller equality check', () => {
        // Given an open editor whose buffer matches the original once normalized, the way "1.00" matches "1"
        const onSave = jest.fn();
        const isEqual = (newValue: string, originalValue: string) => Number(newValue) === Number(originalValue);
        const {result, rerender} = setupInline('1', {onSave, isEqual});

        startInlineEditing(result);
        setInlineValue(result, '1.00');

        // When an external update lands
        rerender({value: '2', canEdit: true});

        // Then the normalized edit is not held as a draft
        expect(result.current.localValue).toBe('2');

        // When the user blurs
        saveInline(result);

        // Then "1.00" is not written back over the update
        expect(onSave).not.toHaveBeenCalled();
        expect(result.current.localValue).toBe('2');
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

        // When the user cancels the confirm modal
        await act(async () => {
            resolveSave(false);
        });

        // Then the editor closes and the draft is dropped, so leaving the field cannot open the same modal again
        expect(result.current.isEditing).toBe(false);
        expect(result.current.isAwaitingConfirm).toBe(false);
        expect(result.current.localValue).toBe('10');
        expect(onKeepEditing).not.toHaveBeenCalled();
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
    beforeEach(() => {
        mockWindowHeight = 900;
    });

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

    describe('positioning', () => {
        it('opens below the cell at full height when there is enough room below', () => {
            // Given a cell near the top of a tall window, which leaves room for the full-height popover below it
            mockWindowHeight = 900;
            const anchor = {...CELL, y: 100};

            // When the user starts editing the cell
            const result = openPopoverForAnchor(anchor);

            // Then the popover opens below the cell at its preferred height, because below is the default side
            expect(result.current.shouldOpenAbove).toBe(false);
            expect(result.current.anchorAlignment.vertical).toBe(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP);
            expect(result.current.popoverPosition).toEqual({horizontal: anchor.x, vertical: anchor.y + anchor.height + PADDING});
            expect(result.current.popoverHeight).toBe(PREFERRED_HEIGHT);
            expect(result.current.isPopoverVisible).toBe(true);
        });

        it('flips fully above the cell, bottom-edge aligned, when it does not fit below but fits above', () => {
            // Given a cell low in the window, with too little room below for the popover but enough above it
            mockWindowHeight = 900;
            const anchor = {...CELL, y: 600};

            // When the user starts editing the cell
            const result = openPopoverForAnchor(anchor);

            // Then the popover opens above the cell at full height, so it doesn't cover the cell being edited
            expect(result.current.shouldOpenAbove).toBe(true);
            expect(result.current.anchorAlignment.vertical).toBe(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM);
            expect(result.current.popoverPosition.vertical).toBe(anchor.y - PADDING);
            expect(result.current.popoverHeight).toBe(PREFERRED_HEIGHT);
        });

        it('shrinks to the space above when neither side fits and above has more room', () => {
            // Given a short window where the popover fits on neither side of the cell, and above has more room
            mockWindowHeight = 500;
            const anchor = {...CELL, y: 300};

            // When the user starts editing the cell
            const result = openPopoverForAnchor(anchor);

            // Then the popover opens above and shrinks to that space, because the roomier side shows the most options
            const spaceAbove = anchor.y - PADDING - PADDING;
            expect(result.current.shouldOpenAbove).toBe(true);
            expect(result.current.anchorAlignment.vertical).toBe(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM);
            expect(result.current.popoverHeight).toBe(spaceAbove);
            expect(result.current.popoverHeight).toBeLessThan(PREFERRED_HEIGHT);
            expect(result.current.popoverPosition.vertical).toBe(anchor.y - PADDING);
            expect(result.current.popoverPosition.vertical - result.current.popoverHeight).toBeGreaterThanOrEqual(0);
        });

        it('shrinks to fit below rather than flipping when below has more room than above', () => {
            // Given a short window where the popover fits on neither side of the cell, and below has more room
            mockWindowHeight = 500;
            const anchor = {...CELL, y: 100};

            // When the user starts editing the cell
            const result = openPopoverForAnchor(anchor);

            // Then the popover stays below and shrinks to that space, because flipping would leave even less room
            const spaceBelow = mockWindowHeight - (anchor.y + anchor.height + PADDING) - PADDING;
            expect(result.current.shouldOpenAbove).toBe(false);
            expect(result.current.anchorAlignment.vertical).toBe(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP);
            expect(result.current.popoverHeight).toBe(spaceBelow);
            expect(result.current.popoverPosition.vertical).toBe(anchor.y + anchor.height + PADDING);
        });

        it('stops shrinking at the minimum usable height on an extremely short window', () => {
            // Given a window so short that the space on either side of the cell is below the minimum usable height
            mockWindowHeight = 300;
            const anchor = {...CELL, y: 150};

            // When the user starts editing the cell
            const result = openPopoverForAnchor(anchor);

            // Then the popover keeps the minimum usable height, because a smaller list would be too cramped to use
            const spaceAbove = anchor.y - PADDING - PADDING;
            expect(spaceAbove).toBeLessThan(MIN_HEIGHT);
            expect(result.current.popoverHeight).toBe(MIN_HEIGHT);
        });

        it('uses the caller-provided preferred height to pick the side to open on', () => {
            // Given a cell with 380px free below it, which is too little for the 416px dropdown but enough for the 366px calendar
            mockWindowHeight = 928;
            const anchor = {...CELL, y: 500};

            // When the calendar opens and passes its own height
            const result = openPopoverForAnchor(anchor, {popoverHeight: CONST.POPOVER_DATE_MAX_HEIGHT});

            // Then it opens below at its own height, because the side is picked from the real popover height
            expect(result.current.shouldOpenAbove).toBe(false);
            expect(result.current.anchorAlignment.vertical).toBe(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP);
            expect(result.current.popoverHeight).toBe(CONST.POPOVER_DATE_MAX_HEIGHT);
        });

        it('keeps a preferred height below the minimum usable height instead of growing it', () => {
            // Given a short picker, like the two-role member picker, whose content is shorter than the minimum usable height
            const shortListHeight = MIN_HEIGHT - 40;
            mockWindowHeight = 300;
            const anchor = {...CELL, y: 150};

            // When it opens on a window too short to fit even the minimum usable height
            const result = openPopoverForAnchor(anchor, {popoverHeight: shortListHeight});

            // Then it keeps its own height, because the minimum only limits how far a taller picker shrinks
            expect(result.current.popoverHeight).toBe(shortListHeight);
        });

        it('anchors to the right edge of the cell when anchorEdge is RIGHT', () => {
            // Given a cell in a right-aligned column, where the popover should line up with the cell's right edge
            mockWindowHeight = 900;
            const anchor = {...CELL, y: 100};

            // When the user starts editing the cell with a RIGHT anchor edge
            const result = openPopoverForAnchor(anchor, {anchorEdge: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT});

            // Then the popover is anchored to the right edge of the cell instead of the left
            expect(result.current.anchorAlignment.horizontal).toBe(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT);
            expect(result.current.popoverPosition.horizontal).toBe(anchor.x + anchor.width);
        });
    });
});
