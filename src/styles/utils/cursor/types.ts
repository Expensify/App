import type {ViewStyle} from 'react-native';

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

type CursorStyles = Record<CursorStylesKeys, Pick<ViewStyle, 'cursor'>>;

export default CursorStyles;
