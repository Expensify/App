import {act, renderHook} from '@testing-library/react-native';

import useInlineEditState from '@components/TransactionItemRow/EditableCell/useInlineEditState';
import usePopoverEditState from '@components/TransactionItemRow/EditableCell/usePopoverEditState';

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
};

type InlineHookProps = {
    value: InlineHookParameters[1];
    canEdit: NonNullable<InlineHookParameters[0]>;
};

const setupInline = (value: string, {canEdit = true, onSave, isEqual}: InlineSetupOptions = {}) =>
    renderHook(({value: currentValue, canEdit: currentCanEdit}: InlineHookProps) => useInlineEditState<string>(currentCanEdit, currentValue, onSave, isEqual), {
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
            mockWindowHeight = 900;
            const anchor = {...CELL, y: 100};
            const result = openPopoverForAnchor(anchor);

            expect(result.current.shouldOpenAbove).toBe(false);
            expect(result.current.anchorAlignment.vertical).toBe(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP);
            expect(result.current.popoverPosition).toEqual({horizontal: anchor.x, vertical: anchor.y + anchor.height + PADDING});
            expect(result.current.popoverHeight).toBe(PREFERRED_HEIGHT);
            expect(result.current.isPopoverVisible).toBe(true);
        });

        it('flips fully above the cell, bottom-edge aligned, when it does not fit below but fits above', () => {
            mockWindowHeight = 900;
            const anchor = {...CELL, y: 600};
            const result = openPopoverForAnchor(anchor);

            expect(result.current.shouldOpenAbove).toBe(true);
            expect(result.current.anchorAlignment.vertical).toBe(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM);
            // The bottom edge of the popover sits `PADDING` above the top of the cell, so the cell stays visible
            expect(result.current.popoverPosition.vertical).toBe(anchor.y - PADDING);
            expect(result.current.popoverHeight).toBe(PREFERRED_HEIGHT);
        });

        it('shrinks to the space above when neither side fits and above has more room', () => {
            mockWindowHeight = 500;
            const anchor = {...CELL, y: 300};
            const result = openPopoverForAnchor(anchor);

            const spaceAbove = anchor.y - PADDING - PADDING;
            expect(result.current.shouldOpenAbove).toBe(true);
            expect(result.current.anchorAlignment.vertical).toBe(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM);
            expect(result.current.popoverHeight).toBe(spaceAbove);
            expect(result.current.popoverHeight).toBeLessThan(PREFERRED_HEIGHT);
            // The popover still ends above the cell and starts inside the window
            expect(result.current.popoverPosition.vertical).toBe(anchor.y - PADDING);
            expect(result.current.popoverPosition.vertical - result.current.popoverHeight).toBeGreaterThanOrEqual(0);
        });

        it('shrinks to fit below rather than flipping when below has more room than above', () => {
            mockWindowHeight = 500;
            const anchor = {...CELL, y: 100};
            const result = openPopoverForAnchor(anchor);

            const spaceBelow = mockWindowHeight - (anchor.y + anchor.height + PADDING) - PADDING;
            expect(result.current.shouldOpenAbove).toBe(false);
            expect(result.current.anchorAlignment.vertical).toBe(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP);
            expect(result.current.popoverHeight).toBe(spaceBelow);
            expect(result.current.popoverPosition.vertical).toBe(anchor.y + anchor.height + PADDING);
        });

        it('stops shrinking at the minimum usable height on an extremely short window', () => {
            mockWindowHeight = 300;
            const anchor = {...CELL, y: 150};
            const result = openPopoverForAnchor(anchor);

            const spaceAbove = anchor.y - PADDING - PADDING;
            expect(spaceAbove).toBeLessThan(MIN_HEIGHT);
            expect(result.current.popoverHeight).toBe(MIN_HEIGHT);
        });

        it('uses the caller-provided preferred height to pick the side to open on', () => {
            mockWindowHeight = 928;
            const anchor = {...CELL, y: 500};
            const result = openPopoverForAnchor(anchor, {popoverHeight: CONST.POPOVER_DATE_MAX_HEIGHT});

            // 380px are free below the cell: too little for the 416px dropdown, but enough for the 366px calendar
            expect(result.current.shouldOpenAbove).toBe(false);
            expect(result.current.anchorAlignment.vertical).toBe(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP);
            expect(result.current.popoverHeight).toBe(CONST.POPOVER_DATE_MAX_HEIGHT);
        });

        it('anchors to the right edge of the cell when anchorEdge is RIGHT', () => {
            mockWindowHeight = 900;
            const anchor = {...CELL, y: 100};
            const result = openPopoverForAnchor(anchor, {anchorEdge: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT});

            expect(result.current.anchorAlignment.horizontal).toBe(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT);
            expect(result.current.popoverPosition.horizontal).toBe(anchor.x + anchor.width);
        });
    });
});
