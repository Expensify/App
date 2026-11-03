import type {ViewStyle} from 'react-native';

import type CursorStyles from './types';

type WebCursor =
    | 'default'
    | 'not-allowed'
    | 'pointer'
    | 'move'
    | 'unset'
    | 'auto'
    | 'zoom-in'
    | 'grab'
    | 'grabbing'
    | 'zoom-out'
    | 'initial'
    | 'text'
    | 'ew-resize'
    | 'col-resize'
    | 'ns-resize'
    | 'nesw-resize'
    | 'nwse-resize';

/** React Native's CursorValue only lists cursors native platforms support, but web renders any CSS cursor. */
function getWebCursor(value: WebCursor): Pick<ViewStyle, 'cursor'> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- web-only file, so native's narrower CursorValue doesn't apply
    return {cursor: value as ViewStyle['cursor']};
}

/**
 * Web-only style.
 */
const cursor: CursorStyles = {
    cursorDefault: getWebCursor('default'),
    cursorDisabled: getWebCursor('not-allowed'),
    cursorPointer: getWebCursor('pointer'),
    cursorMove: getWebCursor('move'),
    cursorUnset: getWebCursor('unset'),
    cursorAuto: getWebCursor('auto'),
    cursorZoomIn: getWebCursor('zoom-in'),
    cursorGrab: getWebCursor('grab'),
    cursorGrabbing: getWebCursor('grabbing'),
    cursorZoomOut: getWebCursor('zoom-out'),
    cursorInitial: getWebCursor('initial'),
    cursorText: getWebCursor('text'),
    cursorEwResize: getWebCursor('ew-resize'),
    cursorColResize: getWebCursor('col-resize'),
    cursorNsResize: getWebCursor('ns-resize'),
    cursorNeswResize: getWebCursor('nesw-resize'),
    cursorNwseResize: getWebCursor('nwse-resize'),
};

export default cursor;
