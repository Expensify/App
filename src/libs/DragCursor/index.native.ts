import type DragCursorModule from './types';

// There is no pointer cursor on native, so both of these are no-ops.
function show() {}
function hide() {}

const DragCursor: DragCursorModule = {
    show,
    hide,
};

export default DragCursor;
