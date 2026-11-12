import type RHPResizeHandleProps from './types';

/** The RHP is full-screen on native, so there's no edge to drag. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- shares the web props, whose ref has no element to point at here
function RHPResizeHandle(_props: RHPResizeHandleProps) {
    return null;
}

export default RHPResizeHandle;
