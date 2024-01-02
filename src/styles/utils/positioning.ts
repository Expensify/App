import {ViewStyle} from 'react-native';

/**
 * Positioning utilities for absolute-positioned components.
 * Everything is a multiple of 4 to coincide with the spacing utilities.
 */
export default {
    pRelative: {
        position: 'relative',
    },
    pAbsolute: {
        position: 'absolute',
    },
    /**
     * Web-only style.
     */
    pFixed: {
        // NOTE: asserting "position" to a valid type, because it isn't possible to augment "position".
        position: 'fixed' as ViewStyle['position'],
    },

    t0: {
        top: 0,
    },
    tn4: {
        top: -16,
    },
    tn8: {
        top: -32,
    },
    l0: {
        left: 0,
    },
    l1: {
        left: 4,
    },
    l2: {
        left: 8,
    },
    l8: {
        left: 32,
    },
    r0: {
        right: 0,
    },
    r2: {
        right: 8,
    },
    r4: {
        right: 16,
    },
    r8: {
        right: 32,
    },
    b0: {
        bottom: 0,
    },
    b2: {
        bottom: 8,
    },
} satisfies Record<string, ViewStyle>;
