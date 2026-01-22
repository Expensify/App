import type {ViewStyle} from 'react-native';
import type CursorStyles from './types';

/**
 * Web-only style.
 * NOTE: We are asserting "cursor" to valid react-native types, because it isn't possible to augment "cursor".
 */
const cursor: CursorStyles = {
    cursorDefault: {
        cursor: 'default' as ViewStyle['cursor'],
    },
    cursorDisabled: {
        cursor: 'not-allowed' as ViewStyle['cursor'],
    },
    cursorPointer: {
        cursor: 'pointer',
    },
    cursorMove: {
        cursor: 'move' as ViewStyle['cursor'],
    },
    cursorUnset: {
        cursor: 'unset' as ViewStyle['cursor'],
    },
    cursorAuto: {
        cursor: 'auto',
    },
    cursorZoomIn: {
        cursor: 'zoom-in' as ViewStyle['cursor'],
    },
    cursorGrabbing: {
        cursor: 'grabbing' as ViewStyle['cursor'],
    },
    cursorZoomOut: {
        cursor: 'zoom-out' as ViewStyle['cursor'],
    },
    cursorInitial: {
        cursor: 'initial' as ViewStyle['cursor'],
    },
    cursorText: {
        cursor: 'text' as ViewStyle['cursor'],
    },
    cursorNwResize: {
        cursor: 'nw-resize' as ViewStyle['cursor'],
    },
    cursorNeResize: {
        cursor: 'ne-resize' as ViewStyle['cursor'],
    },
    cursorSwResize: {
        cursor: 'sw-resize' as ViewStyle['cursor'],
    },
    cursorSeResize: {
        cursor: 'se-resize' as ViewStyle['cursor'],
    },
    cursorNResize: {
        cursor: 'n-resize' as ViewStyle['cursor'],
    },
    cursorSResize: {
        cursor: 's-resize' as ViewStyle['cursor'],
    },
    cursorEResize: {
        cursor: 'e-resize' as ViewStyle['cursor'],
    },
    cursorWResize: {
        cursor: 'w-resize' as ViewStyle['cursor'],
    },
};

export default cursor;
