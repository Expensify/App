import {CSSProperties} from 'react';

type CursorStylesKeys =
    | 'cursorDefault'
    | 'cursorDisabled'
    | 'cursorPointer'
    | 'cursorMove'
    | 'cursorUnset'
    | 'cursorAuto'
    | 'cursorZoomIn'
    | 'cursorGrabbing'
    | 'cursorZoomOut'
    | 'cursorInitial'
    | 'cursorText';

type CursorStyles = Record<CursorStylesKeys, Partial<Pick<CSSProperties, 'cursor'>>>;

export default CursorStyles;
