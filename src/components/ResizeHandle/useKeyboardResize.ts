/**
 * Resizing from a focused handle on web: the arrow keys move its edge in fixed steps, and Enter or Space do what a click
 * does. Shared by panes and table columns, so both read the same to assistive technology.
 */
import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import type React from 'react';
import type {RefObject} from 'react';

import getDraggedSize from './getDraggedSize';
import getKeyboardResizeAction from './getKeyboardResizeAction';

/** Arrow-key size painted on a handle's target but not stored yet. */
type KeyboardResize<Target> = {
    target: Target;

    /** The size before the first arrow press. */
    startSize: number;

    /** The size the last arrow press painted. */
    size: number;
};

type UseKeyboardResizeParams<Target> = {
    /**
     * The arrow-key size not stored yet, `null` at rest. Owned by the caller, so code set up before this hook can read it,
     * e.g. to keep painted sizes through renders while it's set.
     */
    keyboardResizeRef: RefObject<KeyboardResize<Target> | null>;

    /** A drag owns the size until it ends, so keys do nothing meanwhile. */
    isDragging: () => boolean;

    /** The size the first arrow press steps from, `undefined` when there's none yet. */
    readSize: (target: Target) => number | undefined;

    /** The handle sits on its target's left edge, so the left arrow widens the target. */
    isLeftEdge?: boolean;

    /** The same bounds a drag is held to. */
    getBounds: (target: Target) => {min: number; max?: number};

    /** Paints a size ahead of React. The size is stored once the key is released. */
    paintSize: (target: Target, size: number) => void;

    /** Stores the size the arrow keys painted. */
    settleSize: (keyboardResize: KeyboardResize<Target>) => void;

    /** Enter or Space, which do what a click does. */
    onActivate: (target: Target) => void;

    /** The handle took keyboard focus, or a key acted on a handle a pointer press focused, so it should show where it is. */
    onShowFocus: (handle: HTMLDivElement) => void;

    /** Called after the size the arrow keys painted is stored on blur. */
    onBlur: () => void;
};

type KeyboardResizeHandleProps = Pick<
    React.ComponentPropsWithoutRef<'div'>,
    'role' | 'tabIndex' | 'aria-orientation' | 'aria-valuenow' | 'aria-valuemin' | 'aria-valuemax' | 'aria-valuetext' | 'onKeyDown' | 'onKeyUp' | 'onFocus' | 'onBlur'
>;

type KeyboardResizeController<Target> = {
    /** Makes the handle a focusable separator holding `size`, resized by the keys. */
    getKeyboardHandleProps: (target: Target, bounds: {size: number; min: number; max: number}) => KeyboardResizeHandleProps;
};

function useKeyboardResize<Target>({
    keyboardResizeRef,
    isDragging,
    readSize,
    isLeftEdge = false,
    getBounds,
    paintSize,
    settleSize,
    onActivate,
    onShowFocus,
    onBlur,
}: UseKeyboardResizeParams<Target>): KeyboardResizeController<Target> {
    const {translate} = useLocalize();

    /** Shared by key release, blur, and Enter or Space. */
    const commitKeyboardResize = () => {
        const keyboardResize = keyboardResizeRef.current;

        if (!keyboardResize) {
            return;
        }

        // eslint-disable-next-line no-param-reassign -- the caller owns the ref, so code set up before this hook can read it
        keyboardResizeRef.current = null;
        settleSize(keyboardResize);
    };

    const stepSize = (target: Target, step: number, handle: HTMLDivElement) => {
        // Blur commits before focus reaches another handle, so this only guards against a missed blur.
        if (keyboardResizeRef.current && keyboardResizeRef.current.target !== target) {
            commitKeyboardResize();
        }

        const pendingResize = keyboardResizeRef.current;
        const size = pendingResize?.size ?? readSize(target);

        if (size === undefined) {
            return;
        }

        const steppedSize = getDraggedSize(size, step, getBounds(target));

        // A size already past the bound would otherwise jump to it, against the arrow pressed.
        if (Math.sign(steppedSize - size) !== Math.sign(step)) {
            return;
        }

        // eslint-disable-next-line no-param-reassign -- the caller owns the ref, so code set up before this hook can read it
        keyboardResizeRef.current = {target, startSize: pendingResize?.startSize ?? size, size: steppedSize};
        paintSize(target, steppedSize);

        // Nothing renders until the key is released, so screen readers would otherwise announce the old size on each press.
        handle.setAttribute('aria-valuenow', String(steppedSize));
        handle.setAttribute('aria-valuetext', translate('common.widthInPixels', {width: steppedSize}));
    };

    const resizeFromKey = (target: Target, event: React.KeyboardEvent<HTMLDivElement>) => {
        const action = getKeyboardResizeAction(event);

        if (!action || isDragging()) {
            return;
        }

        // Otherwise the arrows also scroll sideways, Space scrolls the page, and Enter reaches global shortcuts.
        event.preventDefault();
        event.stopPropagation();

        // A pointer focus shows nothing, so the first key press does.
        onShowFocus(event.currentTarget);

        if (action.type === 'step') {
            stepSize(target, isLeftEdge ? -action.step : action.step, event.currentTarget);
            return;
        }

        // Holding the key would otherwise repeat the click on every repeat.
        if (event.repeat) {
            return;
        }

        commitKeyboardResize();
        onActivate(target);
    };

    const getKeyboardHandleProps: KeyboardResizeController<Target>['getKeyboardHandleProps'] = (target, {size, min, max}) => ({
        role: CONST.ROLE.SEPARATOR,
        tabIndex: 0,
        // The DOM names these attributes, so they can't follow the naming convention.
        /* eslint-disable @typescript-eslint/naming-convention */
        'aria-orientation': 'vertical',
        'aria-valuenow': size,
        // Widened to take in a size already past a bound, which the arrow keys leave alone.
        'aria-valuemin': Math.min(min, size),
        'aria-valuemax': Math.max(max, size),
        // Screen readers otherwise announce the size as a percentage of the range.
        'aria-valuetext': translate('common.widthInPixels', {width: size}),
        /* eslint-enable @typescript-eslint/naming-convention */
        onKeyDown: (event) => resizeFromKey(target, event),
        onKeyUp: commitKeyboardResize,
        onFocus: (event) => {
            // Pointer presses focus the handle too, and show nothing until a key acts on it.
            if (!event.currentTarget.matches(':focus-visible')) {
                return;
            }

            onShowFocus(event.currentTarget);
        },
        onBlur: () => {
            commitKeyboardResize();
            onBlur();
        },
    });

    return {getKeyboardHandleProps};
}

export default useKeyboardResize;
export type {KeyboardResize};
