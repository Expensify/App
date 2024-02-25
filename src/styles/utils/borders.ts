import type {ViewStyle} from 'react-native';

/**
 * All styles should be incremented by units of 4.
 */
export default {
    br0: {
        borderRadius: 0,
    },

    br1: {
        borderRadius: 4,
    },

    br2: {
        borderRadius: 8,
    },

    br3: {
        borderRadius: 12,
    },

    br4: {
        borderRadius: 16,
    },
} satisfies Record<string, ViewStyle>;
