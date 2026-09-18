import type DragCursorModule from './types';

/**
 * Show the grabbing cursor on the whole app while a drag is in progress.
 *
 * This can't be done with a style on the dragged row: CSS resolves the cursor from the innermost element
 * under the pointer, and the elements you grab a row by (the row pressable, the selection checkbox) each set
 * `cursor: pointer` on themselves, so an ancestor style never wins. The `.drag-in-progress` rule in
 * `web/index.html` overrides all of them at once.
 */
function show() {
    document.body.classList.add('drag-in-progress');
}

/**
 * Restore the normal cursors once the drag ends.
 */
function hide() {
    document.body.classList.remove('drag-in-progress');
}

const DragCursor: DragCursorModule = {
    show,
    hide,
};

export default DragCursor;
